import {COUNTRIES} from '../chronicle/registry.js';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),port=18464;
const server=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port),AC_ADMIN_PASSWORD:'Test-only-password-2026'},stdio:['ignore','pipe','pipe']});
let logs='';server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
const origin='http://127.0.0.1:'+port;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Startup timeout '+logs)),5000);server.stdout.on('data',()=>{if(logs.includes('For internet multiplayer')){clearTimeout(timer);resolve()}});server.once('error',reject);server.once('exit',code=>reject(Error('Server exit '+code+' '+logs)))});
 for(const file of ['command/admin.html','command/admin-ui.js','command/style.css','command/ui.js','command/model.js','command/scene.js'])assert.equal((await fetch(origin+'/'+file)).status,200,file);
 const page=await fetch(origin+'/command/admin.html');assert.equal(page.headers.get('x-frame-options'),'SAMEORIGIN');assert.match(page.headers.get('content-security-policy'),/frame-ancestors 'self'/);
 assert.equal((await fetch(origin+'/api/admin/status')).status,401);
 const login=await fetch(origin+'/api/admin/session',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:'Test-only-password-2026'})});assert.equal(login.status,200);const {token}=await login.json();
 const status=await fetch(origin+'/api/admin/status',{headers:{authorization:'Bearer '+token}});assert.equal(status.status,200);assert.equal((await status.json()).maxPlayers,20);
 const health=await (await fetch(origin+'/health')).json();assert.equal(health.ok,true);assert.equal(health.countries,COUNTRIES.length);
 console.log('COMMAND DECK HTTP smoke PASS — actual server assets, protected admin login/status, framing headers and existing health endpoint');
}finally{server.kill('SIGTERM')}
