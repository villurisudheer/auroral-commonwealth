// Shared feature and action contract. No original game functions are replaced.
export const AI_VERSION='1.0.0';
export const HORIZON=6;
export const TAX_KEYS=['income','corporate','sales','tariff','resource'];
export const BUDGET_KEYS=['education','healthcare','infrastructure','defense','science','energy','transport','welfare','administration','environment'];
export const TARGETS=['GDP growth advantage (pp)','Treasury advantage (% of starting GDP)','Additional debt (% of starting GDP)','Approval advantage (pp)','Stability advantage (pp)','Additional inflation (pp)','Additional unemployment (pp)'];
export const FEATURES=['log GDP','log population','treasury / GDP','debt / GDP','inflation','unemployment','approval','stability','technology','infrastructure','education','healthcare','industry','confidence','energy coverage','exports / GDP','imports / GDP','normalised difficulty',...TAX_KEYS.map(k=>'current tax '+k),...BUDGET_KEYS.map(k=>'current budget '+k),...TAX_KEYS.map(k=>'proposed tax '+k),...BUDGET_KEYS.map(k=>'proposed budget '+k),...TAX_KEYS.map(k=>'tax change '+k),...BUDGET_KEYS.map(k=>'budget change '+k)];
export const OBJECTIVES={balanced:[1,.45,-.7,.65,.8,-.6,-.65],growth:[2,.15,-.25,.2,.3,-.3,-.8],solvency:[.25,1.1,-1.3,.15,.3,-.35,-.25]};
export const PROFILES=[
 {id:'hold',name:'Keep current policy',changes:[],description:'Leave taxes and spending unchanged.'},
 {id:'revenue',name:'Revenue buffer',changes:[['tax','income',3],['tax','sales',1]],description:'Raise income tax by 3 pp and sales tax by 1 pp.'},
 {id:'growth',name:'Business relief',changes:[['tax','corporate',-3],['tax','income',-2]],description:'Lower corporate tax by 3 pp and income tax by 2 pp.'},
 {id:'services',name:'Public services',changes:[['budget','healthcare',.7],['budget','welfare',.7]],description:'Add 0.7% of GDP to healthcare and welfare each.'},
 {id:'skills',name:'Skills & infrastructure',changes:[['budget','education',.7],['budget','infrastructure',.7],['budget','science',.4]],description:'Add 0.7% of GDP to education and infrastructure, and 0.4% to science.'},
 {id:'saving',name:'Spending restraint',changes:[['budget','administration',-.5],['budget','defense',-.5],['budget','welfare',-.3]],description:'Reduce administration and defense by 0.5% of GDP each, and welfare by 0.3%.'},
 {id:'energy',name:'Energy & transport',changes:[['budget','energy',.8],['budget','transport',.5]],description:'Add 0.8% of GDP to energy spending and 0.5% to transport.'}
];
export function planFor(s,id){const profile=PROFILES.find(p=>p.id===id);if(!profile)throw Error('Unknown policy profile');return {id:profile.id,name:profile.name,description:profile.description,actions:profile.changes.map(([group,key,delta])=>({month:0,type:'policy',group,key,value:Math.round(Math.max(group==='tax'?0:.5,Math.min(group==='tax'?(key==='tariff'?40:60):12,(group==='tax'?s.taxes:s.budget)[key]+delta))*10)/10}))};}
export function validatePlan(s,plan){
 if(!plan||!Array.isArray(plan.actions)||plan.actions.length>15)throw Error('Invalid policy plan');const seen=new Set();
 for(const a of plan.actions){const keys=a.group==='tax'?TAX_KEYS:a.group==='budget'?BUDGET_KEYS:[];const key=a.group+'/'+a.key;const max=a.group==='tax'?(a.key==='tariff'?40:60):12;if(a.type!=='policy'||a.month!==0||!keys.includes(a.key)||!Number.isFinite(a.value)||a.value<(a.group==='tax'?0:.5)||a.value>max||seen.has(key)||!Number.isFinite((a.group==='tax'?s.taxes:s.budget)?.[a.key]))throw Error('Unsupported or invalid policy action');seen.add(key)}return plan;
}
export function features(s,plan){
 validatePlan(s,plan);const t={...s.taxes},b={...s.budget};for(const a of plan.actions)(a.group==='tax'?t:b)[a.key]=a.value;
 const g=Math.max(1,s.gdp);const x=[Math.log1p(s.gdp),Math.log1p(s.population),s.treasury/g,s.debt/g,s.inflation,s.unemployment,s.approval,s.stability,s.techLevel,s.infra,s.education,s.healthcare,s.industryIndex,s.consumerConfidence,s.energy.production/Math.max(1,s.energy.consumption),s.trade.exports/g,s.trade.imports/g,['easy','normal','hard','nightmare'].indexOf(s.difficulty)/3,...TAX_KEYS.map(k=>s.taxes[k]),...BUDGET_KEYS.map(k=>s.budget[k]),...TAX_KEYS.map(k=>t[k]),...BUDGET_KEYS.map(k=>b[k]),...TAX_KEYS.map(k=>t[k]-s.taxes[k]),...BUDGET_KEYS.map(k=>b[k]-s.budget[k])];
 if(x.some(n=>!Number.isFinite(n)))throw Error('Game state has missing or non-finite ML inputs');return x;
}
export function outcomes(before,after){return [(after.gdp/before.gdp-1)*100,(after.treasury-before.treasury)/before.gdp*100,(after.debt-before.debt)/before.gdp*100,after.approval-before.approval,after.stability-before.stability,after.inflation-before.inflation,after.unemployment-before.unemployment];}
export function fingerprint(s){
 // All engine-relevant fields, including nested stocks/research/events. UI/saves do not invalidate a plan.
 const copy={...s};for(const k of ['history','notifications','settings','speed','autosave'])delete copy[k];return JSON.stringify(copy);
}
export function gameContext(s){
 const n=x=>Number.isFinite(x)?Math.round(x*10000)/10000:null;
 return {name:String(s.name).slice(0,100),countryId:String(s.countryId).slice(0,100),era:s.atlas?.era||null,date:s.date,difficulty:s.difficulty,gdp:n(s.gdp),treasury:n(s.treasury),debt:n(s.debt),inflation:n(s.inflation),unemployment:n(s.unemployment),approval:n(s.approval),stability:n(s.stability),technology:n(s.techLevel),infrastructure:n(s.infra),taxes:Object.fromEntries(TAX_KEYS.map(k=>[k,n(s.taxes[k])])),budget:Object.fromEntries(BUDGET_KEYS.map(k=>[k,n(s.budget[k])])),energy:{production:n(s.energy.production),consumption:n(s.energy.consumption)},lastMonthly:{revenue:n(s.lastMonthly.revenue),expenses:n(s.lastMonthly.expenses),balance:n(s.lastMonthly.balance)},pendingEvent:!!s.pendingEvent,limitations:'Fictional game economics; historical scenarios have synthetic statistics. Maps contain documented source uncertainty.'};
}
