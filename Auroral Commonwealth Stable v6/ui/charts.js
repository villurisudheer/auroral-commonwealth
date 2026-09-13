const palettes={gdp:'#39a7d6',inflation:'#d99a16',debt:'#8d68d8',unemployment:'#e05f74',population:'#20a878',industry:'#4b8dd1'};
export function chartBounds(values){
 const vals=values.filter(Number.isFinite);
 if(!vals.length)return null;
 let min=Math.min(...vals),max=Math.max(...vals);
 if(min===max){const delta=Math.abs(min)*.05||1;min-=delta;max+=delta}
 const pad=(max-min)*.1||1;
 return {min:min-pad,max:max+pad};
}
export function drawChart(canvas,history,key,label){
 if(!canvas)return;
 const dpr=Number.isFinite(globalThis.devicePixelRatio)?Math.max(1,globalThis.devicePixelRatio):1;
 const w=canvas.clientWidth||600,h=canvas.clientHeight||220;
 canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));
 const c=canvas.getContext('2d');if(!c)return;
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
 const css=getComputedStyle(document.documentElement),line=css.getPropertyValue('--line').trim()||'#1f3b55',muted=css.getPropertyValue('--muted').trim()||'#8ea8bf',accent=css.getPropertyValue('--accent').trim()||'#72d7ff';
 c.strokeStyle=line;c.lineWidth=1;for(let i=1;i<5;i++){c.beginPath();c.moveTo(36,(h-28)*i/5);c.lineTo(w-12,(h-28)*i/5);c.stroke()}
 const vals=(Array.isArray(history)?history:[]).slice(-60).map(x=>x?.[key]).filter(Number.isFinite);
 if(vals.length<2){c.fillStyle=muted;c.font='11px system-ui';c.fillText('Not enough history yet',20,30);return}
 const bounds=chartBounds(vals);if(!bounds)return;const {min,max}=bounds;
 c.strokeStyle=palettes[key]||accent;c.lineWidth=2.2;c.beginPath();vals.forEach((v,i)=>{const x=36+i*(w-52)/(vals.length-1);const y=10+(max-v)/(max-min)*(h-42);i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();
 c.fillStyle=muted;c.font='11px system-ui';c.fillText(label||key,12,h-9);c.fillText(max.toFixed(Math.abs(max)<100?1:0),4,16);c.fillText(min.toFixed(Math.abs(min)<100?1:0),4,h-34);
}
