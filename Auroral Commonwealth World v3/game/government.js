const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function applyGovernmentEffects(s){
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
export function borrow(s,amount){if(amount<=0)return false;const ceiling=s.gdp*(s.difficulty==='nightmare'?1.4:s.difficulty==='hard'?1.8:2.5);if(s.debt+amount>ceiling)return false;s.debt+=amount;s.treasury+=amount;return true}
export function repayDebt(s,amount){amount=Math.min(amount,s.treasury,s.debt);s.treasury-=amount;s.debt-=amount;return amount}
