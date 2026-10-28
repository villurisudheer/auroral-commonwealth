import {repairState,snapshot,advanceDate} from './generated/game/state.js';
import {computeMonthlyEconomy} from './generated/game/economy.js';
import {applyGovernmentEffects,setPolicyValue} from './generated/game/government.js';
import {updateResources,updateEnergy} from './generated/game/resources.js';
import {updateTrade,signTradeAgreement,buyResource,exportResource} from './generated/game/trade.js';
import {updateIndustries,investIndustry} from './generated/game/industries.js';
import {updateResearch,startResearch} from './generated/game/technology.js';
import {checkAchievements} from './generated/game/achievements.js';
import {updateCollapse} from './generated/game/collapse.js';
import {maybeEvent,getPending,resolveEvent} from './generated/game/events.js';
import {build} from './generated/game/infrastructure.js';
import {negotiate,sanction} from './generated/game/diplomacy.js';
import {ENGINE_VERSION} from './generated/version.js';
import {clone,ledger,attach,detach,seeded,sample,diagnostics,SCHEMA,LIMITS,uniqueId} from './core.js';
export {ENGINE_VERSION};
const actions={build,investIndustry,startResearch,signTradeAgreement,buyResource,exportResource,negotiate,sanction};
export function validateJSON(value){
 let count=0;const visit=(x,depth)=>{if(++count>1_000_000||depth>14)throw Error('Data is too complex');if(typeof x==='number'&&(!Number.isFinite(x)||Math.abs(x)>1e12))throw Error('Invalid numeric value');if(typeof x==='string'&&x.length>16000)throw Error('Text field too long');if(x&&typeof x==='object'){for(const [k,v] of Object.entries(x)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Unsafe object key');visit(v,depth+1)}}else if(!['string','number','boolean'].includes(typeof x)&&x!==null)throw Error('Non-JSON data')};
 visit(value,0);if(JSON.stringify(value).length>LIMITS.bytes)throw Error('Data exceeds 4 MB limit');return value;
}
export function prepareState(source){
 validateJSON(source);if(!source||typeof source!=='object'||Array.isArray(source)||source.multiplayer||typeof source.countryId!=='string'||!source.countryId||!source.date||!source.resources||typeof source.resources!=='object'||Array.isArray(source.resources)||!source.industries||typeof source.industries!=='object'||Array.isArray(source.industries)||!Number.isFinite(source.gdp)||source.gdp<=0)throw Error('A valid single-player state is required');
 const s=repairState(clone(source));s.speed=0;s.autosave=false;return s;
}
export function validateAction(a,horizon){
 if(!a||!Number.isInteger(a.month)||a.month<0||a.month>=horizon)throw Error('Action month is outside the experiment');
 if(a.type==='policy'){if(!['tax','budget'].includes(a.group)||typeof a.key!=='string'||!Number.isFinite(a.value))throw Error('Invalid policy');}
 else if(!Object.hasOwn(actions,a.type)||!Array.isArray(a.args)||a.args.length>2||a.args.some(x=>!['number','string'].includes(typeof x)))throw Error('Unsupported experiment action');
 return a;
}
export function applyAction(s,a){
 if(a.type==='policy')return setPolicyValue(s,a.group,a.key,a.value);
 if(a.type==='negotiate'||a.type==='sanction'){if(typeof a.args[0]!=='string'||!Object.hasOwn(s.diplomacy.relations,a.args[0]))return false}
 return actions[a.type]?.(s,...a.args)!==false;
}
export function createExperiment(source,{id=uniqueId(),name='Worldline experiment',seed=2035,horizon=12,branches=[{id:'alternative',name:'Alternative policy',actions:[]}]}={}){
 return validateExperiment({schema:SCHEMA,kind:'auroral-worldline',engineVersion:ENGINE_VERSION,id,name,seed,horizon,baseline:prepareState(source),branches});
}
export function validateExperiment(value){
 validateJSON(value);if(value?.schema!==SCHEMA||value?.kind!=='auroral-worldline'||value.engineVersion!==ENGINE_VERSION)throw Error('Unsupported experiment schema or engine version');
 if(typeof value.id!=='string'||!value.id||value.id.length>100||typeof value.name!=='string'||value.name.length>100)throw Error('Invalid experiment identity');
 if(!Number.isInteger(value.seed)||value.seed<0||value.seed>0xffffffff||![3,6,12,24].includes(value.horizon))throw Error('Invalid seed or horizon');
 if(!Array.isArray(value.branches)||value.branches.length<1||value.branches.length>3)throw Error('Choose one to three alternative branches');
 const ids=new Set(['baseline']);for(const b of value.branches){if(typeof b.id!=='string'||!b.id||b.id.length>100||ids.has(b.id)||typeof b.name!=='string'||b.name.length>100||!Array.isArray(b.actions)||b.actions.length>48)throw Error('Invalid branch');ids.add(b.id);for(const a of b.actions){validateAction(a,value.horizon);if(a.type==='policy'){const state=prepareState(value.baseline);if(!setPolicyValue(state,a.group,a.key,a.value))throw Error('Invalid policy key')}}}
 const result=clone(value);result.baseline=prepareState(value.baseline);return result;
}
export function step(s){
 // Exact execution order audited against main.js:monthStep and server.mjs:tickState.
 computeMonthlyEconomy(s);applyGovernmentEffects(s);updateResources(s);updateEnergy(s);updateTrade(s);updateIndustries(s);updateResearch(s);checkAchievements(s);updateCollapse(s);advanceDate(s);snapshot(s);maybeEvent(s);
}
export async function runExperiment(raw,{onProgress=()=>{},yieldControl=()=>new Promise(r=>setTimeout(r,0)),signal}={}){
 const exp=validateExperiment(raw),results=[];
 const branches=[{id:'baseline',name:'Original baseline',actions:[]},...exp.branches];
 let done=0;const total=branches.length*exp.horizon;
 for(const b of branches){
  const s=prepareState(exp.baseline),book=ledger(`${exp.id}/${b.id}`,'isolated-worldline');
  attach(s,book,{rng:seeded(exp.seed),experimentId:exp.id,branchId:b.id});
  const series=[sample(s)],applied=[];
  try{
   for(let m=0;m<exp.horizon;m++){
    if(signal?.aborted)throw Error('Simulation cancelled');
    for(const a of b.actions.filter(x=>x.month===m)){
     const before=clone(a);const ok=applyAction(s,a);applied.push({...before,accepted:ok,effectiveValue:a.type==='policy'?(a.group==='tax'?s.taxes:s.budget)[a.key]:null,appliedDate:clone(s.date)});
    }
    // Explicit, identical event strategy: cheapest affordable option (original order breaks ties).
    const e=getPending(s);if(e){const choices=e.choices.map((c,i)=>({c,i})).filter(x=>x.c.cost<=s.treasury).sort((a,b)=>a.c.cost-b.c.cost);if(choices.length)resolveEvent(s,choices[0].i)}
    step(s);if(diagnostics(s).some(d=>d.issue==='Non-finite value'))throw Error('Engine produced a non-finite value');
    series.push(sample(s));done++;onProgress({done,total,branch:b.name,month:m+1});await yieldControl();
   }
   results.push({id:b.id,name:b.name,series,applied,ledger:book,finalState:clone(s)});
  }finally{detach(s)}
 }
 return {schema:SCHEMA,experimentId:exp.id,engineVersion:ENGINE_VERSION,results,eventStrategy:'Cheapest affordable event choice, in definition order on ties; resolved before the next monthly step. New final-month events remain pending.'};
}
export function parseExperiment(text){if(typeof text!=='string'||text.length>LIMITS.bytes)throw Error('Experiment file exceeds size limit');const parsed=JSON.parse(text);if(parsed&&typeof parsed==='object')delete parsed.result;return validateExperiment(parsed)}
