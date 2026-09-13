const KEY='auroral-commonwealth-saves-v1';
function writeSaves(all){try{localStorage.setItem(KEY,JSON.stringify(all));return true}catch{return false}}
export function listSaves(){try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[]}catch{return []}}
export function saveGame(state,name='Autosave'){const all=listSaves();const slot={id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,name:String(name||'Autosave'),updated:Date.now(),state:structuredClone(state)};all.unshift(slot);slot.persisted=writeSaves(all.slice(0,12));return slot}
export function updateSave(id,state){const all=listSaves();const x=all.find(s=>s.id===id);if(!x)return saveGame(state);x.state=structuredClone(state);x.updated=Date.now();x.persisted=writeSaves(all);return x}
export function deleteSave(id){return writeSaves(listSaves().filter(s=>s.id!==id))}
export function renameSave(id,name){const all=listSaves();const x=all.find(s=>s.id===id);if(x)x.name=String(name||x.name);return writeSaves(all)}
