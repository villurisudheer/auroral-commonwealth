"""Add dated Chronicle layers without rewriting any previous atlas data or game module.
python chronicle/build_data.py /absolute/path/to/atlas-source
Uses the existing atlas's geometry transformation functions, read as definitions only.
"""
import ast,hashlib,json,pathlib,sys,zipfile
SRC=pathlib.Path(sys.argv[1]);HERE=pathlib.Path(__file__).parent;OUT=HERE/'data'
eras=json.loads((OUT/'eras.json').read_text());catalog=[]
# Reuse the exact audited simplification; executing function definitions does not run the old builder.
old=ast.parse((HERE.parent/'atlas/build_data.py').read_text())
functions={'segment_distance','rdp','ring','geom','centre','add_row','feature'}
for node in old.body:
 if isinstance(node,ast.FunctionDef) and node.name in functions:exec(compile(ast.Module(body=[node],type_ignores=[]),'atlas geometry helpers','exec'))
labels=next(node.value for node in old.body if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='labels' for t in node.targets))
labels=ast.literal_eval(labels)
with zipfile.ZipFile(SRC/'cliopatria.zip') as z:clio=json.loads(z.read(next(n for n in z.namelist() if n.endswith('.geojson'))))['features']
cshapes=json.loads((SRC/'cshapes.geojson').read_text())['features']
# Reviewed existence/label problems. Withhold dubious geometry instead of substituting modern borders.
rules={
 'Great Yuan':(1271,1368),'Sasanian Empire':(224,651),'Abbasid Caliphate':(750,1258),
 'Hamdanid Emirates':(890,1004),'Ngô Dynasty':(939,968),'Kingdom of Polonnaruwa':(1055,1236),
 'Kingdom of Dali':(937,1253),'New France':(1534,1763),'New Netherland':(1614,1674),
 'County of Urgell':(785,1413),'Sultanate of Malacca':(1400,1511),'Khmer Empire':(802,1431),
 'Helvetic Republic':(1798,1803),'Septinsular Republic':(1800,1807),'Grand Duchy of Tuscany':(1569,1801),
 'Principality of Regensberg':(1803,1810),'Guayaquil Junta':(1820,1822),'Byeonhan':(0,400),
}
withheld_all={};counts={}
def annual_allowed(name,year):
 if name in rules and not rules[name][0]<=year<=rules[name][1]:return 'Outside reviewed existence window; source geometry withheld rather than redated.'
 if name=='Empire of Haiti' and not (1804<=year<=1806 or 1849<=year<=1859):return 'Haiti was not a single Haitian empire in this year; source geometry withheld.'
 if name=='Italian Republic' and 1806<=year<=1945:return 'Source republican label does not identify the Napoleonic Kingdom of Italy; withheld.'
 if name=='Great Yuan' and year<1271:return 'Anachronistic Yuan record.'
 return None
def register(cid,name,era,g,**extra):
 row={'id':cid,'name':name,'era':era['year'],'epochKey':era['key'],'category':extra.pop('category','Polities & dependencies'),'map':centre(g),'source':extra.pop('source','Cliopatria 0.2.1'),'gameValues':'Synthetic game template; not historical population, technology or economic evidence.',**extra}
 catalog.append(row);return row
for era in eras:
 year=era['year'];key=era['key']
 if year in [2026,1783]:continue
 features=[];control=[];withheld=[]
 if key in ['wwi','wwii']:
  date=tuple(era['start'])
  for f in cshapes:
   p=f['properties'];start=tuple(p[k] for k in ['gwsyear','gwsmonth','gwsday']);end=tuple(p[k] for k in ['gweyear','gwemonth','gweday'])
   if not start<=date<=end:continue
   raw=p['cntry_name'];name=labels.get(raw,raw)
   rename={'Germany (Prussia)':'German Empire' if key=='wwi' else 'Nazi Germany','Russia (Soviet Union)':'Russia (Provisional Government)' if key=='wwi' else 'Soviet Union','Turkey (Ottoman Empire)':'Ottoman Empire' if key=='wwi' else 'Turkey','United Kingdom':'United Kingdom of Great Britain and Ireland' if key=='wwi' else 'United Kingdom','Thailand':'Siam' if key=='wwi' else 'Thailand','Iran (Persia)':'Persia' if key=='wwi' else 'Iran','Japan':'Empire of Japan'}
   name=rename.get(raw,name);cid=f'epoch-{key}-gw{p["gwcode"]}'
   register(cid,name,era,f['geometry'],category='States & dependencies',source='CShapes 2.0',sourceName=raw,capital=p['capname'],validFrom=list(start),validTo=list(end))
   features.append(feature(cid,name,cid,f['geometry'],'CShapes 2.0',sourceName=raw,validFrom=list(start),validTo=list(end),status='Dated state/dependency coding; not an occupation or front-line boundary.'))
  names={'German Empire','Austria-Hungary','Ottoman Empire'} if key=='wwi' else {'Nazi Germany','Empire of Japan','Kingdom of Italy','Vichy France','Free French','Independent State of Croatia','Communist Party of China'}
  for f in clio:
   p=f['properties'];raw=p['Name']
   if raw not in names or not p['FromYear']<=year<=p['ToYear'] or p.get('Components'):continue
   cid=next((r['id'] for r in catalog if r['epochKey']==key and r['name']==raw),None)
   if cid is None:
    cid=f'epoch-{key}-war-'+hashlib.sha256(raw.encode()).hexdigest()[:12]
    register(cid,raw,era,f['geometry'],category='Wartime polities',sourceName=raw,validFrom=p['FromYear'],validTo=p['ToYear'])
   control.append(feature('extent-'+cid,raw,cid,f['geometry'],'Cliopatria 0.2.1',status='Selected annual territorial extent: may combine home territory, dependencies, claims or occupation; not a day-exact frontline.',validFrom=p['FromYear'],validTo=p['ToYear'],uncertain=True))
  basis=f"{era['label']} start {year}-{date[1]:02d}-{date[2]:02d}. Green: dated CShapes state/dependency coding, which omits many temporary wartime changes. Red: selected annual Cliopatria territorial extents; not complete occupation lines and not guaranteed to match the start day."
 else:
  for f in clio:
   p=f['properties'];raw=p['Name']
   if not p['FromYear']<=year<=p['ToYear'] or p.get('Components') or raw.startswith('('):continue
   reason=annual_allowed(raw,year)
   if reason:withheld.append({'sourceName':raw,'reason':reason,'sourceValidFrom':p['FromYear'],'sourceValidTo':p['ToYear']});continue
   name=raw;parent=p.get('MemberOf','').strip('()')
   if raw=='Swedish Empire' and year>1721:name='Sweden (source extent)'
   if raw=='Kingdom of Great Britain' and year>=1801:name='Great Britain (UK core; source component)'
   if raw=='Eastern Wu' and year==220:name="Sun Quan's territories (later Eastern Wu)"
   if raw=='Cao Cao' and year==220:name='Cao-Wei transition'
   cid=f'epoch-{key}-'+hashlib.sha256(raw.encode()).hexdigest()[:12]
   register(cid,name,era,f['geometry'],sourceName=raw,parent=parent,validFrom=p['FromYear'],validTo=p['ToYear'])
   features.append(feature(cid,name,cid,f['geometry'],'Cliopatria 0.2.1',sourceName=raw,parent=parent,validFrom=p['FromYear'],validTo=p['ToYear'],uncertain=True,status='Annual historical reconstruction; dependency/aggregate relations are source-reported and coverage is incomplete.'))
  basis=f"{era['label']} — {era['title']}. Source-year reconstruction, not surveyed or day-exact borders. Grey land denotes missing historical coverage, not unclaimed territory. {len(withheld)} suspect source records withheld. Overlapping source polities/dependencies may remain."
 # Large extents render first; smaller source polities remain visible. No union, inferred control or modern fill-in.
 def size(f):
  g=f['geometry'];polys=[g['coordinates']] if g['type']=='Polygon' else g['coordinates']
  return sum(abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(p[0],p[0][1:]))) for p in polys)
 features.sort(key=size,reverse=True)
 data={'type':'FeatureCollection','era':year,'epochKey':key,'label':era['label'],'title':era['title'],'snapshot':f'{year}-{era["start"][1]:02d}-{era["start"][2]:02d}' if key in ['wwi','wwii'] else f'AD {year} (source-year resolution)','precision':era['precision'],'basis':basis,'features':features,'control':control,'withheld':withheld}
 (OUT/f'{key}.geojson').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
 withheld_all[key]=withheld;counts[key]={'states':len(features),'extents':len(control),'selectable':sum(r['epochKey']==key for r in catalog)}
 print(key,counts[key])
(OUT/'catalog.js').write_text('export const CHRONICLE_ROWS='+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+';\n')
(OUT/'eras.js').write_text('export const EPOCHS='+json.dumps(eras,ensure_ascii=False,separators=(',',':'))+';\n')
provenance={'release':'7.1.0','sources':{name:{'sha256':hashlib.sha256((SRC/name).read_bytes()).hexdigest(),'url':url,'license':license} for name,url,license in [('cliopatria.zip','https://github.com/Seshat-Global-History-Databank/cliopatria','CC BY 4.0'),('cshapes.geojson','https://icr.ethz.ch/data/cshapes/','CC BY-NC-SA 4.0')]},'counts':counts,'withheld':withheld_all,'transform':'Reuse atlas RDP at 0.018 degrees with tiny/dateline rings preserved; five-decimal coordinates. Source validity filtering; non-aggregate polity records; reviewed existence-window exclusions; no invented country geometry. CShapes dates apply only to its coded state/dependency validity, not to actual wartime occupation. Annual Cliopatria layers are not January-1 frontiers.','limitations':['Era choices are editorial turning points, not an objective ranking of history.','Ancient and medieval coverage is incomplete and contains remaining source uncertainty, overlaps and source aggregates.','All economic, population and technology templates are synthetic gameplay values; no era-specific warfare, religion or institutions are simulated.','1783 and 2026 continue to use the preserved atlas layers and documented limitations.'],'catalogCount':len(catalog)}
(OUT/'provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
