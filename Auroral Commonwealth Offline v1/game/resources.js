const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function updateResources(s){
 for(const [key,r] of Object.entries(s.resources)){
  const scarcity=clamp(r.consumption/Math.max(.1,r.production)-1,-.5,4);
  const reservePressure=r.reserve<r.consumption*60?.15:0;
  r.price=clamp(r.price*(1+(Math.random()-.5)*.035+scarcity*.01+reservePressure*.01),5,1000);
  const produced=Math.min(r.reserve,r.production);r.reserve=Math.max(0,r.reserve-produced);r.stock=(r.stock||r.consumption*3)+produced-r.consumption;
  if(r.stock<0){r.stock=0;s.inflation+=.06;s.industryIndex-=.12}
 }
}
export function updateEnergy(s){
 const mixEff=(s.energy.mix.solar+s.energy.mix.wind+s.energy.mix.hydro)*.001+(s.techLevel/100)*.05;
 s.energy.production=Math.max(0,s.energy.capacity*(.86+mixEff)+s.energy.imported);
 s.energy.consumption=Math.max(20,s.gdp/300+s.population*.06+s.industryIndex*.22);
 if(s.energy.production<s.energy.consumption){s.industryIndex=Math.max(40,s.industryIndex-(s.energy.consumption-s.energy.production)*.018)}else{s.industryIndex=Math.min(170,s.industryIndex+.08)}
}
