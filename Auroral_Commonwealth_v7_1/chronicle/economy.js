import {ATLAS_META,COUNTRIES,epochFor,countryEpoch} from './registry.js';
import {MODERN_CURRENCIES} from './data/currencies.js';
import {BUILDINGS} from '../game/infrastructure.js';
import {TECHNOLOGIES} from '../data/technologies.js';
import {registerRuleTransform} from '../worldline/core.js';
export const ECONOMY_VERSION=1;
export const BUILD_YEAR={roads:1,ports:1,hospitals:1,schools:1,universities:1,railways:1830,airports:1910,powerPlants:1882,factories:1750,dataCenters:1950,researchCenters:1600};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function currencyFor(id,year){
 const row=ATLAS_META.get(id),name=(row?.sourceName||row?.name||COUNTRIES.find(c=>c.id===id)?.name||'').toLowerCase();
 if(year===2026){if(id==='pse')return {code:'ILS',name:'Israeli new shekel / JOD and USD also circulate',basis:'Mixed-currency scenario convention'};return MODERN_CURRENCIES[id]||{code:'LOCAL',name:row?.category==='Fictional'?'Fictional national currency':'Local accounting unit',basis:'Unverified / fictional scenario currency'}}
 const choose=(code,name)=>({code,name,basis:'Historical denomination convention; not a reconstructed exchange rate or complete monetary system'});
 if(/roman|rome/.test(name))return year<300?choose('DEN','Roman denarius'):choose('SOL','Roman / Byzantine solidus');
 if(/byzant|nicaean|trebizond/.test(name))return choose('HYP','Byzantine gold/silver accounts');
 if(/parth/.test(name))return choose('DRM','Parthian drachm');
 if(/tang|han dynasty|xin dynasty|cao cao|eastern wu|song|ming|qing|china|kuomintang|wei|xianbei/.test(name))return year<1900?choose('CASH','Chinese cash / silver accounts'):choose('YUAN','Chinese yuan (period circulation)');
 if(/mongol|great yuan/.test(name))return choose('SIL','Silver-weight / local money accounts');
 if(/abbasid|umayyad|mamluk sultanate|almohad|hafsid|ayyubid/.test(name))return choose('DIN','Dinar / dirham accounts');
 if(/united states/.test(name))return year>=1792?choose('USD','US dollar'):choose('SPAN$','Spanish milled dollar / mixed colonial money');
 if(/british india|^india$|mughal|maratha|sikh|hyderabad/.test(name))return choose('RUP','Rupee (period convention)');
 if(/delhi|mamluk dynasty/.test(name))return choose('TANKA','Silver / copper Sultanate accounts');
 if(/brit|united kingdom|england|scotland/.test(name))return choose('GBP','Pound sterling');
 if(/german|prussia/.test(name))return year>=1924?choose('RM','Reichsmark'):year>=1871?choose('MARK','German mark'):choose('THL','Thaler / regional German money');
 if(/austria|habsburg/.test(name))return year>=1892?choose('KR','Austro-Hungarian krone'):choose('GLD','Gulden / regional Habsburg money');
 if(/russia|soviet/.test(name))return choose('RUB',year>=1922?'Soviet ruble':'Russian ruble');
 if(/france|french|vichy/.test(name))return year>=1795?choose('FRF','French franc'):choose('LIV','French livre (account)');
 if(/ottoman|turkey/.test(name))return year>=1923?choose('TRL','Turkish lira'):year>=1844?choose('OTL','Ottoman lira'):year>=1688?choose('KUR','Ottoman kuruş'):choose('AKC','Ottoman akçe');
 if(/persia|iran|qajar|pahlavi/.test(name))return year>=1932||year<1825?choose('RIAL','Rial / regional Persian accounts'):choose('QIR','Persian qiran');
 if(/japan|tokugawa|kamakura|nara/.test(name))return year>=1871?choose('JPY','Japanese yen'):choose('MON','Japanese mon / ryō accounts');
 if(/spain|castile|aragon/.test(name))return year>=1868?choose('ESP','Spanish peseta'):choose('REAL','Spanish real / regional accounts');
 if(/portug/.test(name))return choose(year>=1911?'PTE':'REIS',year>=1911?'Portuguese escudo':'Portuguese réis');
 if(/italy|sardinia|naples/.test(name))return year>=1861?choose('ITL','Italian lira'):choose('LOCAL','Regional Italian coin / accounting unit');
 if(/dutch|netherland/.test(name))return choose('NLG','Dutch guilder');
 return {code:'LOCAL',name:'Local coin / commodity accounting unit',basis:'Explicit gameplay fallback: this polity’s historical currency has not been individually verified'};
}
export function economyProfile(id,year){const name=(ATLAS_META.get(id)?.sourceName||ATLAS_META.get(id)?.name||'').toLowerCase();let hash=0;for(const c of id)hash=(hash*31+c.charCodeAt(0))|0;const variance=(Math.abs(hash)%21-10)/10;let anchor=year<1700?1.5:year<1900?2.5:3;
 const wartime=[1917,1942].includes(year);if(wartime)anchor=(year===1917?14:8)+variance*3;
 let basis='Country/era gameplay calibration, not measured historical CPI';if(/united kingdom|great britain/.test(name)&&year===1917){anchor=25.2;basis='UK annual 1917 price change, House of Commons RP02/44, table 1; annual reference, not a July-only rate'}if(/united kingdom|great britain/.test(name)&&year===1942){anchor=7.5;basis='UK annual 1942 price change, House of Commons RP02/44, table 1; official series does not measure all black-market prices'}
 if(/\brussia\b|\brussian\b|\bsoviet\b/.test(name)&&year===1917){anchor=38;basis='High-instability wartime game calibration; not a claim of the actual Russian inflation rate'}
 const priceFactor=year===2026?1:Math.max(1,(year<1700?1.2:1.05)+(wartime?.45:0)+variance*.08);
 return {schema:ECONOMY_VERSION,year,currency:currencyFor(id,year),anchor:clamp(anchor,.2,50),basis,priceFactor,index:1,lastTick:year*12,model:'scenario-calibrated-v1',monetaryScale:'Billions of scaled local accounting units; nominal amounts and conversion are gameplay parameters, not historical GDP or exchange rates'};
}
export function initializeEconomy(s){if(!s||s.economyScenario)return s;const row=ATLAS_META.get(s.countryId);if(!row)return s;const year=s.chronicle?.startDate?.[0]||row.era;const profile=economyProfile(s.countryId,year);profile.lastTick=s.date.year*12+s.date.month;
 // Preserved legacy saves are never silently recalibrated; call only during new-game creation.
 s.economyScenario=profile;s.currency=profile.currency.code;s.inflation=year===2026?s.inflation:profile.anchor;
 for(const [key,r] of Object.entries(s.resources)){r.price*=profile.priceFactor;if(!resourceAvailable(s,key)){r.production=0;r.consumption=0;r.stock=0}}
 for(const key of Object.keys(s.buildings))if(year<BUILD_YEAR[key])s.buildings[key]=0;
 if(s.history?.length===1)s.history[0].inflation=s.inflation;return s;
}
export function resourceAvailable(s,key){const year=s.economyScenario?.year||2026;const min={oil:1850,gas:1850,coal:1600,uranium:1940,rareEarths:1950,lithium:1970};return year>=(min[key]||1)}
export function buildAllowed(s,key){return !s.economyScenario||s.economyScenario.year>=(BUILD_YEAR[key]||1)}
export function effectiveFactor(s){return s.economyScenario?clamp(s.economyScenario.priceFactor*s.economyScenario.index,.1,100):1}
export function nominalCost(s,rule,args=[]){switch(rule){case'build':return BUILDINGS[args[0]]?.cost;case'investIndustry':return Number.isFinite(args[1])?args[1]:200;case'startResearch':return TECHNOLOGIES.find(t=>t.id===args[0])?.cost*.2;case'signTradeAgreement':return 60;case'fundDevelopmentProgram':return 180;case'researchPartnership':return 120;case'humanitarianAid':return 100;case'negotiate':return 35;case'resolveEvent':return null;default:return null}}
export function pricedOperation(s,rule,execute,args=[]){if(!s?.economyScenario)return execute();if(rule==='build'&&!buildAllowed(s,args[0]))return false;if(rule==='startResearch'&&s.economyScenario.year<1950)return false;if(['buyResource','exportResource'].includes(rule)&&!resourceAvailable(s,args[0]))return false;
 const base=nominalCost(s,rule,args);if(!Number.isFinite(base)||base<=0)return execute();const cost=base*effectiveFactor(s);if(s.treasury+1e-9<cost)return false;const before=s.treasury;s.treasury+=base-cost;try{const result=execute();if(result===false||result===0)s.treasury=before;else{if(rule==='humanitarianAid')s.diplomacy.aid+=cost-base;if(rule==='startResearch'&&s.research.active)s.research.active.paid+=cost-base;if(rule==='investIndustry'&&s.industries[args[0]])s.industries[args[0]].investment+=cost-base}return result}catch(e){s.treasury=before;throw e}}
export function finishEconomyMonth(s){const e=s?.economyScenario;if(!e)return;const tick=s.date.year*12+s.date.month;if(tick<=e.lastTick)return;
 const months=tick-e.lastTick;for(let i=0;i<months;i++){s.inflation=clamp(s.inflation+.1*(e.anchor-1.7),.2,60);const factor=Math.pow(1+s.inflation/100,1/12);e.index=clamp(e.index*factor,.1,100);for(const [key,r] of Object.entries(s.resources))if(resourceAvailable(s,key))r.price=clamp(r.price*factor,1,100000)}e.lastTick=tick;const last=s.history?.at(-1);if(last&&last.year===s.date.year&&last.month===s.date.month)last.inflation=s.inflation;
}
registerRuleTransform('chronicle-price-economy',(s,rule,execute,args)=>{const result=pricedOperation(s,rule,execute,args);if(rule==='maybeEvent')finishEconomyMonth(s);return result});
export const ACTION_RULE={build:'build',investIndustry:'investIndustry',research:'startResearch',tradeAgreement:'signTradeAgreement',negotiate:'negotiate',buyResource:'buyResource',exportResource:'exportResource',cwDevelopment:'fundDevelopmentProgram',cwResearch:'researchPartnership',cwAid:'humanitarianAid'};
