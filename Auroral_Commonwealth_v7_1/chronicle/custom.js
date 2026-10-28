import {COUNTRIES,ATLAS_META,epochFor,registerRows} from './registry.js';
import {validateTerritory} from './geometry.js';
export const CUSTOM_KEY='auroral-custom-territories-v1',MAX_CUSTOM=24;
const custom=new Map();
export function validateCustom(c){
 if(c?.schema!==1||typeof c.id!=='string'||!/^custom-territory-[a-z0-9-]{8,80}$/.test(c.id)||typeof c.name!=='string'||!c.name.trim()||c.name.length>60||/[<>\u0000-\u001f]/.test(c.name)||!epochFor(c.epochKey)||c.epochKey.startsWith('legacy-')||!/^#[0-9a-f]{6}$/i.test(c.color)||!Number.isFinite(c.population)||c.population<.01||c.population>2000||!Number.isFinite(c.treasury)||c.treasury<0||c.treasury>10000)throw Error('Invalid custom-country record.');
 return {schema:1,id:c.id,name:c.name.trim(),epochKey:c.epochKey,color:c.color,population:c.population,treasury:c.treasury,geometry:validateTerritory(c.geometry)};
}
export function registerCustom(value){
 const c=validateCustom(value);const known=custom.get(c.id);if(!known&&custom.size>=MAX_CUSTOM)throw Error('The limit is 24 custom countries.');if(known&&JSON.stringify(known)!==JSON.stringify(c))throw Error('A different custom territory already uses this ID.');custom.set(c.id,c);
 const era=epochFor(c.epochKey),coords=c.geometry.coordinates[0],map=[coords.reduce((v,p)=>v+p[1],0)/coords.length,coords.reduce((v,p)=>v+p[0],0)/coords.length];const row={id:c.id,name:c.name,era:era.year,epochKey:c.epochKey,category:'Custom countries',source:'Player-drawn fictional sandbox territory',map,gameValues:'Player-defined fictional gameplay values; no real sovereignty claim.'};registerRows([row]);
 const nation=COUNTRIES.find(n=>n.id===c.id);Object.assign(nation,{region:'Fictional',flag:'🏳️',population:c.population,gdp:c.population*20,treasury:c.treasury,debt:c.population*8,nationalColor:c.color,capital:'Custom capital',customTerritory:structuredClone(c)});return c;
}
export const customsForEpoch=key=>[...custom.values()].filter(c=>c.epochKey===key).map(c=>({...ATLAS_META.get(c.id)}));
export function customFeatures(key){return [...custom.values()].filter(c=>c.epochKey===key).map(c=>({type:'Feature',id:c.id,name:c.name,countryId:c.id,source:'Player-drawn fictional territory',status:'Custom sandbox overlay; original borders remain visible. Single-player only.',geometry:c.geometry,customColor:c.color,properties:{name:c.name,countryId:c.id,source:'Player-drawn fictional territory'}}))}
export function loadCustoms(storage){
 const text=storage.getItem(CUSTOM_KEY);if(!text)return {loaded:0};if(text.length>250000)throw Error('Custom-country storage exceeds its size limit.');const data=JSON.parse(text);if(!Array.isArray(data)||data.length>MAX_CUSTOM)throw Error('Invalid stored custom-country collection.');const clean=data.map(validateCustom);if(new Set(clean.map(c=>c.id)).size!==clean.length)throw Error('Duplicate stored custom country.');clean.forEach(registerCustom);return {loaded:clean.length};
}
export function saveCustom(storage,value){const c=registerCustom(value);try{storage.setItem(CUSTOM_KEY,JSON.stringify([...custom.values()]));return {country:c,persisted:true}}catch{return {country:c,persisted:false}}}
export function restoreCustomState(s){if(!s?.customTerritory)return false;const c=registerCustom(s.customTerritory);return c.id===s.countryId}
export function attachCustomState(s){const c=custom.get(s?.countryId);if(c&&!s.customTerritory){s.customTerritory=structuredClone(c);s.nationalColor=c.color}}
