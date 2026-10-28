// Generated from the unchanged Stable v6.1 source by worldline/build.mjs.
import {observe} from '../../core.js';
import {stateRandom} from '../../core.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function raw_updateTrade(s){
 const competitiveness=(s.techLevel*.35+s.infra*.28+s.education*.18+s.industryIndex*.19)/100;
 const tariffDrag=Math.max(0,s.taxes.tariff-6)*.006;
 s.trade.exports=Math.max(20,s.trade.exports*(1+(.005+competitiveness*.004+stateRandom(s)*.008-tariffDrag)/12));
 s.trade.imports=Math.max(20,s.trade.imports*(1+(.018+s.gdp/100000+stateRandom(s)*.01+s.taxes.tariff*-.0003)/12));
 s.trade.balance=s.trade.exports-s.trade.imports;
}
function raw_signTradeAgreement(s){const cost=60;if(s.treasury<cost)return false;s.treasury-=cost;s.trade.agreements++;s.trade.exports*=1.025;s.diplomacy.reputation=Math.min(100,s.diplomacy.reputation+2);return true}
function raw_buyResource(s,key,units){
 const r=s.resources?.[key];units=Number(units);
 if(!r||!Number.isFinite(units)||units<=0||!Number.isFinite(r.price))return false;
 const cost=units*r.price/100;
 if(!Number.isFinite(cost)||cost<0||s.treasury<cost)return false;
 s.treasury-=cost;r.stock=(Number.isFinite(r.stock)?r.stock:0)+units;s.trade.imports+=cost*3;return true;
}
function raw_exportResource(s,key,units){
 const r=s.resources?.[key];units=Number(units);
 if(!r||!Number.isFinite(units)||units<=0||!Number.isFinite(r.price))return false;
 const stock=Number.isFinite(r.stock)?r.stock:0;
 if(stock<units)return false;
 const revenue=units*r.price/115;
 if(!Number.isFinite(revenue)||revenue<0)return false;
 r.stock=stock-units;s.treasury+=revenue;s.trade.exports+=revenue*3;return true;
}

export function updateTrade(s,...args){return observe(s,'updateTrade',()=>raw_updateTrade(s,...args),args)}

export function signTradeAgreement(s,...args){return observe(s,'signTradeAgreement',()=>raw_signTradeAgreement(s,...args),args)}

export function buyResource(s,...args){return observe(s,'buyResource',()=>raw_buyResource(s,...args),args)}

export function exportResource(s,...args){return observe(s,'exportResource',()=>raw_exportResource(s,...args),args)}
