import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {COUNTRIES} from './data/countries.js';
import {RESOURCE_DEFS} from './data/resources.js';
import {createState,snapshot,advanceDate} from './game/state.js';
import {computeMonthlyEconomy} from './game/economy.js';
import {applyGovernmentEffects} from './game/government.js';
import {updateResources,updateEnergy} from './game/resources.js';
import {updateTrade} from './game/trade.js';
import {updateResearch} from './game/technology.js';
import {updateIndustries} from './game/industries.js';
import {checkAchievements} from './game/achievements.js';
import {updateCollapse} from './game/collapse.js';

const root=path.dirname(fileURLToPath(import.meta.url));
const failures=[];
const assert=(ok,msg)=>{if(!ok)failures.push(msg)};

// Parse every JavaScript module, including browser-only modules, without executing them.
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(ent.name==='node_modules'||ent.name.startsWith('.'))continue;
    const full=path.join(dir,ent.name);
    if(ent.isDirectory())walk(full);
    else if(/\.(m?js)$/.test(ent.name)){
      const r=spawnSync(process.execPath,['--check',full],{encoding:'utf8'});
      if(r.status!==0)failures.push(`Syntax check failed: ${path.relative(root,full)}\n${r.stderr||r.stdout}`);
    }
  }
}
walk(root);

assert(Array.isArray(COUNTRIES),'COUNTRIES must export an array.');
assert(COUNTRIES.length>=202,`Expected at least 202 roster entries; found ${COUNTRIES.length}.`);
const ids=new Set();
const resourceKeys=Object.keys(RESOURCE_DEFS);
for(const c of COUNTRIES){
  assert(c&&typeof c==='object','Every roster entry must be an object.');
  assert(typeof c.id==='string'&&c.id.length>=2,`Invalid country ID for ${c?.name||'unknown entry'}.`);
  assert(!ids.has(c.id),`Duplicate country ID: ${c.id}`); ids.add(c.id);
  for(const key of ['name','flag','capital','region'])assert(typeof c[key]==='string'&&c[key].length>0,`${c.id}: missing ${key}.`);
  for(const key of ['population','gdp','treasury','debt','inflation','unemployment','tech','infra','military','stability','approval'])assert(Number.isFinite(c[key]),`${c.id}: ${key} must be finite.`);
  assert(Array.isArray(c.map)&&c.map.length===2&&Number.isFinite(c.map[0])&&Number.isFinite(c.map[1])&&c.map[0]>=-90&&c.map[0]<=90&&c.map[1]>=-180&&c.map[1]<=180,`${c.id}: invalid map coordinates.`);
  for(const key of resourceKeys){
    const r=c.resources?.[key];
    assert(r&&Number.isFinite(r.reserve)&&Number.isFinite(r.production)&&Number.isFinite(r.consumption),`${c.id}: invalid resource ${key}.`);
  }
}

const required={
  fsm:'Micronesia',tns:'Transnistria',srp:'The Republic of Samratpur',nai:'நாய் Country',hpx:'Federation of Hyperpixel',
  uss:'Union of Soviet Socialist Republics (USSR)',wwg:'WWII Peak Germany',ote:'Ottoman Empire'
};
for(const [id,name] of Object.entries(required)){
  const c=COUNTRIES.find(x=>x.id===id);
  assert(!!c,`Required roster entry missing: ${name} (${id}).`);
  if(c)assert(c.name===name,`${id}: expected display name "${name}", found "${c.name}".`);
}

// 12-month economy smoke test for every selectable roster entry.
const finiteFields=['gdp','treasury','debt','inflation','unemployment','population','approval','stability','techLevel','infra'];
for(const c of COUNTRIES){
  try{
    const s=createState(c,'normal',{});
    for(let month=0;month<12;month++){
      computeMonthlyEconomy(s); applyGovernmentEffects(s); updateResources(s); updateEnergy(s); updateTrade(s); updateIndustries(s); updateResearch(s); checkAchievements(s); updateCollapse(s); advanceDate(s); snapshot(s);
    }
    for(const key of finiteFields)assert(Number.isFinite(s[key]),`${c.id}: ${key} became non-finite during 12-month smoke test.`);
  }catch(err){failures.push(`${c.id}: simulation crashed: ${err?.stack||err}`)}
}

if(failures.length){
  console.error(`\nAURORAL COMMONWEALTH v6 validation FAILED (${failures.length} issue${failures.length===1?'':'s'}):`);
  for(const f of failures.slice(0,50))console.error(`- ${f}`);
  if(failures.length>50)console.error(`- ...and ${failures.length-50} more.`);
  process.exit(1);
}
console.log(`AURORAL COMMONWEALTH v6 validation PASS`);
console.log(`- ${COUNTRIES.length} selectable entries`);
console.log(`- ${ids.size} unique country IDs`);
console.log(`- required special/historical entries present`);
console.log(`- every JS/MJS file parses`);
console.log(`- every country completed 12 simulated months with finite core values`);
