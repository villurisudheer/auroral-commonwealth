import {COUNTRIES,ATLAS_META,eraRows as legacyRows} from '../atlas/registry.js';
import {CHRONICLE_ROWS} from './data/catalog.js';
import {EPOCHS} from './data/eras.js';
export {EPOCHS,CHRONICLE_ROWS,COUNTRIES,ATLAS_META};
export const RELEASE='7.1.0';
export function epochFor(key){return EPOCHS.find(e=>e.key===key)||(['legacy-1919','legacy-1942'].includes(key)?{key,year:Number(key.slice(7)),label:'Legacy '+key.slice(7),title:'Preserved saved-game scenario',start:[Number(key.slice(7)),1,1],precision:'legacy dated snapshot',reason:'Available for compatibility with earlier saves; not in the new-game selector.'}:null)}
export function countryEpoch(id){const row=ATLAS_META.get(id);return row?.epochKey||(row?.era===2026?'modern':row?.era===1783?'revolutions':row?'legacy-'+row.era:null)}
export function stateEpoch(s){return s?.chronicle?.key||countryEpoch(s?.countryId)||(s?.atlas?.era===2026?'modern':s?.atlas?.era===1783?'revolutions':s?.atlas?.era?'legacy-'+s.atlas.era:'modern')}
const template=COUNTRIES.find(c=>c.id==='nzl');
export function registerRows(rows){for(const row of rows){ATLAS_META.set(row.id,row);if(!COUNTRIES.some(c=>c.id===row.id))COUNTRIES.push({...structuredClone(template),id:row.id,name:row.name,officialName:row.name,flag:'🏳️',alpha2:'',capital:row.capital||'Scenario seat (not historically verified)',region:'Historical',atlasEra:row.era,epochKey:row.epochKey,map:row.map,aliases:[row.sourceName||row.name],status:row.era+' scenario • synthetic game statistics',atlasCategory:row.category})}}
registerRows(CHRONICLE_ROWS);
export function rowsForEpoch(key,category='',query=''){
 const era=epochFor(key);if(!era)return [];const source=key==='modern'||key==='revolutions'||key.startsWith('legacy-')?legacyRows(era.year):CHRONICLE_ROWS.filter(r=>r.epochKey===key);
 const q=query.trim().toLocaleLowerCase();return source.filter(r=>(!category||r.category===category)&&(!q||[r.name,r.sourceName,r.parent,r.id].filter(Boolean).join(' ').toLocaleLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name));
}
export function initializeChronicleState(s){
 if(!s||s.chronicle)return s;const row=ATLAS_META.get(s.countryId);if(!row?.epochKey)return s;const epoch=epochFor(row.epochKey);if(!epoch)return s;
 s.atlas={schema:1,era:epoch.year,source:row.source,category:row.category};s.chronicle={schema:1,key:epoch.key,label:epoch.label,startDate:[...epoch.start],precision:epoch.precision};s.date={year:epoch.start[0],month:epoch.start[1]-1};
 if(s.history?.length===1){s.history[0].year=s.date.year;s.history[0].month=s.date.month}return s;
}
