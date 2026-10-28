import {COUNTRIES} from '../data/countries.js';
import {ATLAS_ROWS} from './data/catalog.js';
export const LEGACY_IDS=new Set(COUNTRIES.map(c=>c.id));
export const ERAS=[2026,1942,1919,1783];
export const MODERN_CATEGORIES=['UN Recognized','Non-UN Recognized','Disputed','Fictional'];
export const ATLAS_META=new Map(ATLAS_ROWS.map(row=>[row.id,row]));
const template=COUNTRIES.find(c=>c.id==='nzl');
for(const row of ATLAS_ROWS){
 if(COUNTRIES.some(c=>c.id===row.id))continue;
 const historical=row.era!==2026;
 COUNTRIES.push({...structuredClone(template),id:row.id,name:row.name,officialName:row.name,flag:'🏳️',alpha2:'X'+String(COUNTRIES.length),capital:row.capital||'Scenario seat (not historically verified)',region:historical?'Historical':row.category==='Disputed'?'Disputed / De facto':(row.region||regionAt(row.map)),map:row.map,aliases:[row.sourceName||row.name],status:historical?`${row.era} scenario • synthetic gameplay statistics • ${row.source}`:row.membership+' • synthetic gameplay statistics',atlasEra:row.era,atlasCategory:row.category});
}
function regionAt([lat,lon]){if(lon<-25)return 'Americas';if(lon>100&&lat<-10)return 'Oceania';if(lon>-20&&lon<55&&lat<35)return 'Africa';return lon<50&&lat>35?'Europe':'Asia'}
export function eraRows(year,category='',query=''){
 const text=query.trim().toLocaleLowerCase();return ATLAS_ROWS.filter(r=>r.era===Number(year)&&(!category||r.category===category)&&(!text||`${r.name} ${r.sourceName||''} ${r.id} ${r.parent||''}`.toLocaleLowerCase().includes(text))).sort((a,b)=>a.name.localeCompare(b.name));
}
export function initializeAtlasState(state){
 if(!state||state.atlas)return state;
 const row=ATLAS_META.get(state.countryId);if(!row)return state;
 state.atlas={schema:1,era:row.era,source:row.source||'2026 membership roster',category:row.category};state.date={year:row.era,month:0};
 if(state.history?.length===1){state.history[0].year=row.era;state.history[0].month=0}
 return state;
}
export {COUNTRIES,ATLAS_ROWS};
