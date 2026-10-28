// Offline, deterministic training only. No player saves, chats or real-world data are collected.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createState} from '../game/state.js';
import {COUNTRIES,ATLAS_META} from '../atlas/registry.js';
import {step,ENGINE_VERSION} from '../worldline/engine.js';
import {getPending,resolveEvent} from '../worldline/generated/game/events.js';
import {applyAction} from '../worldline/engine.js';
import {seeded} from '../worldline/core.js';
import {FEATURES,TARGETS,PROFILES,HORIZON,features,outcomes,planFor} from './schema.js';
import {predictVector,validateModel} from './forest.js';
const seed=641937,rng=seeded(seed),shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const countries=shuffle(COUNTRIES.filter(c=>ATLAS_META.get(c.id)?.era===2026&&ATLAS_META.get(c.id)?.category!=='Fictional'));
const cut=Math.floor(countries.length*.8),train=[],test=[];
function simulate(source,plan,months,seed){const s=structuredClone(source),original=Math.random;try{
 // Dedicated synchronous training process: seeded RNG is restored even if the engine throws.
 Math.random=seeded(seed);for(const a of plan.actions)applyAction(s,a);
 for(let i=0;i<months;i++){const event=getPending(s);if(event){const affordable=event.choices.map((c,i)=>({c,i})).filter(x=>x.c.cost<=s.treasury).sort((a,b)=>a.c.cost-b.c.cost);if(affordable[0])resolveEvent(s,affordable[0].i)}step(s)}
 }finally{Math.random=original}return s;
}
for(let ci=0;ci<countries.length;ci++){
 const country=countries[ci];for(let scenario=0;scenario<3;scenario++){
  let s=createState(country,['normal','hard','easy'][scenario]);
  for(const key of Object.keys(s.taxes))s.taxes[key]=Math.round(Math.max(0,s.taxes[key]+(rng()-.5)*14)*10)/10;
  for(const key of Object.keys(s.budget))s.budget[key]=Math.round(Math.max(.5,s.budget[key]+(rng()-.5)*2)*10)/10;
  s.approval=30+rng()*55;s.stability=35+rng()*55;s.debt*=.5+rng()*1.7;s.treasury*=.4+rng()*1.5;
  s=simulate(s,{actions:[]},Math.floor(rng()*9),seed+ci*91+scenario);
  const baseline=outcomes(s,simulate(s,{actions:[]},HORIZON,seed+ci*543+scenario*13));
  for(const p of PROFILES){const plan=planFor(s,p.id),after=simulate(s,plan,HORIZON,seed+ci*543+scenario*13);const row={country:country.id,x:features(s,plan),y:outcomes(s,after).map((v,k)=>v-baseline[k])};if(row.y.some(n=>!Number.isFinite(n)))throw Error('Non-finite training outcome');(ci<cut?train:test).push(row)}
 }
 if(ci%40===0)console.log(`Simulated ${ci+1}/${countries.length} nations`);
}
const mean=TARGETS.map((_,k)=>train.reduce((v,r)=>v+r.y[k],0)/train.length);
const scale=TARGETS.map((_,k)=>Math.max(.01,Math.sqrt(train.reduce((v,r)=>v+(r.y[k]-mean[k])**2,0)/train.length)));
for(const row of train)row.z=row.y.map((v,k)=>(v-mean[k])/scale[k]);
function leaf(indices){return {v:TARGETS.map((_,k)=>indices.reduce((v,i)=>v+train[i].z[k],0)/indices.length)}}
function tree(indices,depth){
 if(depth>=8||indices.length<20)return leaf(indices);
 let best=null;const subset=shuffle(Array.from({length:FEATURES.length},(_,i)=>i)).slice(0,14);
 for(const f of subset){for(let attempt=0;attempt<7;attempt++){
  const threshold=train[indices[Math.floor(rng()*indices.length)]].x[f],left=[],right=[];const ls=Array(7).fill(0),rs=Array(7).fill(0);
  for(const i of indices){const yes=train[i].x[f]<=threshold,part=yes?left:right,sums=yes?ls:rs;part.push(i);for(let k=0;k<7;k++)sums[k]+=train[i].z[k]}
  if(left.length<8||right.length<8)continue;
  const gain=ls.reduce((v,n,k)=>v+n*n/left.length+rs[k]*rs[k]/right.length,0);
  if(!best||gain>best.gain)best={f,t:threshold,left,right,gain};
 }}
 if(!best)return leaf(indices);return {f:best.f,t:best.t,l:tree(best.left,depth+1),r:tree(best.right,depth+1)};
}
const trees=[];for(let i=0;i<32;i++){trees.push(tree(Array.from({length:train.length},()=>Math.floor(rng()*train.length)),0));if(i%8===0)console.log(`Trained ${i+1}/32 trees`)}
const model={schema:1,kind:'auroral-policy-forest',version:'1.0.0',horizon:HORIZON,engineVersion:ENGINE_VERSION,seed,features:FEATURES,targets:TARGETS,targetMean:mean,targetScale:scale,featureRange:FEATURES.map((_,k)=>[Math.min(...train.map(r=>r.x[k])),Math.max(...train.map(r=>r.x[k]))]),trees};validateModel(model);
const metrics=TARGETS.map((name,k)=>{const values=test.map((r,i)=>({truth:r.y[k],prediction:i%PROFILES.length===0?0:predictVector(model,r.x).mean[k]}));const mae=values.reduce((v,r)=>v+Math.abs(r.truth-r.prediction),0)/values.length,baselineMAE=values.reduce((v,r)=>v+Math.abs(r.truth-mean[k]),0)/values.length;return {name,mae,baselineMAE,improvementPercent:(1-mae/baselineMAE)*100}});
// Ranking evaluation uses simulator outcomes relative to the same state's unchanged policy.
const weights=[1,.45,-.7,.65,.8,-.6,-.65];const score=y=>y.reduce((v,n,k)=>v+n*weights[k],0);const counts=Object.fromEntries(PROFILES.map(p=>[p.id,0]));
for(let i=0;i<train.length;i+=PROFILES.length){const group=train.slice(i,i+PROFILES.length),scores=group.map(r=>score(r.y));counts[PROFILES[scores.indexOf(Math.max(...scores))].id]++}
const fixed=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0],fixedIndex=PROFILES.findIndex(p=>p.id===fixed);
let topMatches=0,totalRegret=0,groups=0,fixedMatches=0,fixedRegret=0;const heldoutBestCounts=Object.fromEntries(PROFILES.map(p=>[p.id,0]));
for(let i=0;i<test.length;i+=PROFILES.length){const rows=test.slice(i,i+PROFILES.length),scores=rows.map(r=>score(r.y)),pred=rows.map((r,j)=>j===0?0:score(predictVector(model,r.x).mean));const truth=scores.indexOf(Math.max(...scores)),picked=pred.indexOf(Math.max(...pred));topMatches+=truth===picked?1:0;totalRegret+=scores[truth]-scores[picked];fixedMatches+=truth===fixedIndex?1:0;fixedRegret+=scores[truth]-scores[fixedIndex];heldoutBestCounts[PROFILES[truth].id]++;groups++}

const trainingHash=createHash('sha256').update(JSON.stringify(train.map(({country,x,y})=>({country,x,y})))).digest('hex');
const report={schema:1,modelVersion:model.version,engineVersion:ENGINE_VERSION,seed,trainingHash,algorithm:'32 bootstrapped multi-output regression trees; maximum depth 8; minimum leaf 8; standardised targets; random feature/threshold splits',horizonMonths:HORIZON,predictionTarget:'Policy effect relative to an unchanged-policy rollout with the same seed and starting state',trainingExamples:train.length,testExamples:test.length,trainingCountries:countries.slice(0,cut).map(c=>c.id),testCountries:countries.slice(cut).map(c=>c.id),split:'80/20 by country before simulation; every policy and scenario of a country remains in one partition',scenariosPerNation:3,profiles:PROFILES.map(p=>p.id),metrics,balancedRanking:{groups,topMatchRate:topMatches/groups,meanRegret:totalRegret/groups,units:'Designer-defined utility points',trainingBestCounts:counts,heldoutBestCounts,fixedProfileBaseline:{selectedUsing:'Most frequent best profile in training states only',profile:fixed,topMatchRate:fixedMatches/groups,meanRegret:fixedRegret/groups}},data:'Only synthetic game-engine rollouts; no human chats, saves or real-world economic measurements',eventStrategy:'Resolve cheapest affordable event before next step; common seeded random stream per policy comparison',limitations:['Held-out results cover modern roster initial states and nearby policy variation only.','Tree spread is model disagreement, not a calibrated confidence interval.','Historical and fictional nations use the same synthetic game mechanics, not historical economic evidence.','Policy ranking is narrow and may not outperform always choosing the training-most-frequent best profile; see fixedProfileBaseline.',
'Candidate ranking is a learned approximation of seven fixed profiles; no optimality claim.','No transformer or LLM was trained or fine-tuned. Optional LLM uses separately installed pretrained weights.']};
fs.writeFileSync(new URL('./model/policy-forest.json',import.meta.url),JSON.stringify(model));fs.writeFileSync(new URL('./model/training-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({trainingExamples:train.length,testExamples:test.length,metrics,balancedRanking:report.balancedRanking},null,2));
