import {RESOURCE_DEFS} from '../data/resources.js';

const baseBudget={education:4.0,healthcare:4.5,infrastructure:3.5,defense:2.5,science:2.0,energy:1.7,transport:1.7,welfare:3.5,administration:1.5,environment:1.0};
const baseTaxes={income:18,corporate:22,sales:9,tariff:4,resource:8};
const sectors={agriculture:10,mining:7,manufacturing:16,electronics:9,automobile:8,aerospace:4,energy:8,construction:8,software:10,tourism:7,banking:8,healthcare:5,entertainment:5};
const baseBuildings={roads:1,railways:1,airports:1,ports:1,powerPlants:1,hospitals:1,schools:1,universities:1,factories:1,dataCenters:0,researchCenters:0};
const baseSettings={sound:false,music:false,animations:true,notifications:true,theme:'system',density:'comfortable',highContrast:false,autosaveInterval:3};
const baseMix={coal:23,gas:20,nuclear:15,solar:16,wind:14,hydro:12};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=(v,fallback)=>Number.isFinite(Number(v))?Number(v):fallback;
const finitePositive=(v,fallback)=>{const n=finite(v,fallback);return n>0?n:fallback};

export function createState(country,difficulty='normal',custom={}){
 const mult={easy:1.35,normal:1,hard:.8,nightmare:.62}[difficulty]||1;
 const resources={};
 for(const k of Object.keys(RESOURCE_DEFS)){
  resources[k]=structuredClone(country.resources?.[k]||{reserve:1000,production:2,consumption:2});
  resources[k].price=RESOURCE_DEFS[k].basePrice;
 }
 const population=finitePositive(custom.population,country.population);
 const treasury=Number.isFinite(Number(custom.treasury))&&Number(custom.treasury)>=0?Number(custom.treasury):country.treasury;
 const tech=finite(custom.tech,country.tech),infra=finite(custom.infra,country.infra);
 const s={version:1,difficulty,countryId:country.id,name:custom.name||country.name,flag:custom.flag||country.flag||'🏳️',capital:custom.capital||country.capital||'Capital City',currency:custom.currency||country.currency||'AR',governmentType:custom.governmentType||'Constitutional Republic',geography:custom.geography||'Mixed',nationalColor:custom.nationalColor||'#72d7ff',date:{year:2035,month:0},speed:0,
  population,gdp:finitePositive(country.gdp,population*20),treasury:treasury*mult,debt:Math.max(0,finite(country.debt,0)),inflation:finite(country.inflation,3),unemployment:finite(country.unemployment,6),approval:finite(country.approval,55),stability:finite(country.stability,70),legitimacy:75,
  techLevel:tech,infra,military:finite(country.military,55),education:72,healthcare:74,productivity:1,industryIndex:100,consumerConfidence:70,moneySupply:100,
  taxes:{...baseTaxes,income:Number.isFinite(+custom.taxRate)?clamp(+custom.taxRate,0,60):baseTaxes.income},budget:{...baseBudget},trade:{exports:country.gdp*.12,imports:country.gdp*.11,agreements:1,balance:0,tariffRevenue:0},energy:{capacity:Math.max(60,(country.gdp/300+population*.06+22)/.94*1.06),production:Math.max(58,(country.gdp/300+population*.06+22)*1.06),consumption:country.gdp/300+population*.06+22,imported:0,mix:{...baseMix}},
  resources,industries:Object.fromEntries(Object.entries(sectors).map(([k,v])=>[k,{level:v,workers:Math.max(.1,population*v/800),revenue:country.gdp*v/100,cost:country.gdp*v/145,investment:0}])),
  research:{points:0,active:null,completed:[],researchers:Math.max(.1,population*.006)},diplomacy:{reputation:50,relations:{},sanctions:0,aid:0},commonwealth:{member:true,contribution:country.gdp*.0012,rank:0,votes:1,projects:0},
  buildings:{...baseBuildings},notifications:[],achievements:[],history:[],collapseStage:'Stable',autosave:true,settings:{...baseSettings},lastMonthly:{revenue:0,expenses:0,balance:0,growth:0,interest:0}};
 snapshot(s);return s;
}

// Repairs malformed/older local saves without changing valid current values.
export function repairState(s){
 if(!s||typeof s!=='object')return null;
 s.version=finite(s.version,1);
 s.difficulty=['easy','normal','hard','nightmare'].includes(s.difficulty)?s.difficulty:'normal';
 s.name=String(s.name||'Unnamed Nation');s.flag=String(s.flag||'🏳️');s.capital=String(s.capital||'Capital City');s.currency=String(s.currency||'AR');
 s.governmentType=String(s.governmentType||'Constitutional Republic');s.geography=String(s.geography||'Mixed');s.nationalColor=String(s.nationalColor||'#72d7ff');
 const year=Math.trunc(finite(s.date?.year,2035));const month=clamp(Math.trunc(finite(s.date?.month,0)),0,11);s.date={year,month};
 s.speed=[0,1,2,5,10].includes(Number(s.speed))?Number(s.speed):0;
 s.population=finitePositive(s.population,50);s.gdp=finitePositive(s.gdp,s.population*20);s.treasury=Math.max(0,finite(s.treasury,0));s.debt=Math.max(0,finite(s.debt,0));
 s.inflation=clamp(finite(s.inflation,3),.2,60);s.unemployment=clamp(finite(s.unemployment,6),1,35);s.approval=clamp(finite(s.approval,55),0,100);s.stability=clamp(finite(s.stability,70),0,100);s.legitimacy=clamp(finite(s.legitimacy,75),0,100);
 s.techLevel=clamp(finite(s.techLevel,70),10,100);s.infra=clamp(finite(s.infra,65),20,100);s.military=clamp(finite(s.military,55),10,100);s.education=clamp(finite(s.education,72),20,100);s.healthcare=clamp(finite(s.healthcare,74),20,100);
 s.productivity=finitePositive(s.productivity,1);s.industryIndex=finitePositive(s.industryIndex,100);s.consumerConfidence=clamp(finite(s.consumerConfidence,70),15,95);s.moneySupply=finitePositive(s.moneySupply,100);
 s.taxes={...baseTaxes,...(s.taxes&&typeof s.taxes==='object'?s.taxes:{})};
 for(const k of Object.keys(baseTaxes)){const max=k==='tariff'?40:60;s.taxes[k]=clamp(finite(s.taxes[k],baseTaxes[k]),0,max)}
 s.budget={...baseBudget,...(s.budget&&typeof s.budget==='object'?s.budget:{})};
 for(const k of Object.keys(baseBudget))s.budget[k]=clamp(finite(s.budget[k],baseBudget[k]),.5,12);
 s.trade={exports:s.gdp*.12,imports:s.gdp*.11,agreements:1,balance:0,tariffRevenue:0,...(s.trade&&typeof s.trade==='object'?s.trade:{})};
 for(const k of ['exports','imports','balance','tariffRevenue'])s.trade[k]=finite(s.trade[k],0);s.trade.agreements=Math.max(0,Math.trunc(finite(s.trade.agreements,1)));
 const defaultConsumption=s.gdp/300+s.population*.06+22;
 s.energy={capacity:Math.max(60,defaultConsumption*1.12),production:Math.max(58,defaultConsumption*1.06),consumption:defaultConsumption,imported:0,mix:{...baseMix},...(s.energy&&typeof s.energy==='object'?s.energy:{})};
 s.energy.mix={...baseMix,...(s.energy.mix&&typeof s.energy.mix==='object'?s.energy.mix:{})};
 for(const k of ['capacity','production','consumption','imported'])s.energy[k]=Math.max(0,finite(s.energy[k],k==='consumption'?defaultConsumption:0));
 for(const k of Object.keys(baseMix))s.energy.mix[k]=Math.max(0,finite(s.energy.mix[k],baseMix[k]));
 const repairedResources={};
 for(const [k,d] of Object.entries(RESOURCE_DEFS)){
  const r=s.resources?.[k]||{};
  repairedResources[k]={...r,reserve:Math.max(0,finite(r.reserve,1000)),production:Math.max(0,finite(r.production,2)),consumption:Math.max(0,finite(r.consumption,2)),price:Math.max(0,finite(r.price,d.basePrice))};
  if(r.stock!==undefined)repairedResources[k].stock=Math.max(0,finite(r.stock,0));
 }
 s.resources=repairedResources;
 const repairedIndustries={};
 for(const [k,v] of Object.entries(sectors)){
  const x=s.industries?.[k]||{};
  repairedIndustries[k]={...x,level:finitePositive(x.level,v),workers:Math.max(.05,finite(x.workers,Math.max(.1,s.population*v/800))),revenue:Math.max(0,finite(x.revenue,s.gdp*v/100)),cost:Math.max(0,finite(x.cost,s.gdp*v/145)),investment:Math.max(0,finite(x.investment,0))};
 }
 s.industries=repairedIndustries;
 s.research={points:0,active:null,completed:[],researchers:Math.max(.1,s.population*.006),...(s.research&&typeof s.research==='object'?s.research:{})};
 s.research.points=Math.max(0,finite(s.research.points,0));s.research.researchers=Math.max(0,finite(s.research.researchers,.1));s.research.completed=Array.isArray(s.research.completed)?s.research.completed:[];
 if(s.research.active&&typeof s.research.active==='object'){s.research.active.progress=clamp(finite(s.research.active.progress,0),0,100);s.research.active.paid=Math.max(0,finite(s.research.active.paid,0))}else s.research.active=null;
 s.diplomacy={reputation:50,relations:{},sanctions:0,aid:0,...(s.diplomacy&&typeof s.diplomacy==='object'?s.diplomacy:{})};s.diplomacy.relations=s.diplomacy.relations&&typeof s.diplomacy.relations==='object'?s.diplomacy.relations:{};for(const [id,value] of Object.entries(s.diplomacy.relations))s.diplomacy.relations[id]=clamp(finite(value,0),-100,100);s.diplomacy.reputation=clamp(finite(s.diplomacy.reputation,50),0,100);s.diplomacy.sanctions=Math.max(0,finite(s.diplomacy.sanctions,0));s.diplomacy.aid=Math.max(0,finite(s.diplomacy.aid,0));
 s.commonwealth={member:true,contribution:s.gdp*.0012,rank:0,votes:1,projects:0,...(s.commonwealth&&typeof s.commonwealth==='object'?s.commonwealth:{})};
 for(const k of ['contribution','rank','votes','projects'])s.commonwealth[k]=Math.max(0,finite(s.commonwealth[k],0));
 s.buildings={...baseBuildings,...(s.buildings&&typeof s.buildings==='object'?s.buildings:{})};for(const k of Object.keys(baseBuildings))s.buildings[k]=Math.max(0,Math.trunc(finite(s.buildings[k],baseBuildings[k])));
 s.notifications=Array.isArray(s.notifications)?s.notifications:[];s.achievements=Array.isArray(s.achievements)?s.achievements:[];s.history=Array.isArray(s.history)?s.history:[];
 s.collapseStage=['Stable','Warning','Crisis','Emergency','Collapse'].includes(s.collapseStage)?s.collapseStage:'Stable';s.autosave=s.autosave!==false;
 s.settings={...baseSettings,...(s.settings&&typeof s.settings==='object'?s.settings:{})};
 s.lastMonthly={revenue:0,expenses:0,balance:0,growth:0,interest:0,...(s.lastMonthly&&typeof s.lastMonthly==='object'?s.lastMonthly:{})};for(const k of ['revenue','expenses','balance','growth','interest'])s.lastMonthly[k]=finite(s.lastMonthly[k],0);
 return s;
}

export function snapshot(s){if(!Array.isArray(s.history))s.history=[];s.history.push({year:s.date.year,month:s.date.month,gdp:s.gdp,inflation:s.inflation,population:s.population,debt:s.debt,unemployment:s.unemployment,exports:s.trade.exports,imports:s.trade.imports,energy:s.energy.production,industry:s.industryIndex,revenue:s.lastMonthly.revenue,expenses:s.lastMonthly.expenses});if(s.history.length>180)s.history.shift()}
export function advanceDate(s){s.date.month++;if(s.date.month>11){s.date.month=0;s.date.year++}}
