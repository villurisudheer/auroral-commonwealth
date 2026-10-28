export const WIDTH=1200,HEIGHT=600;
export const escapeText=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function polygonPath(geometry){
 const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
 return polygons.map(poly=>poly.map(ring=>{
  let previous=null,offset=0;const points=ring.map(([lon,lat])=>{if(previous!==null){while(lon+offset-previous>180)offset-=360;while(lon+offset-previous< -180)offset+=360}previous=lon+offset;return [((previous+180)/360*WIDTH).toFixed(2),((90-Math.max(-90,Math.min(90,lat)))/180*HEIGHT).toFixed(2)]});
  return points.length?'M'+points.map(p=>p.join(',')).join('L')+'Z':'';
 }).join('')).join('');
}
function smallStateMarker(f){
 if(!f.countryId)return '';
 const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(const p of polygons)for(const [lon,lat] of p[0]){minX=Math.min(minX,lon);maxX=Math.max(maxX,lon);minY=Math.min(minY,lat);maxY=Math.max(maxY,lat)}
 if(maxX-minX>.65||maxY-minY>.65)return '';
 return `<circle class="at-small-state" cx="${((minX+maxX)/2+180)/360*WIDTH}" cy="${(90-(minY+maxY)/2)/180*HEIGHT}" r="1.8" fill="#9fd8c6" stroke="#ecfff4" stroke-width=".5" vector-effect="non-scaling-stroke"/>`;
}
export function color(id){let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))|0;return `hsl(${Math.abs(h)%360} 24% 31%)`}
export function mapSVG(data,{selected=null,stateBorders=true,control=true,labels=false}={}){
 const esc=escapeText;
 const shapes=(data.features||[]).map(f=>{
  const active=!!selected&&f.countryId===selected,id=esc(f.id);return `<g class="at-feature ${active?'at-selected':''} ${f.disputed?'at-disputed':''}" data-feature="${id}" role="button" tabindex="0" aria-label="${esc(f.name)}"><title>${esc(f.name+' — '+f.source)}</title><path d="${polygonPath(f.geometry)}" fill="${color(f.countryId||f.id)}" fill-rule="evenodd" stroke="${stateBorders?'#73dda2':'transparent'}" stroke-width="${active?1.7:.5}" vector-effect="non-scaling-stroke"/>${active?`<path d="${polygonPath(f.geometry)}" fill="#fff0ae" fill-opacity=".25" stroke="#ffe8a0" vector-effect="non-scaling-stroke"/>`:''}${smallStateMarker(f)}</g>`;
 }).join('');
 const land=(data.land||[]).map(f=>`<path d="${polygonPath(f.geometry)}" fill="#354c57" stroke="#354c57" stroke-width=".4" fill-rule="evenodd"/>`).join('');
 const controls=control?(data.control||[]).map(f=>`<path class="at-control" data-feature="${esc(f.id)}" d="${polygonPath(f.geometry)}" fill="#e65c6430" stroke="#ff6f78" stroke-width="1.2" stroke-dasharray="4 2" vector-effect="non-scaling-stroke" fill-rule="evenodd" tabindex="0" role="button" aria-label="${esc(f.name+' control reconstruction')}"><title>${esc(f.name)} • source-year control reconstruction</title></path>`).join(''):'';
 // Duplicate wrapped shapes to keep dateline-crossing geometries local, rather than drawing across the world.
 const grid=Array.from({length:11},(_,i)=>`<path d="M${i*120} 0V600"/>`).join('')+Array.from({length:7},(_,i)=>`<path d="M0 ${i*100}H1200"/>`).join('');
 return `<svg class="at-world-svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="group" aria-label="${data.era} political boundaries"><defs><clipPath id="at-world-clip"><rect width="1200" height="600"/></clipPath></defs><rect width="1200" height="600" fill="#102c43"/><g fill="none" stroke="#6391a0" stroke-opacity=".12" stroke-width=".5">${grid}</g><g clip-path="url(#at-world-clip)"><g>${land}${shapes}${controls}</g><g transform="translate(-1200 0)" aria-hidden="true">${land}${(shapes+controls).replaceAll('tabindex="0"','tabindex="-1"')}</g><g transform="translate(1200 0)" aria-hidden="true">${land}${(shapes+controls).replaceAll('tabindex="0"','tabindex="-1"')}</g></g><text x="20" y="575" fill="#94b5c4" font-size="11" letter-spacing="2">AURORAL POLITICAL ATLAS / ${data.era}</text></svg>`;
}
const cache=new Map();
export async function loadMap(era){
 if(!cache.has(era)){
  const raw=fetch(new URL(`./data/world-${Number(era)}.geojson`,import.meta.url)).then(r=>{if(!r.ok)throw Error('Boundary file could not be loaded');return r.json()});
  const promise=era===2026?raw:Promise.all([raw,loadMap(2026)]).then(([historical,modern])=>({...historical,land:modern.features}));
  cache.set(era,promise);promise.catch(()=>cache.delete(era));
 }
 return cache.get(era);
}
