// Generated from the unchanged Stable v6.1 source by worldline/build.mjs.
import {observe} from '../../core.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hasOwn=(obj,key)=>!!obj&&Object.prototype.hasOwnProperty.call(obj,key);

function raw_setPolicyValue(s,group,key,value){
 const val=Number(value);
 if(!Number.isFinite(val))return false;
 if(group==='tax'){
  if(!hasOwn(s?.taxes,key))return false;
  const max=key==='tariff'?40:60;
  s.taxes[key]=Math.round(clamp(val,0,max)*10)/10;
  return true;
 }
 if(group==='budget'){
  if(!hasOwn(s?.budget,key))return false;
  s.budget[key]=Math.round(clamp(val,.5,12)*10)/10;
  return true;
 }
 return false;
}

export function getPolicyValue(s,group,key){
 const target=group==='tax'?s?.taxes:group==='budget'?s?.budget:null;
 const value=target?.[key];
 return Number.isFinite(value)?value:null;
}

function raw_applyGovernmentEffects(s){
 s.education=clamp(s.education+(s.budget.education-4)*.035,20,100);
 s.healthcare=clamp(s.healthcare+(s.budget.healthcare-4.5)*.03,20,100);
 s.infra=clamp(s.infra+(s.budget.infrastructure-3.5)*.018,20,100);
 s.techLevel=clamp(s.techLevel+(s.budget.science-2)*.014,10,100);
 s.military=clamp(s.military+(s.budget.defense-2.5)*.012,10,100);
 const taxBurden=(s.taxes.income+s.taxes.sales+s.taxes.corporate*.6)/100;
 s.approval=clamp(s.approval+(s.budget.welfare-3.5)*.02+(s.healthcare-70)*.003-(taxBurden-.35)*.18-(s.inflation-3)*.05-(s.unemployment-5)*.04,0,100);
 s.stability=clamp(s.stability+(s.approval-50)*.006-(s.inflation>12?.16:0),0,100);
 s.legitimacy=clamp(s.legitimacy+(s.stability-50)*.004,0,100);
}

function raw_borrow(s,amount){
 amount=Number(amount);
 if(!Number.isFinite(amount)||amount<=0)return false;
 const ceiling=s.gdp*(s.difficulty==='nightmare'?1.4:s.difficulty==='hard'?1.8:2.5);
 if(s.debt+amount>ceiling)return false;
 s.debt+=amount;s.treasury+=amount;return true;
}

function raw_repayDebt(s,amount){
 amount=Number(amount);
 if(!Number.isFinite(amount)||amount<=0)return 0;
 amount=Math.min(amount,Math.max(0,s.treasury),Math.max(0,s.debt));
 if(amount<=0)return 0;
 s.treasury-=amount;s.debt-=amount;return amount;
}

export function setPolicyValue(s,...args){return observe(s,'setPolicyValue',()=>raw_setPolicyValue(s,...args),args)}

export function applyGovernmentEffects(s,...args){return observe(s,'applyGovernmentEffects',()=>raw_applyGovernmentEffects(s,...args),args)}

export function borrow(s,...args){return observe(s,'borrow',()=>raw_borrow(s,...args),args)}

export function repayDebt(s,...args){return observe(s,'repayDebt',()=>raw_repayDebt(s,...args),args)}
