const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function computeMonthlyEconomy(s){
 const avgTax=(s.taxes.income*.42+s.taxes.corporate*.28+s.taxes.sales*.22+s.taxes.resource*.08)/100;
 const taxDrag=Math.max(0,avgTax-.18)*.10;
 const infraBoost=(s.infra-60)/1000, techBoost=(s.techLevel-60)/1200, eduBoost=(s.education-60)/1400;
 const energyRatio=s.energy.production/Math.max(1,s.energy.consumption); const energyPenalty=energyRatio<1?(1-energyRatio)*.10:0;
 const tradeBoost=((s.trade.exports-s.trade.imports)/Math.max(1,s.gdp))*.035;
 const industryBoost=(s.industryIndex-100)/2400;
 const confidence=(s.consumerConfidence-60)/5000;
 const shock=(Math.random()-.5)*.006;
 let annualGrowth=.018+infraBoost+techBoost+eduBoost+tradeBoost+industryBoost+confidence-taxDrag-energyPenalty-shock;
 annualGrowth=clamp(annualGrowth,-.12,.14);
 const monthlyGrowth=Math.pow(1+annualGrowth,1/12)-1;
 const oldGdp=s.gdp;s.gdp*=1+monthlyGrowth;
 const annualRevenue=s.gdp*(.19+avgTax*.62)+s.trade.imports*(s.taxes.tariff/100)*.08;
 const revenue=annualRevenue/12;
 const spendShare=Object.values(s.budget).reduce((a,b)=>a+b,0)/100;
 const programSpend=s.gdp*spendShare/12;
 const interestRate=.025+Math.max(0,s.debt/s.gdp-1)*.012+Math.max(0,s.inflation-5)*.0015;
 const interest=s.debt*interestRate/12;
 const maintenance=Object.values(s.buildings).reduce((a,b)=>a+b,0)*.9;
 const importsCost=s.trade.imports*.0015;
 const expenses=programSpend+interest+maintenance+importsCost;
 const balance=revenue-expenses;s.treasury+=balance;
 if(s.treasury<0){s.debt+=Math.abs(s.treasury);s.treasury=0}
 // inflation and labor
 const deficitPressure=Math.max(0,-balance)/Math.max(1,s.gdp)*18;
 const supplyPressure=Math.max(0,1-energyRatio)*3;
 const spendingPressure=Math.max(0,spendShare-.26)*5;
 s.inflation=clamp(s.inflation*.90+1.7*.10+deficitPressure+supplyPressure+spendingPressure-(s.trade.imports/s.gdp)*.08,.2,60);
 s.unemployment=clamp(s.unemployment-monthlyGrowth*18+(s.techLevel>90?.03:0)-(s.budget.education-4)*.012+(Math.random()-.5)*.12,1,35);
 s.population*=1+clamp((.007-s.unemployment*.00025+s.healthcare*.00002)/12,-.003,.002);
 s.consumerConfidence=clamp(s.consumerConfidence+monthlyGrowth*60-(s.inflation-3)*.05+(s.approval-50)*.002,15,95);
 s.lastMonthly={revenue,expenses,balance,growth:(s.gdp/oldGdp-1)*100,interest};
 s.trade.balance=s.trade.exports-s.trade.imports;
 return s.lastMonthly;
}
