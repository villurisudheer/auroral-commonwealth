import {EVENT_DEFS} from '../data/events.js';
export function maybeEvent(s){if(s.pendingEvent)return null;for(const e of EVENT_DEFS){if(Math.random()<e.p/12){s.pendingEvent={id:e.id};return e}}return null}
export function getPending(s){return EVENT_DEFS.find(e=>e.id===s.pendingEvent?.id)||null}
export function resolveEvent(s,choiceIndex){const e=getPending(s);if(!e)return false;const c=e.choices[choiceIndex];if(!c)return false;if(c.cost>s.treasury)return false;s.treasury-=c.cost;c.effect(s);s.notifications.unshift({type:'information',text:`Resolved: ${e.title} — ${c.label}`});s.pendingEvent=null;return true}
