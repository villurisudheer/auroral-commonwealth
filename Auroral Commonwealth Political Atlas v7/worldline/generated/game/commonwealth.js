// Generated from the unchanged Stable v6.1 source by worldline/build.mjs.
import {observe} from '../../core.js';
function raw_fundDevelopmentProgram(s){const cost=180;if(s.treasury<cost)return false;s.treasury-=cost;s.commonwealth.projects++;s.infra=Math.min(100,s.infra+.8);s.approval=Math.min(100,s.approval+.8);s.diplomacy.reputation=Math.min(100,s.diplomacy.reputation+1);return true}
function raw_developmentBankLoan(s){const amount=300;const ceiling=s.gdp*(s.difficulty==='nightmare'?1.35:s.difficulty==='hard'?1.75:2.4);if(s.debt+amount>ceiling)return false;s.debt+=amount*1.02;s.treasury+=amount;s.commonwealth.projects++;return true}
function raw_researchPartnership(s){const cost=120;if(s.treasury<cost)return false;s.treasury-=cost;s.commonwealth.projects++;s.research.points+=25;s.research.researchers+=.15;s.techLevel=Math.min(100,s.techLevel+.4);s.diplomacy.reputation=Math.min(100,s.diplomacy.reputation+2);return true}
function raw_humanitarianAid(s){const cost=100;if(s.treasury<cost)return false;s.treasury-=cost;s.diplomacy.aid+=cost;s.diplomacy.reputation=Math.min(100,s.diplomacy.reputation+3);s.approval=Math.max(0,s.approval-.2);return true}

export function fundDevelopmentProgram(s,...args){return observe(s,'fundDevelopmentProgram',()=>raw_fundDevelopmentProgram(s,...args),args)}

export function developmentBankLoan(s,...args){return observe(s,'developmentBankLoan',()=>raw_developmentBankLoan(s,...args),args)}

export function researchPartnership(s,...args){return observe(s,'researchPartnership',()=>raw_researchPartnership(s,...args),args)}

export function humanitarianAid(s,...args){return observe(s,'humanitarianAid',()=>raw_humanitarianAid(s,...args),args)}
