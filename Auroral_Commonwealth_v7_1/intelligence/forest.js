import {FEATURES,TARGETS,OBJECTIVES,PROFILES,features,planFor,HORIZON} from './schema.js';
export function validateModel(model){
 if(model?.schema!==1||model.kind!=='auroral-policy-forest'||model.horizon!==HORIZON||JSON.stringify(model.features)!==JSON.stringify(FEATURES)||JSON.stringify(model.targets)!==JSON.stringify(TARGETS)||!Array.isArray(model.trees)||model.trees.length<1||model.trees.length>100)throw Error('Unsupported ML model');
 const vector=v=>Array.isArray(v)&&v.length===TARGETS.length&&v.every(Number.isFinite);
 if(!vector(model.targetMean)||!vector(model.targetScale)||model.targetScale.some(n=>n<=0)||!Array.isArray(model.featureRange)||model.featureRange.length!==FEATURES.length||model.featureRange.some(v=>!Array.isArray(v)||v.length!==2||!v.every(Number.isFinite)||v[0]>v[1]))throw Error('Invalid model scaling');
 let count=0;const visit=(node,depth)=>{if(++count>100000||depth>15||!node||typeof node!=='object')throw Error('Invalid model tree');if(node.v){if(!vector(node.v))throw Error('Invalid leaf');return}if(!Number.isInteger(node.f)||node.f<0||node.f>=FEATURES.length||!Number.isFinite(node.t))throw Error('Invalid split');visit(node.l,depth+1);visit(node.r,depth+1)};model.trees.forEach(t=>visit(t,0));return model;
}
export function predictVector(model,x){
 if(x.length!==FEATURES.length||x.some(n=>!Number.isFinite(n)))throw Error('Invalid ML feature vector');
 const votes=model.trees.map(tree=>{let node=tree;while(!node.v)node=x[node.f]<=node.t?node.l:node.r;return node.v.map((v,k)=>v*model.targetScale[k]+model.targetMean[k])});
 const mean=TARGETS.map((_,k)=>votes.reduce((v,row)=>v+row[k],0)/votes.length);
 const spread=TARGETS.map((_,k)=>Math.sqrt(votes.reduce((v,row)=>v+(row[k]-mean[k])**2,0)/votes.length));
 const outOfRange=x.flatMap((v,i)=>v<model.featureRange[i][0]-1e-8||v>model.featureRange[i][1]+1e-8?[FEATURES[i]]:[]);
 return {mean,spread,outOfRange};
}
export function recommend(s,model,objective='balanced'){
 if(!Object.hasOwn(OBJECTIVES,objective))throw Error('Unknown objective');
 const rows=PROFILES.map(p=>{const plan=planFor(s,p.id),estimate=predictVector(model,features(s,plan));return {plan,...estimate}});
 for(const row of rows){if(row.plan.id==='hold'){row.mean=TARGETS.map(()=>0);row.spread=TARGETS.map(()=>0)}row.relative=[...row.mean];row.score=row.relative.reduce((sum,v,k)=>sum+v*OBJECTIVES[objective][k],0)}
 return rows.sort((a,b)=>b.score-a.score||a.plan.id.localeCompare(b.plan.id));
}

// Preserve access to the original model while disclosing newer scenario economics as out of domain.
const baseEraRecommendation=recommend;
recommend=function(state,model,objective='balanced'){const rows=baseEraRecommendation(state,model,objective);if(state.economyScenario)for(const row of rows)row.outOfRange.push('Scenario price/inflation extension was not represented in the bundled ML training data; verify with the engine.');return rows};
