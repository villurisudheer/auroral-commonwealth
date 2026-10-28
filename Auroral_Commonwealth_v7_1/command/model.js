import {BUILDINGS} from '../game/infrastructure.js';
export const MAP_VERSION=1;
export const COLS=13, ROWS=11;
export const TITLES={roads:'Transport hub',railways:'Rail terminal',airports:'Air terminal',ports:'Harbour',powerPlants:'Power station',hospitals:'Medical district',schools:'School campus',universities:'University',factories:'Industrial works',dataCenters:'Data centre',researchCenters:'Research institute'};
export const COLORS={roads:'#90a9ba',railways:'#a5bec9',airports:'#e7c989',ports:'#6dcbd6',powerPlants:'#f0bf65',hospitals:'#ff94a8',schools:'#a9d786',universities:'#b1a1ef',factories:'#e0a475',dataCenters:'#72cfe4',researchCenters:'#a6b3ff'};
export const position=(c,r)=>({x:620+(c-r)*46,y:76+(c+r)*24});
export function terrain(c,r){if(!Number.isInteger(c)||!Number.isInteger(r)||c<0||c>=COLS||r<0||r>=ROWS)return 'outside';if((c>=10&&r<4)||(c===12&&r<7))return 'water';if(c===6||r===5)return 'road';if((c===0&&r<3)||(r===10&&c<3))return 'forest';return 'land'}
export function tiles(){return Array.from({length:COLS*ROWS},(_,i)=>{const c=i%COLS,r=Math.floor(i/COLS);return {id:`${c},${r}`,c,r,...position(c,r),terrain:terrain(c,r)}})}
const ANCHORS={roads:'5,4',railways:'7,7',airports:'1,7',ports:'10,4',powerPlants:'8,3',hospitals:'4,7',schools:'2,4',universities:'4,2',factories:'10,8',dataCenters:'8,8',researchCenters:'7,1'};
export const LAND=tiles().filter(t=>t.terrain==='land');
export function resolveCity(state,saved=[]){
 const used=new Set(),counts={},out=[];
 for(const p of Array.isArray(saved)?saved:[]){if(!p||!Object.hasOwn(BUILDINGS,p.type)||!LAND.some(t=>t.id===p.tile)||used.has(p.tile))continue;const cap=Math.min(8,Math.max(0,Math.trunc(state.buildings[p.type]||0)));if((counts[p.type]||0)>=cap)continue;out.push({type:p.type,tile:p.tile});used.add(p.tile);counts[p.type]=(counts[p.type]||0)+1}
 // Owned networks have representative sites; extra counts remain visible in district totals.
 for(const type of Object.keys(BUILDINGS)){const desired=Math.min(8,Math.max(0,Math.trunc(state.buildings[type]||0)));while((counts[type]||0)<desired){const t=LAND.find(x=>x.id===ANCHORS[type]&&!used.has(x.id))||LAND.find(x=>!used.has(x.id));if(!t)break;out.push({type,tile:t.id});used.add(t.id);counts[type]=(counts[type]||0)+1}}
 return out;
}
export function canPlace(state,placements,tile,type){return !!state&&!state.multiplayer&&Object.hasOwn(BUILDINGS,type)&&LAND.some(t=>t.id===tile)&&!placements.some(x=>x.tile===tile)&&Number.isFinite(state.treasury)&&state.treasury>=BUILDINGS[type].cost}
export function placePurchased(state,placements,tile,type,previousCount){
 if(!Object.hasOwn(BUILDINGS,type)||(state.buildings[type]||0)!==previousCount+1||!LAND.some(t=>t.id===tile)||placements.some(x=>x.tile===tile))return placements;
 return resolveCity(state,[{tile,type},...placements]);
}
export function formatMoney(value,currency='AR'){if(!Number.isFinite(value))return '—';return `${currency} ${Math.abs(value)>=1000?(value/1000).toFixed(2)+'T':value.toFixed(1)+'B'}`}
export function parseLayout(text){try{const data=JSON.parse(text);if(data?.version!==MAP_VERSION||!Array.isArray(data.placements)||data.placements.length>LAND.length)return [];return data.placements.filter(p=>p&&typeof p.tile==='string'&&typeof p.type==='string').map(p=>({tile:p.tile,type:p.type}))}catch{return []}}
