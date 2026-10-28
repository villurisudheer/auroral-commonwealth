// Generated from the unchanged Stable v6.1 source by worldline/build.mjs.
import {observe} from '../../core.js';
import {stateRandom} from '../../core.js';
import {EVENT_DEFS} from '../data/events.js';
function raw_maybeEvent(s){
 if(s.pendingEvent){if(getPending(s))return null;s.pendingEvent=null}
 for(const e of EVENT_DEFS){if(stateRandom(s)<e.p/12){s.pendingEvent={id:e.id};return e}}
 return null;
}
export function getPending(s){return EVENT_DEFS.find(e=>e.id===s.pendingEvent?.id)||null}
function raw_resolveEvent(s,choiceIndex){const e=getPending(s);if(!e){s.pendingEvent=null;return false}const c=e.choices[choiceIndex];if(!c)return false;if(c.cost>s.treasury)return false;s.treasury-=c.cost;c.effect(s);s.notifications.unshift({type:'information',text:`Resolved: ${e.title} — ${c.label}`});s.pendingEvent=null;return true}

export function maybeEvent(s,...args){return observe(s,'maybeEvent',()=>raw_maybeEvent(s,...args),args)}

export function resolveEvent(s,...args){return observe(s,'resolveEvent',()=>raw_resolveEvent(s,...args),args)}
