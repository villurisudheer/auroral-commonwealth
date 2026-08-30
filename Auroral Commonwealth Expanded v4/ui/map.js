import {COUNTRIES} from '../data/countries.js';
import {relationLabel} from '../game/diplomacy.js';

function mapXY(c){
 const [lat=0,lon=0]=c.map||[0,0];
 return [Math.max(1,Math.min(99,(lon+180)/360*100)),Math.max(3,Math.min(97,(90-lat)/180*100))];
}
function escapeHTML(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

export function mapHTML(s){
 const countries=[...COUNTRIES].sort((a,b)=>a.name.localeCompare(b.name));
 return `<div class="panel"><h2>Auroral Strategic Map</h2><p class="mini">All ${COUNTRIES.length} world-roster entries are available, including clearly labelled de facto/disputed and fictional nations. Select any nation for intelligence, relations and diplomatic actions.</p>
 <div class="map-stage">
  <svg viewBox="0 0 1000 480" aria-hidden="true">
   <g fill="#12324a" stroke="#234f6d" stroke-width="2">
    <path d="M55 115 L170 55 285 85 320 145 270 205 205 212 165 280 110 238 85 180Z"/>
    <path d="M250 265 L322 278 365 340 342 452 292 430 270 360Z"/>
    <path d="M410 92 L515 65 580 100 570 142 515 150 490 195 435 175Z"/>
    <path d="M455 195 L560 185 615 255 585 402 510 438 472 355 430 250Z"/>
    <path d="M570 80 L770 65 930 125 960 210 895 258 800 235 735 260 680 218 615 190Z"/>
    <path d="M760 310 L880 300 942 350 915 425 805 438 750 390Z"/>
   </g>
   <g fill="none" stroke="#24526d" stroke-width="1" opacity=".5"><path d="M0 240 H1000"/><path d="M500 0 V480"/></g>
  </svg>
  ${COUNTRIES.map(c=>{const [x,y]=mapXY(c);const home=c.id===s.countryId;const rel=home?'Home nation':relationLabel(s.diplomacy.relations[c.id]||0);return `<button class="map-dot${home?' home':''}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%" data-country="${c.id}" title="${escapeHTML(c.flag+' '+c.name+' — '+rel)}" aria-label="${escapeHTML(c.name)}">${c.flag}</button>`}).join('')}
 </div>
 <details class="country-directory"><summary>Browse all ${COUNTRIES.length} countries</summary><div class="country-directory-grid">${countries.map(c=>`<button class="country-chip${c.id===s.countryId?' home':''}" data-country="${c.id}">${c.flag} ${escapeHTML(c.name)} <span>${escapeHTML(c.region||'World')}</span></button>`).join('')}</div></details>
 </div>`;
}

export function countryDetailHTML(s,c){
 const rel=s.diplomacy.relations[c.id]||0;
 const rr=Object.entries(c.resources||{}).sort((a,b)=>b[1].reserve-a[1].reserve).slice(0,3).map(([k])=>k).join(', ');
 return `<h2>${c.flag} ${c.name}</h2><p class="mini">${escapeHTML(c.capital||'Capital')} • ${escapeHTML(c.region||'World')}${c.status?' • '+escapeHTML(c.status):''}</p><div class="grid two"><div class="card"><b>Population</b><div>${population(c.population)}</div></div><div class="card"><b>GDP</b><div>${money(c.gdp)}</div></div><div class="card"><b>Technology</b><div>${c.tech}/100</div></div><div class="card"><b>Military Power</b><div>${c.military}/100</div></div><div class="card"><b>Infrastructure</b><div>${c.infra}/100</div></div><div class="card"><b>Major Resources</b><div>${rr||'Mixed'}</div></div><div class="card"><b>Estimated Exports</b><div>${money(c.gdp*.12)}</div></div><div class="card"><b>Estimated Imports</b><div>${money(c.gdp*.11)}</div></div><div class="card"><b>Relationship</b><div>${c.id===s.countryId?'Home Nation':relationLabel(rel)} (${rel.toFixed(0)})</div></div></div>${c.id!==s.countryId?`<div class="actions" style="margin-top:16px"><button class="btn primary" data-action="negotiate" data-id="${c.id}">Negotiate (35B)</button><button class="btn" data-action="sanction" data-id="${c.id}">Sanction</button></div>`:''}`;
}
function population(v){return v<1?`${Math.max(1,Math.round(v*1000))}K`:`${v.toFixed(v<10?2:1)}M`}
function money(v){return `AR ${v>=1000?(v/1000).toFixed(2)+'T':v.toFixed(v<10?1:0)+'B'}`}
