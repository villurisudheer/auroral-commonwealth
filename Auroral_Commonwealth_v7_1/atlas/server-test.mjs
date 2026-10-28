import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import crypto from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {eraRows} from './registry.js';
import {COUNTRIES} from '../chronicle/registry.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),port=18465,origin='http://127.0.0.1:'+port;
const child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);const clients=[];
class Socket{
 constructor(){this.buffer=Buffer.alloc(0);this.ready=false;this.messages=[];this.waiters=[]}
 static async open(){const client=new Socket();clients.push(client);client.socket=net.connect(port,'127.0.0.1');client.socket.on('data',data=>client.receive(data));client.socket.on('error',()=>{});await new Promise((resolve,reject)=>{client.socket.once('connect',resolve);client.socket.once('error',reject)});client.socket.write(`GET /ws HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${crypto.randomBytes(16).toString('base64')}\r\nSec-WebSocket-Version: 13\r\n\r\n`);await client.next(x=>x.type==='hello');return client}
 receive(chunk){this.buffer=Buffer.concat([this.buffer,chunk]);if(!this.ready){const index=this.buffer.indexOf('\r\n\r\n');if(index<0)return;assert.match(this.buffer.subarray(0,index).toString(),/101 Switching Protocols/);this.buffer=this.buffer.subarray(index+4);this.ready=true}while(this.buffer.length>=2){let length=this.buffer[1]&127,offset=2;if(length===126){if(this.buffer.length<4)return;length=this.buffer.readUInt16BE(2);offset=4}else if(length===127){if(this.buffer.length<10)return;length=Number(this.buffer.readBigUInt64BE(2));offset=10}if(this.buffer.length<offset+length)return;const opcode=this.buffer[0]&15,payload=this.buffer.subarray(offset,offset+length);this.buffer=this.buffer.subarray(offset+length);if(opcode===1){this.messages.push(JSON.parse(payload.toString()));for(const check of [...this.waiters])check()}}}
 send(obj){const payload=Buffer.from(JSON.stringify(obj)),mask=crypto.randomBytes(4);let head;if(payload.length<126)head=Buffer.from([129,128|payload.length]);else{head=Buffer.alloc(4);head[0]=129;head[1]=254;head.writeUInt16BE(payload.length,2)}for(let i=0;i<payload.length;i++)payload[i]^=mask[i%4];this.socket.write(Buffer.concat([head,mask,payload]))}
 next(predicate){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.waiters=this.waiters.filter(f=>f!==check);reject(Error('Multiplayer timeout '+output))},5000);const check=()=>{const i=this.messages.findIndex(predicate);if(i>=0){clearTimeout(timer);this.waiters=this.waiters.filter(f=>f!==check);resolve(this.messages.splice(i,1)[0])}};this.waiters.push(check);check()})}
}
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timeout '+output)),5000);child.stdout.on('data',()=>{if(output.includes('For internet multiplayer')){clearTimeout(timer);resolve()}});child.once('error',reject)});
 const health=await (await fetch(origin+'/health')).json();assert.equal(health.countries,COUNTRIES.length);
 for(const year of [2026,1942,1919,1783]){const response=await fetch(origin+'/atlas/data/world-'+year+'.geojson');assert.equal(response.status,200);assert.equal((await response.json()).era,year)}
 assert.equal((await fetch(origin+'/atlas/ui.js')).status,200);assert.equal((await fetch(origin+'/atlas/style.css')).status,200);
 const host=await Socket.open();host.send({type:'create_room',name:'Era test host'});const room=(await host.next(x=>x.type==='room_created')).room.code;
 const first=eraRows(1942).find(r=>r.name==='Soviet Union'),second=eraRows(1942).find(r=>r.name==='United States of America');assert.ok(first&&second);
 host.send({type:'claim_country',countryId:first.id});const claimed=(await host.next(x=>x.type==='room_state'&&x.room.state)).room.state;assert.equal(claimed.date.year,1942);assert.equal(claimed.history[0].year,1942);assert.equal(claimed.atlas.era,1942);
 const peer=await Socket.open();peer.send({type:'join_room',code:room,name:'Era test peer'});await peer.next(x=>x.type==='room_joined');peer.send({type:'claim_country',countryId:'usa'});assert.match((await peer.next(x=>x.type==='error')).message,/same scenario|same era/);peer.send({type:'claim_country',countryId:second.id});assert.equal((await peer.next(x=>x.type==='room_state'&&x.room.state)).room.state.date.year,1942);
 host.send({type:'start_game'});await host.next(x=>x.type==='room_state'&&x.room.started);host.send({type:'action',action:'negotiate',id:'usa'});assert.match((await host.next(x=>x.type==='error')).message,/different era|different.*scenario/);
 console.log('POLITICAL ATLAS server smoke PASS — four offline maps, expanded roster, historical multiplayer calendars, mixed-era claim rejection and cross-era diplomacy rejection');
}finally{for(const c of clients)c.socket?.destroy();child.kill('SIGTERM')}
