const KEY='auroral-commonwealth-saves-v1';
export function listSaves(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
export function saveGame(state,name='Autosave'){const all=listSaves();const slot={id:crypto.randomUUID?.()||String(Date.now()),name,updated:Date.now(),state:structuredClone(state)};all.unshift(slot);localStorage.setItem(KEY,JSON.stringify(all.slice(0,12)));return slot}
export function updateSave(id,state){const all=listSaves();const x=all.find(s=>s.id===id);if(!x)return saveGame(state);x.state=structuredClone(state);x.updated=Date.now();localStorage.setItem(KEY,JSON.stringify(all));return x}
export function deleteSave(id){localStorage.setItem(KEY,JSON.stringify(listSaves().filter(s=>s.id!==id)))}
export function renameSave(id,name){const all=listSaves();const x=all.find(s=>s.id===id);if(x)x.name=name;localStorage.setItem(KEY,JSON.stringify(all))}
