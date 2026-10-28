import {COUNTRIES} from '../data/countries.js';
const defs=[
 ['industrial','Industrial Giant',s=>s.industryIndex>=140],['miracle','Economic Miracle',s=>s.history.length>=24&&s.history.slice(-24).every((x,i,a)=>i===0||x.gdp>=a[i-1].gdp)],['debtfree','Debt Free',s=>s.debt<=1],['energy','Energy Independent',s=>s.energy.production>=s.energy.consumption&&s.energy.imported===0],['tech','Tech Superpower',s=>s.techLevel>=98],['resource','Resource Titan',s=>s.trade.exports>s.gdp*.28],['survivor','Crisis Survivor',s=>s.collapseStage==='Stable'&&s.history.some(h=>h.inflation>20)],['leader','Commonwealth Leader',s=>playerPower(s)>Math.max(...COUNTRIES.map(countryPower))]
];
const countryPower=c=>c.gdp/500+c.tech*.24+c.military*.2+c.infra*.16+Math.log10(c.population+1)*8;
const playerPower=s=>s.gdp/500+s.techLevel*.24+s.military*.2+s.infra*.16+Math.log10(s.population+1)*8;
export function checkAchievements(s){for(const [id,name,test] of defs){if(!s.achievements.includes(id)&&test(s)){s.achievements.push(id);s.notifications.unshift({type:'achievement',text:`Achievement unlocked: ${name}`})}}
return defs}
