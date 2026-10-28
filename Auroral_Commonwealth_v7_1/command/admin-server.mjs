import crypto from 'node:crypto';
const PREFIX='/api/admin';
const json=(res,code,body)=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(body))};
export function installAdmin(server,api,{password=process.env.AC_ADMIN_PASSWORD,now=Date.now}={}){
 const enabled=typeof password==='string'&&password.length>=12;
 const salt=crypto.randomBytes(16),passwordHash=enabled?crypto.scryptSync(password,salt,32):null;
 const sessions=new Map(),attempts=new Map(),audit=[];
 const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
 function log(action,detail){audit.push({date:new Date(now()).toISOString(),action,detail});if(audit.length>100)audit.shift()}
 async function read(req){if(!String(req.headers['content-type']||'').startsWith('application/json'))throw Error('Send application/json');let length=0,text='';for await(const chunk of req){length+=chunk.length;if(length>4096)throw Error('Request too large');text+=chunk.toString()}return JSON.parse(text||'{}')}
 async function handle(req,res){
  const url=new URL(req.url,'http://localhost');
  if(req.headers.origin){let origin;try{origin=new URL(req.headers.origin)}catch{return json(res,403,{error:'Invalid origin'})}if(origin.host!==req.headers.host||!['http:','https:'].includes(origin.protocol))return json(res,403,{error:'Cross-origin admin requests rejected'})}
  res.setHeader('content-security-policy',"default-src 'none'; frame-ancestors 'self'");
  if(!enabled)return json(res,503,{error:'Admin access is disabled. Set AC_ADMIN_PASSWORD to at least 12 characters on the server and restart.'});
  for(const [key,expires] of sessions)if(expires<=now())sessions.delete(key);
  if(url.pathname===PREFIX+'/session'&&req.method==='POST'){
   const ip=req.socket.remoteAddress||'local';let attempt=attempts.get(ip);if(!attempt||attempt.until<=now()){attempt={count:0,until:now()+600000};attempts.set(ip,attempt)}if(attempt.count>=5)return json(res,429,{error:'Too many login attempts. Try again in 10 minutes.'});
   attempt.count++;if(attempts.size>500)attempts.delete(attempts.keys().next().value);
   let input;try{input=await read(req)}catch{return json(res,400,{error:'Invalid login request'})}
   const candidate=typeof input.password==='string'&&input.password.length<=256?input.password:'';
   if(!crypto.timingSafeEqual(crypto.scryptSync(candidate,salt,32),passwordHash)){log('login-denied','Invalid credentials');return json(res,401,{error:'Incorrect admin password'})}
   const token=crypto.randomBytes(32).toString('hex');sessions.set(hash(token),now()+3600000);if(sessions.size>20)sessions.delete(sessions.keys().next().value);attempts.delete(ip);log('login','Admin session opened');return json(res,200,{token,expiresIn:3600});
  }
  const token=String(req.headers.authorization||'').replace(/^Bearer /,'');const key=hash(token);if(!sessions.has(key))return json(res,401,{error:'Admin login required or session expired'});
  if(url.pathname===PREFIX+'/session'&&req.method==='DELETE'){sessions.delete(key);log('logout','Admin session closed');return json(res,200,{ok:true})}
  if(url.pathname===PREFIX+'/status'&&req.method==='GET')return json(res,200,{ok:true,version:'6.1.0 + Command Deck 1.0',uptime:Math.round(process.uptime()),memoryMB:Math.round(process.memoryUsage().rss/1048576),maxPlayers:20,rooms:api.roomList(),audit:[...audit].reverse()});
  if(req.method==='POST'){
   const match=url.pathname.match(/^\/api\/admin\/rooms\/([A-F0-9]{6})\/(pause|kick)$/);if(match){let input;try{input=await read(req)}catch{return json(res,400,{error:'Invalid action request'})}const [,,action]=match,code=match[1];let ok=false;if(action==='pause')ok=api.pause(code);if(action==='kick'&&typeof input.playerId==='string')ok=api.kick(code,input.playerId);if(!ok)return json(res,404,{error:'Room or connected player no longer exists'});log(action,code);return json(res,200,{ok:true})}
  }
  return json(res,404,{error:'Admin endpoint not found'});
 }
 const original=server.listeners('request');server.removeAllListeners('request');server.on('request',(req,res)=>{if((req.url||'').split('?')[0].startsWith(PREFIX)){handle(req,res).catch(()=>{if(!res.headersSent)json(res,500,{error:'Admin request failed'})})}else{if((req.url||'').split('?')[0]==='/command/admin.html'){res.setHeader('x-frame-options','SAMEORIGIN');res.setHeader('content-security-policy',"default-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'")}for(const listener of original)listener.call(server,req,res)}});
 return {enabled};
}
