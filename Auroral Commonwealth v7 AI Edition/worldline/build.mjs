// Additive overlay: originals are read, hashed and never written.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)), root=path.dirname(here);
const generated=path.join(here,'generated');
const selected=['data/events.js',...fs.readdirSync(path.join(root,'game')).filter(x=>x.endsWith('.js')).map(x=>'game/'+x)];
const wrapped=new Set(['computeMonthlyEconomy','applyGovernmentEffects','setPolicyValue','borrow','repayDebt','updateResources','updateEnergy','updateTrade','signTradeAgreement','buyResource','exportResource','startResearch','updateResearch','negotiate','sanction','maybeEvent','resolveEvent','checkAchievements','updateCollapse','build','investIndustry','updateIndustries','fundDevelopmentProgram','developmentBankLoan','researchPartnership','humanitarianAid']);
const hashes={};
for(const file of selected){
 const original=fs.readFileSync(path.join(root,file),'utf8');
 hashes[file]=crypto.createHash('sha256').update(original).digest('hex');
 let source=original, rngImport='';
 // Only simulation calls are redirected; menu/resource creation and save IDs retain normal RNG.
 const simulation=file!=='main.js'&&file!=='game/saveSystem.js';
 if(simulation&&source.includes('Math.random()')){
  source=source.replaceAll('Math.random()','stateRandom(s)');
  const rng=path.relative(path.dirname(path.join(generated,file)),path.join(here,'core.js')).split(path.sep).join('/');
  rngImport=`import {stateRandom} from '${rng}';\n`;
 }
 // Keep import resolution identical except for the explicitly generated engine modules.
 source=source.replace(/from (['"])(\.[^'"]+)\1/g,(_,q,rel)=>{
  const target=path.resolve(path.dirname(path.join(root,file)),rel), key=path.relative(root,target).split(path.sep).join('/');
  const dest=selected.includes(key)?path.join(generated,key):target;
  let url=path.relative(path.dirname(path.join(generated,file)),dest).split(path.sep).join('/');
  if(!url.startsWith('.'))url='./'+url;
  return `from ${q}${url}${q}`;
 });
 source=rngImport+source;
 const names=[];
 source=source.replace(/export function (\w+)\(/g,(all,name)=>{if(!wrapped.has(name))return all;names.push(name);return `function raw_${name}(`});
 if(names.length){
  const core=path.relative(path.dirname(path.join(generated,file)),path.join(here,'core.js')).split(path.sep).join('/');
  source=`import {observe} from '${core}';\n`+source;
  for(const name of names)source+=`\nexport function ${name}(s,...args){return observe(s,'${name}',()=>raw_${name}(s,...args),args)}\n`;
 }
 const output=path.join(generated,file);fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,'// Generated from the unchanged Stable v6.1 source by worldline/build.mjs.\n'+source);
}
const overlayHashes=Object.fromEntries(['engine.js','core.js','build.mjs'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(here,file))).digest('hex')]));
const digest=crypto.createHash('sha256').update(JSON.stringify({hashes,overlayHashes})).digest('hex');
fs.writeFileSync(path.join(generated,'version.js'),`export const ENGINE_VERSION=${JSON.stringify('6.1.0+worldline.1.0.0:'+digest)};\n`);
fs.writeFileSync(path.join(generated,'manifest.json'),JSON.stringify({overlay:'1.0.0',engine:'6.1.0',digest,hashes,overlayHashes},null,2));
console.log(`Worldline overlay built: ${selected.length} generated modules; original files unchanged.`);
