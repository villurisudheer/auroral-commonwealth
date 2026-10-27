// Generated from the unchanged Stable v6.1 source by worldline/build.mjs.
import {observe} from '../../core.js';
import {stateRandom} from '../../core.js';
export function relationLabel(v){return v<-50?'Hostile':v<-15?'Poor':v<20?'Neutral':v<60?'Friendly':'Allied'}
function raw_negotiate(s,countryId){const cur=s.diplomacy.relations[countryId]||0;const cost=35;if(s.treasury<cost)return false;s.treasury-=cost;s.diplomacy.relations[countryId]=Math.min(100,cur+8+stateRandom(s)*8);s.diplomacy.reputation=Math.min(100,s.diplomacy.reputation+1);return true}
function raw_sanction(s,countryId){const cur=s.diplomacy.relations[countryId]||0;s.diplomacy.relations[countryId]=Math.max(-100,cur-35);s.diplomacy.sanctions++;s.trade.exports*=.992;s.diplomacy.reputation=Math.max(0,s.diplomacy.reputation-2)}

export function negotiate(s,...args){return observe(s,'negotiate',()=>raw_negotiate(s,...args),args)}

export function sanction(s,...args){return observe(s,'sanction',()=>raw_sanction(s,...args),args)}
