export const EVENT_DEFS=[
 {id:'energy_crisis',title:'Global Energy Crisis',p:.045,text:'Global energy prices surge as supply tightens.',choices:[
  {label:'Subsidize domestic energy',cost:500,effect:s=>{s.energy.capacity+=4;s.approval+=2;s.inflation+=.3}},
  {label:'Import additional energy',cost:300,effect:s=>{s.trade.imports+=120;s.energy.imported+=6}},
  {label:'Absorb the shock',cost:0,effect:s=>{s.industryIndex-=4;s.approval-=3;s.inflation+=1.2}}]},
 {id:'breakthrough',title:'Technology Breakthrough',p:.035,text:'Researchers report a major productivity breakthrough.',choices:[
  {label:'Commercialize rapidly',cost:350,effect:s=>{s.techLevel+=2;s.productivity+=.025}},
  {label:'Keep it strategic',cost:180,effect:s=>{s.research.points+=18;s.stability+=1}}]},
 {id:'drought',title:'Severe Drought',p:.03,text:'Agricultural regions face a major water shortage.',choices:[
  {label:'Emergency irrigation program',cost:420,effect:s=>{s.resources.food.reserve+=120;s.resources.water.reserve-=150;s.approval+=1}},
  {label:'Import food',cost:260,effect:s=>{s.trade.imports+=100;s.resources.food.reserve+=260}},
  {label:'Ration supplies',cost:20,effect:s=>{s.approval-=5;s.inflation+=.7}}]},
 {id:'trade_boom',title:'Trade Opportunity',p:.04,text:'A Commonwealth member offers a favorable long-term market access deal.',choices:[
  {label:'Sign the agreement',cost:80,effect:s=>{s.trade.agreements+=1;s.trade.exports+=150;s.diplomacy.reputation+=3}},
  {label:'Demand better terms',cost:0,effect:s=>{if(Math.random()<.5){s.trade.exports+=220;s.diplomacy.reputation+=1}else{s.diplomacy.reputation-=2}}}]},
 {id:'banking',title:'Banking Stress',p:.025,text:'Credit losses spread through the domestic banking system.',choices:[
  {label:'Recapitalize banks',cost:650,effect:s=>{s.stability+=3;s.debt+=250}},
  {label:'Limited guarantees',cost:260,effect:s=>{s.stability-=1;s.unemployment+=.4}},
  {label:'No bailout',cost:0,effect:s=>{s.stability-=5;s.gdp*=.985;s.unemployment+=1.2}}]}
];
