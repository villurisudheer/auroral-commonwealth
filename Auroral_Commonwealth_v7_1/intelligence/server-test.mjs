import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {installIntelligence} from './server.mjs';
import {createState} from '../game/state.js';
import {COUNTRIES} from '../atlas/registry.js';
import {gameContext} from './schema.js';
const context=gameContext(createState(COUNTRIES.find(c=>c.id==='ind'))),payload={question:'Explain my budget balance.',context};
let calls=[],mode='valid';
const fixture=http.createServer(async(req,res)=>{
 const chunks=[];for await(const c of req)chunks.push(c);const body=JSON.parse(Buffer.concat(chunks).toString());calls.push({path:req.url,body});res.setHeader('content-type','application/json');
 if(mode==='delay'){const timer=setTimeout(()=>res.end(JSON.stringify({message:{content:'{"answer":"Late"}'}})),250);res.on('close',()=>clearTimeout(timer));return}
 if(mode==='invalid'){res.end(JSON.stringify({message:{content:'not JSON'}}));return}
 if(mode==='oversize'){res.end(JSON.stringify({message:{content:'x'.repeat(140000)}}));return}
 res.end(JSON.stringify({message:{content:JSON.stringify({answer:'Budget expenses exceed revenue in this fictional game. <img src=x onerror=alert(1)>'})}}));
});
await new Promise(r=>fixture.listen(0,'127.0.0.1',r));const fixtureBase='http://127.0.0.1:'+fixture.address().port;
const server=http.createServer((req,res)=>{res.end('original route intact')});installIntelligence(server,{model:'test-model',endpoint:fixtureBase,timeoutMs:100});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const post=(body=payload,headers={})=>fetch(base+'/api/intelligence/chat',{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});
let child;
try{
 assert.equal(await (await fetch(base+'/health')).text(),'original route intact');assert.equal((await (await fetch(base+'/api/intelligence/status')).json()).enabled,true);
 assert.equal((await post(payload,{origin:'https://evil.invalid'})).status,403,'Origin protection');assert.equal((await post(payload,{'sec-fetch-site':'cross-site'})).status,403,'Fetch site protection');assert.equal(await new Promise((resolve,reject)=>{const req=http.request(base+'/api/intelligence/status',{headers:{host:'evil.invalid'}},res=>{res.resume();resolve(res.statusCode)});req.on('error',reject);req.end()}),403,'Host protection');assert.equal(calls.length,0);
 assert.equal((await post({...payload,context:{...context,gdp:null}})).status,400);assert.equal((await post({...payload,question:'x'.repeat(34000)})).status,400);assert.equal(calls.length,0);
 const response=await post({...payload,endpoint:'https://evil.invalid',context:{...context,players:['secret'],adminToken:'not-forwarded'}});assert.equal(response.status,200);const result=await response.json();assert.equal(result.actionsApplied,false);assert.equal(result.mode,'pretrained-llm');assert.match(result.answer,/fictional game/);assert.equal(calls[0].path,'/api/chat');assert.equal(calls[0].body.stream,false);assert.equal(calls[0].body.model,'test-model');assert.equal(calls[0].body.format.type,'object');assert.ok(!JSON.stringify(calls[0]).includes('not-forwarded'));assert.ok(!JSON.stringify(calls[0]).includes('secret'));assert.ok(!JSON.stringify(calls[0]).includes('evil.invalid'));
 mode='invalid';assert.equal((await post()).status,502);mode='oversize';assert.equal((await post()).status,502);mode='delay';const pending=post();await new Promise(r=>setTimeout(r,20));assert.equal((await post()).status,429);assert.equal((await pending).status,502);mode='valid';assert.equal((await post()).status,200);assert.equal((await post()).status,200);assert.equal((await post()).status,429);
 console.log('AI bridge PASS — real local HTTP Ollama protocol fixture, bounded/whitelisted context, schema, no model actions, malformed/oversized replies, timeout, concurrency, rate limit, origin and Host protection.');
 // Start the shipped application with its actual default configuration.
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),port=18479;let output='';child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port),AC_LLM_MODEL:'',AC_OLLAMA_URL:''},stdio:['ignore','pipe','pipe']});child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timeout '+output)),5000);child.stdout.on('data',()=>{if(output.includes('For internet multiplayer')){clearTimeout(timer);resolve()}});child.once('error',reject)});const appBase='http://127.0.0.1:'+port;assert.equal((await (await fetch(appBase+'/api/intelligence/status')).json()).enabled,false);assert.equal((await fetch(appBase+'/api/intelligence/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})).status,503);
 for(const asset of ['ui.js','style.css','schema.js','forest.js','actions.js','model/policy-forest.json','model/training-report.json'])assert.equal((await fetch(appBase+'/intelligence/'+asset)).status,200);
 assert.ok((await (await fetch(appBase+'/health')).json()).countries>=670);assert.equal((await fetch(appBase+'/atlas/data/world-1942.geojson')).status,200);assert.equal((await fetch(appBase+'/command/admin.html')).headers.get('x-frame-options'),'SAMEORIGIN');console.log('AI application smoke PASS — shipped server hooks, offline ML assets, disabled LLM behavior, atlas and original authenticated admin routes retained. Live model weights were not installed or exercised.');
}finally{child?.kill('SIGTERM');await new Promise(r=>server.close(r));await new Promise(r=>fixture.close(r))}
