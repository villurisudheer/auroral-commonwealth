export const REGIONS=[
 {key:'world',label:'World',box:[0,0,1200,600]},
 {key:'africa',label:'Africa',box:[535,165,280,340]},
 {key:'europe',label:'Europe',box:[490,25,340,220]},
 {key:'asia',label:'Asia',box:[760,0,440,355]},
 {key:'north-america',label:'North America',box:[0,0,455,310]},
 {key:'south-america',label:'South America',box:[305,245,235,265]},
 {key:'oceania',label:'Oceania',box:[920,235,400,270]},
 {key:'antarctica',label:'Antarctica',box:[0,490,1200,110]}
];
export const toMap=([lon,lat])=>[(lon+180)/360*1200,(90-lat)/180*600];
export function fromMap([x,y]){return [((x/1200*360-180+540)%360)-180,Math.max(-89.99,Math.min(89.99,90-y/600*180))]}
export function validateTerritory(geometry){
 if(geometry?.type!=='Polygon'||!Array.isArray(geometry.coordinates)||geometry.coordinates.length!==1)throw Error('Draw one polygon without holes.');const ring=geometry.coordinates[0];
 if(!Array.isArray(ring)||ring.length<4||ring.length>41||ring.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||p[0]<-180||p[0]>180||p[1]<-90||p[1]>90))throw Error('Choose 3–40 valid map vertices.');
 if(ring[0][0]!==ring.at(-1)[0]||ring[0][1]!==ring.at(-1)[1])throw Error('Close the polygon before saving.');
 const points=[];for(const p of ring){const previous=points.at(-1);let x=p[0];if(previous){while(x-previous[0]>180)x-=360;while(x-previous[0]<-180)x+=360}points.push([x,p[1]])}
 if(Math.abs(points.at(-1)[0]-points[0][0])>1e-7)throw Error('A territory cannot wind around the whole globe.');
 let area=0;const edges=points.length-1;for(let i=0;i<edges;i++){const a=points[i],b=points[i+1];if(Math.hypot(a[0]-b[0],a[1]-b[1])<.00001)throw Error('Remove repeated adjacent vertices.');area+=a[0]*b[1]-b[0]*a[1]}
 if(Math.abs(area)<.005)throw Error('Choose an area larger than a line or a point.');
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const on=(a,b,c)=>Math.abs(cross(a,b,c))<1e-9&&c[0]>=Math.min(a[0],b[0])-1e-9&&c[0]<=Math.max(a[0],b[0])+1e-9&&c[1]>=Math.min(a[1],b[1])-1e-9&&c[1]<=Math.max(a[1],b[1])+1e-9;
 function intersects(a,b,c,d){return cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b)}
 for(let i=0;i<edges;i++)for(let j=i+1;j<edges;j++){if(j===i+1||i===0&&j===edges-1)continue;if(intersects(points[i],points[i+1],points[j],points[j+1]))throw Error('Territory edges cannot cross or touch themselves.')}
 return structuredClone(geometry);
}
export function closeTerritory(vertices){if(vertices.length<3)throw Error('Add at least three vertices.');return validateTerritory({type:'Polygon',coordinates:[[...vertices.map(p=>[...p]),[...vertices[0]]]]})}
