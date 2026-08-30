export const TECHNOLOGIES = [
 ['Precision Agriculture','Agriculture',900,10,1.08],['Genomic Medicine','Medicine',1400,14,1.08],['Applied AI','AI',1800,16,1.12],['Industrial Robotics','Robotics',1650,15,1.11],
 ['Orbital Systems','Space',2600,20,1.07],['Advanced Renewables','Energy',1450,14,1.10],['High-Speed Transit','Transportation',1500,14,1.08],['Autonomous Defense','Defense',2400,18,1.09],
 ['Quantum Computing','Computing',2800,22,1.13],['Biomanufacturing','Biotechnology',2100,18,1.10]
].map(([name,category,cost,months,boost],i)=>({id:'tech'+i,name,category,cost,months,boost}));
