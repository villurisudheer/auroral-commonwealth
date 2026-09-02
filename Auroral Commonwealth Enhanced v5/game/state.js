import {RESOURCE_DEFS} from '../data/resources.js';

const baseBudget={education:4.0,healthcare:4.5,infrastructure:3.5,defense:2.5,science:2.0,energy:1.7,transport:1.7,welfare:3.5,administration:1.5,environment:1.0};
const baseTaxes={income:18,corporate:22,sales:9,tariff:4,resource:8};
const sectors={agriculture:10,mining:7,manufacturing:16,electronics:9,automobile:8,aerospace:4,energy:8,construction:8,software:10,tourism:7,banking:8,healthcare:5,entertainment:5};
export function createState(country,difficulty='normal',custom={}){
 const mult={easy:1.35,normal:1,hard:.8,nightmare:.62}[difficulty]||1;
 const resources={}; for(const k of Object.keys(RESOURCE_DEFS)){resources[k]=structuredClone(country.resources?.[k]||{reserve:1000,production:2,consumption:2});resources[k].price=RESOURCE_DEFS[k].basePrice}
 const s={version:1,difficulty,countryId:country.id,name:custom.name||country.name,flag:custom.flag||country.flag||'🏳️',capital:custom.capital||'Capital City',currency:custom.currency||'AR',governmentType:custom.governmentType||'Constitutional Republic',geography:custom.geography||'Mixed',nationalColor:custom.nationalColor||'#72d7ff',date:{year:2035,month:0},speed:0,
 population:custom.population||country.population,gdp:country.gdp,treasury:(custom.treasury||country.treasury)*mult,debt:country.debt,inflation:country.inflation,unemployment:country.unemployment,approval:country.approval,stability:country.stability,legitimacy:75,
 techLevel:custom.tech||country.tech,infra:custom.infra||country.infra,military:country.military,education:72,healthcare:74,productivity:1,industryIndex:100,consumerConfidence:70,moneySupply:100,
 taxes:{...baseTaxes,income:Number.isFinite(+custom.taxRate)?+custom.taxRate:baseTaxes.income},budget:{...baseBudget},trade:{exports:country.gdp*.12,imports:country.gdp*.11,agreements:1,balance:0,tariffRevenue:0},energy:{capacity:Math.max(60,(country.gdp/300+country.population*.06+22)/.94*1.06),production:Math.max(58,(country.gdp/300+country.population*.06+22)*1.06),consumption:country.gdp/300+country.population*.06+22,imported:0,mix:{coal:23,gas:20,nuclear:15,solar:16,wind:14,hydro:12}},
 resources,industries:Object.fromEntries(Object.entries(sectors).map(([k,v])=>[k,{level:v,workers:Math.max(.1,country.population*v/800),revenue:country.gdp*v/100,cost:country.gdp*v/145,investment:0}])),
 research:{points:0,active:null,completed:[],researchers:Math.max(.1,country.population*.006)},diplomacy:{reputation:50,relations:{},sanctions:0,aid:0},commonwealth:{member:true,contribution:country.gdp*.0012,rank:0,votes:1,projects:0},
 buildings:{roads:1,railways:1,airports:1,ports:1,powerPlants:1,hospitals:1,schools:1,universities:1,factories:1,dataCenters:0,researchCenters:0},notifications:[],achievements:[],history:[],collapseStage:'Stable',autosave:true,settings:{sound:false,music:false,animations:true,notifications:true,theme:'system',density:'comfortable',highContrast:false,autosaveInterval:3},lastMonthly:{revenue:0,expenses:0,balance:0,growth:0,interest:0}};
 snapshot(s);return s;
}
export function snapshot(s){s.history.push({year:s.date.year,month:s.date.month,gdp:s.gdp,inflation:s.inflation,population:s.population,debt:s.debt,unemployment:s.unemployment,exports:s.trade.exports,imports:s.trade.imports,energy:s.energy.production,industry:s.industryIndex,revenue:s.lastMonthly.revenue,expenses:s.lastMonthly.expenses});if(s.history.length>180)s.history.shift()}
export function advanceDate(s){s.date.month++;if(s.date.month>11){s.date.month=0;s.date.year++}}
