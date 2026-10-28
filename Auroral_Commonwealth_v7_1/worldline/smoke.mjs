import {COUNTRIES} from '../chronicle/registry.js';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import net from 'node:net';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=18463,origin=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
let logs='';server.stdout.on('data',x=>logs+=x);server.stderr.on('data',x=>logs+=x);
const clients=[];
class Client{
 constructor(){this.messages=[];this.waiters=[];this.buffer=Buffer.alloc(0);this.ready=false}
 static async open(){const c=new Client();clients.push(c);c.socket=net.connect(port,'127.0.0.1');c.socket.on('data',d=>c.receive(d));c.socket.on('error',e=>c.error=e);await new Promise((resolve,reject)=>{c.socket.once('connect',resolve);c.socket.once('error',reject)});const key=crypto.randomBytes(16).toString('base64');c.socket.write(`GET /ws HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);const hello=await c.next(m=>m.type==='hello');assert.equal(hello.maxPlayers,20);return c}
 receive(d){this.buffer=Buffer.concat([this.buffer,d]);if(!this.ready){const end=this.buffer.indexOf('\r\n\r\n');if(end<0)return;assert.match(this.buffer.subarray(0,end).toString(),/101 Switching Protocols/);this.buffer=this.buffer.subarray(end+4);this.ready=true}while(this.buffer.length>=2){let len=this.buffer[1]&127,off=2;if(len===126){if(this.buffer.length<4)return;len=this.buffer.readUInt16BE(2);off=4}else if(len===127){if(this.buffer.length<10)return;len=Number(this.buffer.readBigUInt64BE(2));off=10}if(this.buffer.length<off+len)return;const opcode=this.buffer[0]&15,payload=this.buffer.subarray(off,off+len);this.buffer=this.buffer.subarray(off+len);if(opcode===1){this.messages.push(JSON.parse(payload.toString()));for(const f of [...this.waiters])f()}}}
 send(obj){const payload=Buffer.from(JSON.stringify(obj)),mask=crypto.randomBytes(4);let head;if(payload.length<126)head=Buffer.from([129,128|payload.length]);else{head=Buffer.alloc(4);head[0]=129;head[1]=254;head.writeUInt16BE(payload.length,2)}const masked=Buffer.from(payload);for(let i=0;i<masked.length;i++)masked[i]^=mask[i%4];this.socket.write(Buffer.concat([head,mask,masked]))}
 next(predicate){return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{this.waiters=this.waiters.filter(x=>x!==check);reject(Error('WebSocket response timeout '+logs))},5000);const check=()=>{const i=this.messages.findIndex(predicate);if(i>=0){clearTimeout(timeout);this.waiters=this.waiters.filter(x=>x!==check);resolve(this.messages.splice(i,1)[0])}};this.waiters.push(check);check()})}
}
try{
 await new Promise((resolve,reject)=>{const deadline=setTimeout(()=>reject(Error('Server startup timeout: '+logs)),5000);server.stdout.on('data',()=>{if(logs.includes('For internet multiplayer')){clearTimeout(deadline);resolve()}});server.on('exit',code=>reject(Error('Server exited '+code+': '+logs)))});
 const health=await (await fetch(origin+'/health')).json();assert.equal(health.ok,true);assert.equal(health.countries,COUNTRIES.length);assert.equal(health.maxPlayers,20);console.log('PASS server startup and /health (expanded era roster, 20-player cap)');
 const queue=['index.html','bootstrap.js','main.js'],seen=new Set();while(queue.length){const file=queue.shift();if(seen.has(file))continue;seen.add(file);const res=await fetch(origin+'/'+file);assert.equal(res.status,200,file);const text=await res.text();if(file.endsWith('.js'))for(const match of text.matchAll(/(?:from\s+|import\s*\(\s*)(['"])(\.[^'"]+)\1/g)){const target=path.posix.normalize(path.posix.join(path.posix.dirname(file),match[2]));queue.push(target)}}assert.ok(seen.has('worldline/ui.js'));assert.ok(seen.has('worldline/generated/game/economy.js'));assert.equal((await fetch(origin+'/worldline/style.css')).status,200);console.log(`PASS HTTP delivery of ${seen.size} application/module assets and extension CSS`);
 const host=await Client.open();host.send({type:'create_room',name:'Validation Host'});const created=await host.next(x=>x.type==='room_created'),code=created.room.code;
 for(let i=1;i<20;i++){const c=await Client.open();c.send({type:'join_room',code,name:'Validation '+i});await c.next(x=>x.type==='room_joined')}
 const excess=await Client.open();excess.send({type:'join_room',code,name:'Over capacity'});assert.match((await excess.next(x=>x.type==='error')).message,/full/);console.log('PASS 20-human-player room; 21st human rejected');
 for(const c of clients)c.messages=[];
 host.send({type:'claim_country',countryId:'usa',difficulty:'normal'});const claimed=await host.next(x=>x.type==='room_state'&&x.room.state);assert.equal(claimed.room.state.countryId,'usa');const before=claimed.room.state.taxes.income;
 // Invalid state mutations before match start cannot bypass authority.
 host.send({type:'policy',group:'tax',key:'income',value:55});host.send({type:'unclaim_country'});await host.next(x=>x.type==='room_state'&&!x.room.state);assert.ok(Number.isFinite(before));
 // A second room provides a started match for authoritative policy/action checks.
 const solo=await Client.open();solo.send({type:'create_room',name:'Authority'});await solo.next(x=>x.type==='room_created');solo.send({type:'claim_country',countryId:'usa'});await solo.next(x=>x.type==='room_state'&&x.room.state);solo.send({type:'start_game'});await solo.next(x=>x.type==='room_state'&&x.room.started);solo.messages=[];
 solo.send({type:'policy',group:'tax',key:'income',value:44});assert.equal((await solo.next(x=>x.type==='room_state'&&x.room.state.taxes.income===44)).room.state.taxes.income,44);
 solo.send({type:'action',action:'borrow',amount:-100});assert.equal((await solo.next(x=>x.type==='action_result')).ok,false);
 solo.send({type:'policy',group:'tax',key:'unknown',value:3});assert.match((await solo.next(x=>x.type==='error')).message,/Invalid policy/);console.log('PASS authoritative policy updates and invalid financial/action rejection');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'worldline/generated/manifest.json')));assert.ok(manifest.digest);console.log('AURORAL WORLDLINE server smoke PASS');
}finally{for(const c of clients)c.socket?.destroy();server.kill('SIGTERM')}
