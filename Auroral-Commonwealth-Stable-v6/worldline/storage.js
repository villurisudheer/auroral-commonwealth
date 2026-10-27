import {clone,SCHEMA,LIMITS} from './core.js';
import {validateJSON,validateExperiment,prepareState} from './engine.js';
export const STORAGE_KEY='auroral-worldline-suite-v1';
function validDate(d){return d&&Number.isInteger(d.year)&&Number.isInteger(d.month)&&d.month>=0&&d.month<=11}
export function validateLedger(raw){
 validateJSON(raw);if(raw?.schema!==SCHEMA||typeof raw.id!=='string'||raw.id.length>256||!['single-player','isolated-worldline','client-visible-multiplayer','imported-record'].includes(raw.scope)||!Number.isInteger(raw.seq)||raw.seq<0||!Array.isArray(raw.events)||!Array.isArray(raw.traces)||!Array.isArray(raw.snapshots)||raw.events.length>LIMITS.events||raw.traces.length>LIMITS.traces||raw.snapshots.length>LIMITS.snapshots)throw Error('Invalid archive ledger');
 const ids=new Set();for(const e of raw.events){if(typeof e.id!=='string'||ids.has(e.id)||!validDate(e.date)||!Number.isInteger(e.tick)||typeof e.countryId!=='string'||typeof e.category!=='string'||typeof e.description!=='string'||typeof e.source!=='string'||!e.changes||typeof e.changes!=='object'||Array.isArray(e.changes))throw Error('Invalid history entry');ids.add(e.id);for(const c of Object.values(e.changes)){if(!c||typeof c!=='object'||!Object.hasOwn(c,'before')||!Object.hasOwn(c,'after')||Object.values(c).some(v=>v!==null&&!['number','string','boolean'].includes(typeof v)))throw Error('Invalid historical change')}}
 const traceIds=new Set();for(const t of raw.traces){if(typeof t.id!=='string'||traceIds.has(t.id)||typeof t.eventId!=='string'||typeof t.rule!=='string'||!validDate(t.date)||!t.inputs||typeof t.inputs!=='object'||!t.changes||typeof t.changes!=='object')throw Error('Invalid trace');for(const c of Object.values(t.changes)){if(!c||typeof c!=='object'||!Object.hasOwn(c,'before')||!Object.hasOwn(c,'after')||Object.values(c).some(v=>v!==null&&!['number','string','boolean'].includes(typeof v)))throw Error('Invalid trace change')}traceIds.add(t.id)}
 for(const s of raw.snapshots){if(typeof s.id!=='string'||typeof s.eventId!=='string'||!validDate(s.date)||!s.state||!Number.isFinite(s.state.gdp))throw Error('Invalid historical snapshot');prepareState(s.state);if(!s.state.energy||!s.state.lastMonthly||!Number.isFinite(s.state.energy.production)||!Number.isFinite(s.state.energy.consumption)||!Number.isFinite(s.state.lastMonthly.growth)||!Object.values(s.state.resources).every(r=>r&&typeof r==='object'&&Number.isFinite(r.reserve)&&Number.isFinite(r.production)&&Number.isFinite(r.consumption)))throw Error('Incomplete historical snapshot')} 
 return clone(raw);
}
export function parseArchive(text){if(text.length>LIMITS.bytes)throw Error('Archive exceeds 4 MB');const raw=JSON.parse(text);if(raw?.kind!=='auroral-archive'||raw.schema!==SCHEMA)throw Error('Unsupported archive format');const b=validateLedger(raw.ledger);b.scope='imported-record';return b}
export function storeAdapter(storage){
 let error='';const empty=()=>({schema:SCHEMA,books:[],experiments:[]});
 return {
  get error(){return error},
  load(){try{const text=storage.getItem(STORAGE_KEY);if(!text)return empty();if(text.length>LIMITS.bytes)throw Error('Stored data exceeds size limit');const data=JSON.parse(text);if(data.schema!==SCHEMA||!Array.isArray(data.books)||data.books.length>5||!Array.isArray(data.experiments)||data.experiments.length>LIMITS.experiments)throw Error('Unsupported stored data');return {schema:SCHEMA,books:data.books.map(validateLedger),experiments:data.experiments.map(validateExperiment)}}catch(e){error='Storage could not be read: '+e.message;return empty()}},
  save(data){try{validateJSON(data);storage.setItem(STORAGE_KEY,JSON.stringify(data));error='';return true}catch(e){error='Storage not saved: '+e.message;return false}},
  exportArchive:book=>JSON.stringify({schema:SCHEMA,kind:'auroral-archive',ledger:validateLedger(book)})
 };
}
export function csv(book){const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';return [['ID','Date','Country','Category','Source','Description'],...book.events.map(e=>[e.id,`${e.date.year}-${String(e.date.month+1).padStart(2,'0')}`,e.countryId,e.category,e.source,e.description])].map(row=>row.map(quote).join(',')).join('\r\n')}

// Retain replay inputs and recent history within one bounded extension store.
// All mutation here is extension-only; game state and game-save keys are never touched.
export function enforceRetention(data){
 let changed=false;
 const size=()=>JSON.stringify(data).length;
 for(let i=data.experiments.length-1;i>=0&&size()>3_800_000;i--){if(data.experiments[i].result){delete data.experiments[i].result;changed=true}}
 for(let i=data.books.length-1;i>=0&&size()>3_800_000;i--){const b=data.books[i];while(size()>3_800_000&&(b.events.length>1||b.traces.length||b.snapshots.length>1)){if(b.snapshots.length>1)b.snapshots.shift();else if(b.traces.length)b.traces.splice(0,Math.min(20,b.traces.length));else if(b.events.length>1)b.events.splice(0,Math.min(20,b.events.length-1));changed=true}}
 return changed;
}
