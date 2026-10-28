// Shared causal records. Runtime bindings live outside game state and saves.
export const SCHEMA=1;
export const LIMITS={events:320,traces:800,snapshots:12,experiments:5,bytes:4_000_000};
const contexts=new WeakMap();
export const clone=x=>structuredClone(x);
export const uniqueId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
export const tick=s=>s.date.year*12+s.date.month;
export const dateLabel=d=>`${d.year}-${String(d.month+1).padStart(2,'0')}`;
export function seeded(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296}}
export function stateRandom(s){return contexts.get(s)?.rng?.()??Math.random()}
export function ledger(id,scope='single-player'){return {schema:SCHEMA,id,scope,seq:0,events:[],traces:[],snapshots:[]}}
export function attach(s,book,{rng,onChange,experimentId=null,branchId=null}={}){
 contexts.set(s,{book,rng,onChange,experimentId,branchId});return s;
}
export function detach(s){contexts.delete(s)}
const safeKeys=new Set(['__proto__','prototype','constructor']);
export function flatten(value,prefix='',out={},depth=0){
 if(depth>7)return out;
 if(typeof value==='number'||typeof value==='string'||typeof value==='boolean'||value===null){out[prefix]=value;return out}
 if(!value||typeof value!=='object'||Array.isArray(value))return out;
 for(const [k,v] of Object.entries(value)){if(safeKeys.has(k)||['history','notifications','settings'].includes(k))continue;flatten(v,prefix?prefix+'.'+k:k,out,depth+1)}
 return out;
}
const METRICS=[
 ['gdp','GDP','B currency'],['lastMonthly.growth','Monthly GDP growth','%'],['treasury','Treasury','B currency'],['debt','Sovereign debt','B currency'],['inflation','Inflation','%'],['unemployment','Unemployment','%'],['consumerConfidence','Consumer confidence','index'],['lastMonthly.revenue','Monthly revenue','B currency'],['lastMonthly.expenses','Monthly expenditure','B currency'],['lastMonthly.interest','Monthly interest','B currency'],['energy.production','Energy production','model units'],['energy.consumption','Energy consumption','model units'],['industryIndex','Industry','index'],['infra','Infrastructure','index'],['techLevel','Technology','index'],['trade.balance','Trade balance','B currency'],['approval','Public approval','%'],['stability','Political stability','%']
];
export const metrics=METRICS;
export function sample(s){const flat=flatten(s), values={};for(const [key] of METRICS)values[key]=Number.isFinite(flat[key])?flat[key]:null;for(const [key,r] of Object.entries(s.resources))values['resources.'+key+'.stock']=Number.isFinite(r.stock)?r.stock:null;return {date:clone(s.date),values,crisis:s.collapseStage}}
export function metricList(s){return [...METRICS,...Object.keys(s.resources).map(k=>['resources.'+k+'.stock',k+' stock','model units'])]}
const INPUTS={
 monthStep:['gdp','taxes','budget','energy','trade','resources','industries','research','infra','techLevel','education','industryIndex','consumerConfidence','debt','inflation','buildings','approval','unemployment','healthcare','collapseStage'],
 computeMonthlyEconomy:['gdp','taxes','budget','energy','trade','infra','techLevel','education','industryIndex','consumerConfidence','debt','inflation','buildings','approval','unemployment','healthcare'],
 applyGovernmentEffects:['budget','taxes','inflation','unemployment','approval','stability','healthcare'],
 updateResources:['resources'],updateEnergy:['energy','gdp','population','industryIndex','techLevel'],updateTrade:['trade','taxes','techLevel','infra','education','industryIndex','gdp'],updateIndustries:['industries','productivity','techLevel','inflation','unemployment','gdp'],updateResearch:['research','budget','treasury'],updateCollapse:['debt','gdp','inflation','unemployment','approval','stability','energy'],maybeEvent:['pendingEvent'],resolveEvent:['pendingEvent','treasury']
};
const monthly=new Set(['computeMonthlyEconomy','applyGovernmentEffects','updateResources','updateEnergy','updateTrade','updateIndustries','updateResearch','checkAchievements','updateCollapse','maybeEvent','monthStep']);
function trim(a,n){if(a.length>n)a.splice(0,a.length-n)}
export function record(book,entry){const item={schema:SCHEMA,id:`${book.id}:e${++book.seq}`,...entry};book.events.push(item);trim(book.events,LIMITS.events);return item}
export function observe(s,rule,execute,args=[],captured=null){
 const ctx=contexts.get(s);if(!ctx)return execute();
 // Observer failures must never replay or prevent the engine operation.
 let before,inputs;try{before=captured?.before??flatten(s);inputs=captured?.inputs??{};if(!captured)for(const k of INPUTS[rule]||['treasury','debt','taxes','budget'])inputs[k]=clone(s[k]??null)}catch{}
 const result=execute();
 try{
  if(!before)return result;
  const after=flatten(s),changes={};for(const key of new Set([...Object.keys(before),...Object.keys(after)])){if(['date.month','date.year','speed'].includes(key))continue;if(before[key]!==after[key]){const a=before[key]??null,b=after[key]??null;changes[key]={before:a,after:b,delta:typeof a==='number'&&typeof b==='number'?b-a:null}}}
  const action=!monthly.has(rule),rejected=action&&(result===false||result===0);
  if(Object.keys(changes).length||rejected||rule==='maybeEvent'){
   const book=ctx.book, category=rejected?'diagnostic':Object.hasOwn(changes,'collapseStage')?'crisis':rule==='maybeEvent'||rule==='resolveEvent'?'world-event':action?'decision':'simulation';
   const entry=record(book,{tick:tick(s),date:clone(s.date),countryId:s.countryId,category,source:rule,kind:action?'player-action':(rule==='maybeEvent'||rule==='monthStep')?'periodic-summary':'engine-rule',description:rejected?`Rejected ${rule}`:rule==='maybeEvent'?`Monthly state recorded${s.pendingEvent?' • pending '+s.pendingEvent.id:''}`:`${rule}: ${Object.keys(changes).length} recorded changes${changes.collapseStage?' • national condition '+changes.collapseStage.after:''}`,args:clone(args),changes,experimentId:ctx.experimentId,branchId:ctx.branchId});
   if(rule==='maybeEvent'||rule==='monthStep'){
    book.snapshots.push({id:`${book.id}:s${book.seq}`,eventId:entry.id,tick:tick(s),date:clone(s.date),state:clone(s)});trim(book.snapshots,LIMITS.snapshots);
   }
   if(rule!=='maybeEvent'){
    const trace={id:`${book.id}:t${book.seq}`,eventId:entry.id,rule,tick:entry.tick,date:entry.date,countryId:s.countryId,inputs,changes,evidence:'Executed function boundary; individual input contribution is not quantified.'};
    book.traces.push(trace);trim(book.traces,LIMITS.traces);entry.traceId=trace.id;
   }
   ctx.onChange?.(book);
  }
 }catch(error){ctx.lastError=String(error?.message||error)}
 return result;
}
export function diagnostics(s){const f=flatten(s),out=[];for(const [k,v] of Object.entries(f))if(typeof v==='number'&&!Number.isFinite(v))out.push({key:k,issue:'Non-finite value'});if(s.energy.production<s.energy.consumption)out.push({key:'energy',issue:'Production below consumption'});for(const [k,r] of Object.entries(s.resources))if(r.stock===0&&r.production<r.consumption)out.push({key:'resources.'+k,issue:'Stock exhausted; production below use'});if(s.collapseStage!=='Stable')out.push({key:'collapseStage',issue:s.collapseStage});if(Math.abs(s.lastMonthly.growth)>1)out.push({key:'lastMonthly.growth',issue:'Monthly GDP change exceeds 1%'});return out}
export function difference(a,b){if(!Number.isFinite(a)||!Number.isFinite(b))return {absolute:null,percent:null};return {absolute:b-a,percent:a===0?null:(b-a)/Math.abs(a)*100}}
export function report(book,type='Economic assessment'){
 const financial=e=>Object.keys(e.changes||{}).some(k=>/^(gdp|debt|treasury|inflation|unemployment|lastMonthly|taxes|budget|trade)/.test(k));
 const diplomatic=e=>/negotiate|sanction|TradeAgreement|cw|Partnership|Aid|Development|humanitarian|commonwealth/i.test(e.source);
 const crisis=e=>e.category==='crisis'||e.category==='diagnostic'||Object.hasOwn(e.changes||{},'collapseStage');
 const choices={
  'National history':['HISTORICAL DIRECTORATE','Chronology of retained national decisions, model outcomes and turning points.',()=>true],
  'Classified intelligence briefing':['STRATEGIC INTELLIGENCE BUREAU','Recorded decisions, incidents and national-condition changes for command review.',e=>crisis(e)||['decision','world-event'].includes(e.category)],
  'Economic assessment':['TREASURY ANALYSIS OFFICE','Observed fiscal and economic transitions. Values retain the engine’s native units.',financial],
  'Diplomatic memorandum':['FOREIGN RELATIONS SECRETARIAT','Recorded diplomatic and Commonwealth actions. No unrecorded treaty or conflict is inferred.',diplomatic],
  'Crisis investigation':['NATIONAL RESILIENCE COMMISSION','Crisis boundaries and the retained records immediately preceding them. Sequence alone does not establish cause.',()=>true],
  'Newspaper report':['COMMONWEALTH CHRONICLE','Recent recorded developments from the simulation. This is a fictional news digest.',e=>e.category!=='simulation'],
  'Commonwealth historical record':['COMMONWEALTH RECORDS COUNCIL','Retained cooperation, development, market-access and institutional decisions.',diplomatic],
  'Alternate-history chronicle':['WORLDLINE RESEARCH DIRECTORATE','Recorded branch chronology. These events describe an isolated experiment when its scope is isolated-worldline.',()=>true]
 };
 const [office,intro,filter]=choices[type]||choices['Economic assessment'];
 let entries=book.events.filter(filter);
 if(type==='Newspaper report')entries=entries.slice(-12);
 if(type==='Crisis investigation'){const indices=new Set();book.events.forEach((e,i)=>{if(crisis(e))for(let j=Math.max(0,i-6);j<=i;j++)indices.add(j)});entries=book.events.filter((_,i)=>indices.has(i))}
 const lines=[`AURORAL COMMONWEALTH / ${type.toUpperCase()}`,office,`Record ${book.id} • ${book.scope}`,intro,`Source: ${book.events.length} retained entries. Earlier history may be unavailable.`,type==='Classified intelligence briefing'?'Classification: FICTIONAL / COMMAND EYES ONLY':'Classification: FICTIONAL / PUBLIC RECORD',''];
 if(book.scope==='imported-record')lines.push('PROVENANCE: Imported user-supplied records; not authenticated engine evidence.','');
 if(!entries.length)lines.push('No matching events exist in the retained record.');
 for(const e of entries){lines.push(`[${dateLabel(e.date)}] ${e.id} / ${e.countryId} / ${e.category}: ${e.description}`);for(const [key,c] of Object.entries(e.changes||{}))lines.push(`  ${key}: ${c.before} → ${c.after}${Number.isFinite(c.delta)?` (Δ ${c.delta.toFixed(4)})`:''}`)}
 lines.push('','ASSESSMENT: These records establish sequence and observed changes. Function-level traces do not isolate each input’s causal contribution. No unrecorded treaties, conflicts or decisions are inferred.');return lines.join('\n');
}

// Additive rule transforms let optional game extensions participate in the isolated engine.
// Existing instrumentation above is retained; transforms run inside its before/after boundary.
const extensionRuleTransforms=new Map();
export function registerRuleTransform(id,transform){if(typeof id!=='string'||typeof transform!=='function')throw Error('Invalid rule transform');extensionRuleTransforms.set(id,transform);return ()=>extensionRuleTransforms.delete(id)}
const extensionBaseObserve=observe;
observe=function(state,rule,execute,args=[],captured=null){if(captured)return extensionBaseObserve(state,rule,execute,args,captured);let operation=execute;for(const transform of [...extensionRuleTransforms.values()].reverse()){const previous=operation;operation=()=>transform(state,rule,previous,args)}return extensionBaseObserve(state,rule,operation,args,captured)};
