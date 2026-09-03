import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {COUNTRIES} from './data/countries.js';
import {createState,snapshot,advanceDate} from './game/state.js';
import {computeMonthlyEconomy} from './game/economy.js';
import {applyGovernmentEffects,borrow,repayDebt} from './game/government.js';
import {updateResources,updateEnergy} from './game/resources.js';
import {updateTrade,signTradeAgreement,buyResource,exportResource} from './game/trade.js';
import {startResearch,updateResearch} from './game/technology.js';
import {negotiate,sanction} from './game/diplomacy.js';
import {maybeEvent,resolveEvent} from './game/events.js';
import {checkAchievements} from './game/achievements.js';
import {updateCollapse} from './game/collapse.js';
import {build} from './game/infrastructure.js';
import {investIndustry,updateIndustries} from './game/industries.js';
import {fundDevelopmentProgram,developmentBankLoan,researchPartnership,humanitarianAid} from './game/commonwealth.js';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||8000);
const rooms=new Map();
const sockets=new Set();
const MAX_PLAYERS=20;
const BUILD_VERSION='6.0.1';
const MAX_WS_FRAME_BYTES=64*1024;

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'};

const server=http.createServer((req,res)=>{
  let urlPath;
  try{urlPath=decodeURIComponent((req.url||'/').split('?')[0])}
  catch{res.writeHead(400,{'content-type':'text/plain; charset=utf-8'});res.end('Bad request');return}
  if(urlPath==='/health'){
    const body=JSON.stringify({ok:true,service:'auroral-commonwealth',version:BUILD_VERSION,countries:COUNTRIES.length,maxPlayers:MAX_PLAYERS,rooms:rooms.size});
    res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(body);return;
  }
  if(urlPath==='/')urlPath='/index.html';
  const relative=path.normalize(urlPath).replace(/^[/\\]+/,'');
  const file=path.resolve(__dirname,relative);
  if(file!==__dirname&&!file.startsWith(__dirname+path.sep)){res.writeHead(403,{'content-type':'text/plain; charset=utf-8'});res.end('Forbidden');return}
  fs.stat(file,(err,st)=>{
    if(err||!st.isFile()){res.writeHead(404,{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'});res.end('Not found');return}
    res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store, max-age=0','pragma':'no-cache'});
    const stream=fs.createReadStream(file);
    stream.on('error',()=>{if(!res.headersSent)res.writeHead(500,{'content-type':'text/plain; charset=utf-8'});res.end('Server file error')});
    stream.pipe(res);
  });
});

server.on('upgrade',(req,socket)=>{
  if((req.url||'').split('?')[0]!=='/ws'){socket.destroy();return;}
  const key=req.headers['sec-websocket-key'];
  if(!key){socket.destroy();return;}
  const accept=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');
  const ws={socket,buffer:Buffer.alloc(0),playerId:null,roomCode:null,alive:true};
  sockets.add(ws);
  socket.on('data',d=>onData(ws,d));
  socket.on('close',()=>disconnect(ws));
  socket.on('error',()=>disconnect(ws));
  send(ws,{type:'hello',server:'Auroral Commonwealth Multiplayer',version:6,build:BUILD_VERSION,maxPlayers:MAX_PLAYERS,countries:COUNTRIES.length});
});

function onData(ws,data){
  ws.buffer=Buffer.concat([ws.buffer,data]);
  while(ws.buffer.length>=2){
    const b0=ws.buffer[0],b1=ws.buffer[1];
    const opcode=b0&0x0f,masked=!!(b1&0x80);let len=b1&0x7f,off=2;
    if(len===126){if(ws.buffer.length<4)return;len=ws.buffer.readUInt16BE(2);off=4}
    else if(len===127){if(ws.buffer.length<10)return;const n=Number(ws.buffer.readBigUInt64BE(2));if(!Number.isSafeInteger(n)){ws.socket.destroy();return}len=n;off=10}
    if(len>MAX_WS_FRAME_BYTES){error(ws,'Multiplayer message too large.');ws.socket.destroy();return}
    const maskBytes=masked?4:0;if(ws.buffer.length<off+maskBytes+len)return;
    let payload=ws.buffer.subarray(off+maskBytes,off+maskBytes+len);
    if(masked){const key=ws.buffer.subarray(off,off+4);const out=Buffer.alloc(len);for(let i=0;i<len;i++)out[i]=payload[i]^key[i%4];payload=out}
    ws.buffer=ws.buffer.subarray(off+maskBytes+len);
    if(opcode===0x8){ws.socket.end();return}
    if(opcode===0x9){sendFrame(ws,0xA,payload);continue}
    if(opcode!==0x1)continue;
    try{handle(ws,JSON.parse(payload.toString('utf8')))}catch(e){send(ws,{type:'error',message:'Invalid multiplayer message.'})}
  }
}
function sendFrame(ws,opcode,payload){if(!ws?.socket||ws.socket.destroyed)return;payload=Buffer.isBuffer(payload)?payload:Buffer.from(payload);let head;if(payload.length<126){head=Buffer.from([0x80|opcode,payload.length])}else if(payload.length<65536){head=Buffer.alloc(4);head[0]=0x80|opcode;head[1]=126;head.writeUInt16BE(payload.length,2)}else{head=Buffer.alloc(10);head[0]=0x80|opcode;head[1]=127;head.writeBigUInt64BE(BigInt(payload.length),2)}ws.socket.write(Buffer.concat([head,payload]))}
function send(ws,obj){sendFrame(ws,0x1,Buffer.from(JSON.stringify(obj)))}
function error(ws,message){send(ws,{type:'error',message})}
function cleanName(x){return String(x||'Player').trim().slice(0,24)||'Player'}
function code(){let c;do{c=crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase()}while(rooms.has(c));return c}
function playerId(){return crypto.randomBytes(12).toString('hex')}
function getRoom(ws){return rooms.get(ws.roomCode)}
function getPlayer(ws){return getRoom(ws)?.players.get(ws.playerId)}
function publicRoom(room,forId){return {code:room.code,started:room.started,speed:room.speed,hostId:room.hostId,me:forId,players:[...room.players.values()].map(p=>({id:p.id,name:p.name,countryId:p.countryId,countryName:p.state?.name||null,flag:p.state?.flag||null,connected:!!p.ws,gdp:p.state?.gdp??null,treasury:p.state?.treasury??null,approval:p.state?.approval??null,stability:p.state?.stability??null})),claimed:[...room.players.values()].map(p=>p.countryId).filter(Boolean),state:room.players.get(forId)?.state||null,serverTime:Date.now()}}
function broadcastRoom(room){for(const p of room.players.values())if(p.ws)send(p.ws,{type:'room_state',room:publicRoom(room,p.id)})}

function handle(ws,m){
  switch(m.type){
    case'create_room':{
      if(ws.roomCode)return error(ws,'Already in a room.');
      const c=code(),id=playerId();const room={code:c,hostId:id,players:new Map(),started:false,speed:0,timer:null,createdAt:Date.now()};
      const p={id,name:cleanName(m.name),countryId:null,state:null,difficulty:'normal',ws};room.players.set(id,p);rooms.set(c,room);ws.playerId=id;ws.roomCode=c;send(ws,{type:'room_created',playerId:id,room:publicRoom(room,id)});broadcastRoom(room);break;
    }
    case'join_room':{
      if(ws.roomCode)return error(ws,'Already in a room.');
      const c=String(m.code||'').trim().toUpperCase();const room=rooms.get(c);if(!room)return error(ws,'Room not found. Check the room code.');if(room.players.size>=MAX_PLAYERS)return error(ws,'Room is full.');
      const id=playerId(),p={id,name:cleanName(m.name),countryId:null,state:null,difficulty:'normal',ws};room.players.set(id,p);ws.playerId=id;ws.roomCode=c;send(ws,{type:'room_joined',playerId:id,room:publicRoom(room,id)});broadcastRoom(room);break;
    }
    case'claim_country':{
      const room=getRoom(ws),p=getPlayer(ws);if(!room||!p)return error(ws,'Join a room first.');if(room.started)return error(ws,'The match has already started.');
      const cid=String(m.countryId||'');const country=COUNTRIES.find(c=>c.id===cid);if(!country)return error(ws,'Invalid country.');if([...room.players.values()].some(x=>x.id!==p.id&&x.countryId===cid))return error(ws,'That country is already controlled by another player.');
      const diff=['easy','normal','hard','nightmare'].includes(m.difficulty)?m.difficulty:'normal';p.countryId=cid;p.difficulty=diff;p.state=createState(country,diff,{});p.state.speed=0;p.state.autosave=false;p.state.multiplayer=true;broadcastRoom(room);break;
    }
    case'unclaim_country':{const room=getRoom(ws),p=getPlayer(ws);if(!room||!p||room.started)return;p.countryId=null;p.state=null;broadcastRoom(room);break}
    case'start_game':{const room=getRoom(ws);if(!room)return;if(room.hostId!==ws.playerId)return error(ws,'Only the host can start the match.');if(![...room.players.values()].every(p=>p.state))return error(ws,'Every player must choose a country first.');room.started=true;room.speed=0;broadcastRoom(room);break}
    case'set_speed':{const room=getRoom(ws);if(!room?.started)return;if(room.hostId!==ws.playerId)return error(ws,'Only the host controls the shared game clock.');const speed=[0,1,2,5,10].includes(+m.speed)?+m.speed:0;room.speed=speed;for(const p of room.players.values())if(p.state)p.state.speed=speed;restartTimer(room);broadcastRoom(room);break}
    case'policy':{const p=getPlayer(ws),room=getRoom(ws);if(!room?.started||!p?.state)return;const group=m.group,key=m.key,val=+m.value;if(!Number.isFinite(val))return;if(group==='tax'&&key in p.state.taxes){const max=key==='tariff'?40:60;p.state.taxes[key]=Math.max(0,Math.min(max,val))}else if(group==='budget'&&key in p.state.budget){p.state.budget[key]=Math.max(.5,Math.min(12,val))}else return;broadcastRoom(room);break}
    case'action':{const room=getRoom(ws),p=getPlayer(ws);if(!room?.started||!p?.state)return;const ok=applyAction(p.state,m);send(ws,{type:'action_result',ok,action:m.action});broadcastRoom(room);break}
    case'resolve_event':{const room=getRoom(ws),p=getPlayer(ws);if(!room?.started||!p?.state)return;const ok=resolveEvent(p.state,+m.choice);send(ws,{type:'action_result',ok,action:'resolve_event'});broadcastRoom(room);break}
    case'player_aid':{const room=getRoom(ws),from=getPlayer(ws);const to=room?.players.get(String(m.to||''));if(!room?.started||!from?.state||!to?.state||to.id===from.id)return;const amt=50;if(from.state.treasury<amt)return error(ws,'Not enough treasury to send aid.');from.state.treasury-=amt;to.state.treasury+=amt;from.state.diplomacy.reputation=Math.min(100,from.state.diplomacy.reputation+1.5);from.state.notifications.unshift({type:'information',text:`Sent ${amt}B in multiplayer aid to ${to.state.name}.`});to.state.notifications.unshift({type:'information',text:`Received ${amt}B in multiplayer aid from ${from.state.name}.`});broadcastRoom(room);break}
    case'leave_room':disconnect(ws,true);break;
  }
}

function applyAction(s,m){let ok=true;const id=String(m.id||'');switch(m.action){
  case'borrow':ok=borrow(s,+m.amount||100);break;case'repay':ok=repayDebt(s,+m.amount||100)>0;break;case'investIndustry':ok=investIndustry(s,id);break;case'buyResource':ok=buyResource(s,id,+m.units||20);break;case'exportResource':ok=exportResource(s,id,+m.units||20);break;case'tradeAgreement':ok=signTradeAgreement(s);break;case'research':ok=startResearch(s,id);break;case'build':ok=build(s,id);break;case'cwDevelopment':ok=fundDevelopmentProgram(s);break;case'cwLoan':ok=developmentBankLoan(s);break;case'cwResearch':ok=researchPartnership(s);break;case'cwAid':ok=humanitarianAid(s);break;case'negotiate':ok=negotiate(s,id);break;case'sanction':sanction(s,id);ok=true;break;default:ok=false}return !!ok}
function tickState(s){computeMonthlyEconomy(s);applyGovernmentEffects(s);updateResources(s);updateEnergy(s);updateTrade(s);updateIndustries(s);updateResearch(s);checkAchievements(s);updateCollapse(s);advanceDate(s);snapshot(s);maybeEvent(s)}
function restartTimer(room){if(room.timer){clearInterval(room.timer);room.timer=null}if(room.speed<=0)return;const ms=Math.max(450,2600/room.speed);room.timer=setInterval(()=>{if(!rooms.has(room.code)||!room.started||room.speed<=0)return;for(const p of room.players.values())if(p.state)tickState(p.state);broadcastRoom(room)},ms)}
function disconnect(ws,explicit=false){if(!sockets.has(ws))return;sockets.delete(ws);const room=getRoom(ws),p=getPlayer(ws);if(room&&p){room.players.delete(p.id);if(room.hostId===p.id)room.hostId=room.players.keys().next().value||null;if(room.players.size===0){if(room.timer)clearInterval(room.timer);rooms.delete(room.code)}else broadcastRoom(room)}ws.roomCode=null;ws.playerId=null;if(explicit&&!ws.socket.destroyed)ws.socket.end()}

setInterval(()=>{const now=Date.now();for(const [c,r] of rooms){if(r.players.size===0||(![...r.players.values()].some(p=>p.ws)&&now-r.createdAt>30*60*1000)){if(r.timer)clearInterval(r.timer);rooms.delete(c)}}},60_000).unref();

server.listen(PORT,'0.0.0.0',()=>{
  console.log(`\nAURORAL COMMONWEALTH MULTIPLAYER — Stable v6`);
  console.log(`Build: ${BUILD_VERSION} • Countries: ${COUNTRIES.length} • Max players: ${MAX_PLAYERS}`);
  console.log(`Local: http://127.0.0.1:${PORT}`);
  for(const nets of Object.values(os.networkInterfaces()))for(const n of nets||[])if(n.family==='IPv4'&&!n.internal)console.log(`LAN:   http://${n.address}:${PORT}`);
  console.log('\nFor internet multiplayer, deploy this Node app to a public host or port-forward this port.\n');
});
