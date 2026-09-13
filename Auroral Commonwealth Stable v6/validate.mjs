import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {COUNTRIES} from './data/countries.js';
import {RESOURCE_DEFS} from './data/resources.js';
import {createState,repairState,snapshot,advanceDate} from './game/state.js';
import {computeMonthlyEconomy} from './game/economy.js';
import {applyGovernmentEffects,setPolicyValue,getPolicyValue,borrow,repayDebt} from './game/government.js';
import {updateResources,updateEnergy} from './game/resources.js';
import {updateTrade,buyResource,exportResource} from './game/trade.js';
import {updateResearch} from './game/technology.js';
import {updateIndustries,investIndustry} from './game/industries.js';
import {checkAchievements} from './game/achievements.js';
import {updateCollapse} from './game/collapse.js';
import {shell} from './ui/dashboard.js';
import {chartBounds} from './ui/charts.js';

const root=path.dirname(fileURLToPath(import.meta.url));
const failures=[];
const assert=(ok,msg)=>{if(!ok)failures.push(msg)};

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
 assert(!ids.has(c.id),`Duplicate country ID: ${c.id}`);ids.add(c.id);
 for(const key of ['name','flag','capital','region'])assert(typeof c[key]==='string'&&c[key].length>0,`${c.id}: missing ${key}.`);
 for(const key of ['population','gdp','treasury','debt','inflation','unemployment','tech','infra','military','stability','approval'])assert(Number.isFinite(c[key]),`${c.id}: ${key} must be finite.`);
 assert(Array.isArray(c.map)&&c.map.length===2&&Number.isFinite(c.map[0])&&Number.isFinite(c.map[1])&&c.map[0]>=-90&&c.map[0]<=90&&c.map[1]>=-180&&c.map[1]<=180,`${c.id}: invalid map coordinates.`);
 for(const key of resourceKeys){const r=c.resources?.[key];assert(r&&Number.isFinite(r.reserve)&&Number.isFinite(r.production)&&Number.isFinite(r.consumption),`${c.id}: invalid resource ${key}.`)}
}

const required={fsm:'Micronesia',tns:'Transnistria',srp:'The Republic of Samratpur',nai:'நாய் Country',hpx:'Federation of Hyperpixel',uss:'Union of Soviet Socialist Republics (USSR)',wwg:'WWII Peak Germany',ote:'Ottoman Empire'};
for(const [id,name] of Object.entries(required)){const c=COUNTRIES.find(x=>x.id===id);assert(!!c,`Required roster entry missing: ${name} (${id}).`);if(c)assert(c.name===name,`${id}: expected display name "${name}", found "${c.name}".`)}

const finiteFields=['gdp','treasury','debt','inflation','unemployment','population','approval','stability','techLevel','infra'];
for(const c of COUNTRIES){
 try{
  const s=createState(c,'normal',{});
  for(let month=0;month<12;month++){computeMonthlyEconomy(s);applyGovernmentEffects(s);updateResources(s);updateEnergy(s);updateTrade(s);updateIndustries(s);updateResearch(s);checkAchievements(s);updateCollapse(s);advanceDate(s);snapshot(s)}
  for(const key of finiteFields)assert(Number.isFinite(s[key]),`${c.id}: ${key} became non-finite during 12-month smoke test.`);
 }catch(err){failures.push(`${c.id}: simulation crashed: ${err?.stack||err}`)}
}

// v6.1 regression tests: policy sliders and policy state mapping.
try{
 const s=createState(COUNTRIES[0],'normal',{});
 for(const key of Object.keys(s.taxes)){
  const before=s.taxes[key];
  assert(setPolicyValue(s,'tax',key,31.7),`Tax slider failed to accept ${key}.`);
  assert(Number.isFinite(getPolicyValue(s,'tax',key)),`Tax slider produced non-finite ${key}.`);
  assert(getPolicyValue(s,'tax',key)!==before||before===31.7,`Tax slider did not update ${key}.`);
 }
 for(const key of Object.keys(s.budget)){
  assert(setPolicyValue(s,'budget',key,7.3),`Budget slider failed to accept ${key}.`);
  assert(getPolicyValue(s,'budget',key)===7.3,`Budget slider did not retain ${key}.`);
 }
 assert(getPolicyValue(s,'tax','tariff')<=40,'Tariff slider exceeded its maximum.');
 assert(setPolicyValue(s,'tax','income',999)&&s.taxes.income===60,'Income tax slider clamp failed.');
 assert(setPolicyValue(s,'budget','education',-999)&&s.budget.education===.5,'Budget slider minimum clamp failed.');
 assert(!setPolicyValue(s,'tax','notARealTax',20),'Invalid tax key was accepted.');
 assert(!setPolicyValue(s,'notAGroup','income',20),'Invalid policy group was accepted.');
 const govHTML=shell(s,'government'),tradeHTML=shell(s,'trade');
 assert((govHTML.match(/data-range=/g)||[]).length===15,'Government screen should render 15 policy sliders.');
 assert((tradeHTML.match(/data-range=/g)||[]).length===1,'Trade screen should render one tariff slider.');
 assert(!/NaN|undefined/.test(govHTML),'Government slider markup contains NaN/undefined.');
 assert(!/NaN|undefined/.test(tradeHTML),'Trade slider markup contains NaN/undefined.');
 const mainSource=fs.readFileSync(path.join(root,'main.js'),'utf8');
 assert(!mainSource.includes('state[r.dataset.range]'),'Old broken direct slider state-path code is still present.');
 assert(mainSource.includes('setPolicyValue(state,group,key,value)'),'Client slider binding is not using validated policy mapping.');
}catch(err){failures.push(`Policy slider regression test crashed: ${err?.stack||err}`)}

// Defensive action validation regressions.
try{
 const s=createState(COUNTRIES[0],'normal',{});
 let treasury=s.treasury,debt=s.debt;
 assert(!borrow(s,-100)&&s.treasury===treasury&&s.debt===debt,'Negative borrowing changed state.');
 assert(repayDebt(s,-100)===0&&s.treasury===treasury&&s.debt===debt,'Negative debt repayment changed state.');
 assert(!buyResource(s,'does-not-exist',20),'Invalid resource import was accepted.');
 assert(!buyResource(s,'oil',-20),'Negative resource import was accepted.');
 assert(!exportResource(s,'oil',-20),'Negative resource export was accepted.');
 assert(!investIndustry(s,'agriculture',-200),'Negative industry investment was accepted.');
}catch(err){failures.push(`Action validation regression test crashed: ${err?.stack||err}`)}

// Zero stock must remain zero when production cannot cover consumption; it must not magically refill.
try{
 const s=createState(COUNTRIES[0],'normal',{});const r=s.resources.oil;r.stock=0;r.production=0;r.consumption=5;const inflation=s.inflation;updateResources(s);assert(r.stock===0,'Zero resource stock was incorrectly replenished by fallback inventory.');assert(s.inflation>=inflation,'Resource shortage failed to apply shortage pressure.');
}catch(err){failures.push(`Resource-stock regression test crashed: ${err?.stack||err}`)}

// Constant/zero chart series must still have finite, non-zero chart bounds.
try{const b=chartBounds([0,0,0]);assert(b&&Number.isFinite(b.min)&&Number.isFinite(b.max)&&b.max>b.min,'Constant zero chart bounds are invalid.')}catch(err){failures.push(`Chart-bounds regression test crashed: ${err?.stack||err}`)}

// Older/malformed local saves should be repaired enough for every major view to render.
try{
 const broken=createState(COUNTRIES[0],'normal',{});delete broken.taxes;broken.budget.education=NaN;broken.lastMonthly=null;broken.notifications=null;broken.history=null;broken.resources.oil.stock=0;broken.settings=null;
 const repaired=repairState(broken);assert(repaired&&repaired.taxes&&Number.isFinite(repaired.budget.education),'Save-state repair failed to restore policy data.');
 for(const view of ['dashboard','government','industry','resources','trade','technology','infrastructure','diplomacy','commonwealth','analytics','tutorial','preferences','saves']){const html=shell(repaired,view);assert(typeof html==='string'&&html.length>20,`View ${view} failed to render after save repair.`);assert(!html.includes('undefined'),`View ${view} rendered undefined after save repair.`)}
}catch(err){failures.push(`Save repair/view render test crashed: ${err?.stack||err}`)}

if(failures.length){
 console.error(`\nAURORAL COMMONWEALTH v6.1 validation FAILED (${failures.length} issue${failures.length===1?'':'s'}):`);
 for(const f of failures.slice(0,60))console.error(`- ${f}`);
 if(failures.length>60)console.error(`- ...and ${failures.length-60} more.`);
 process.exit(1);
}
console.log('AURORAL COMMONWEALTH v6.1 validation PASS');
console.log(`- ${COUNTRIES.length} selectable entries / ${ids.size} unique IDs`);
console.log('- every JS/MJS file parses');
console.log('- every country completed a 12-month finite-value simulation');
console.log('- all tax/budget slider mappings, clamps and markup passed');
console.log('- invalid/negative economy actions are rejected safely');
console.log('- zero-stock resource regression passed');
console.log('- constant chart bounds regression passed');
console.log('- malformed/older save-state repair and all major view renders passed');
