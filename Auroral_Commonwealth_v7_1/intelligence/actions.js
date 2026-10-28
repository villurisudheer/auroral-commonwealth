import {setPolicyValue} from '../game/government.js';
import {getPending} from '../game/events.js';
import {observe} from '../worldline/core.js';
import {validatePlan,fingerprint} from './schema.js';
export function commitPlan(state,plan,expected,{multiplayer=false}={}){
 if(!state||multiplayer)throw Error('AI policy changes are available only in single player.');
 if(fingerprint(state)!==expected)throw Error('The nation changed. Refresh the AI snapshot and verify again.');
 if(getPending(state))throw Error('Resolve the pending national event before applying policies.');
 validatePlan(state,plan);const trial=structuredClone(state);
 for(const a of plan.actions)if(!setPolicyValue(trial,a.group,a.key,a.value))throw Error('Policy validation failed.');
 return observe(state,'ai-policy',()=>{for(const a of plan.actions)setPolicyValue(state,a.group,a.key,a.value);return true},[plan.id,plan.actions]);
}
