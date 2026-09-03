const app=document.querySelector('#app');
let fatalShown=false;
function safeText(x){return String(x??'Unknown error').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showFatal(error,source='Startup'){
  console.error(`[Auroral Commonwealth v6] ${source} error`,error);
  if(fatalShown)return;
  fatalShown=true;
  const message=error?.message||error?.reason?.message||error?.reason||error||'Unknown error';
  app.innerHTML=`<section class="screen center"><div class="hero fatal-panel"><div class="eyebrow">${safeText(source)} Error</div><div class="pill version-pill">Stable v6 Recovery Screen</div><h2>The game could not finish loading.</h2><p>This page is intentionally shown instead of a blank screen.</p><pre class="fatal-code">${safeText(message)}</pre><div class="actions"><button class="btn primary" id="fatalReload">Reload Game</button></div><p class="mini">If this is the public Render server, check the latest Render deploy logs and GitHub commit.</p></div></section>`;
  document.querySelector('#fatalReload')?.addEventListener('click',()=>location.reload());
}
window.addEventListener('error',e=>{if(!e.defaultPrevented)showFatal(e.error||e.message,'Runtime')});
window.addEventListener('unhandledrejection',e=>showFatal(e.reason,'Promise'));
try{
  await import('./main.js');
}catch(error){
  showFatal(error,'Startup');
}
