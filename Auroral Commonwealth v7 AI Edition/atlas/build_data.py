"""Build offline source-derived maps. No hand-drawn national boundary geometry.
Usage: python atlas/build_data.py /absolute/path/to/atlas-source
Required source URLs and checksums are recorded in data/provenance.json.
"""
import json,math,sys,pathlib,hashlib,re,zipfile
SRC=pathlib.Path(sys.argv[1]);OUT=pathlib.Path(__file__).parent/'data';OUT.mkdir(exist_ok=True)
load=lambda name:json.loads((SRC/name).read_text())
with zipfile.ZipFile(SRC/'cliopatria.zip') as z:
 raw=json.loads(z.read(next(n for n in z.namelist() if n.endswith('.geojson'))))['features']
 for year in [1783,1942]:
  (SRC/f'clio_{year}.geojson').write_text(json.dumps({'type':'FeatureCollection','features':[f for f in raw if f['properties']['FromYear']<=year<=f['properties']['ToYear']]},separators=(',',':')))
 del raw

legacy=load('legacy-roster.json');by_iso={c.get('alpha2'):c for c in legacy};by_id={c['id']:c for c in legacy}
modern=load('modern.geojson');cshapes=load('cshapes.geojson');disputed=load('disputed.geojson')
catalog=[];maps={};source_log={}
for file,url in [('modern.geojson','https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson'),('disputed.geojson','https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_breakaway_disputed_areas.geojson'),('cshapes.geojson','https://icr.ethz.ch/data/cshapes/CShapes-2.0.geojson'),('cliopatria.zip','https://github.com/Seshat-Global-History-Databank/cliopatria/blob/main/cliopatria.geojson.zip')]:
 b=(SRC/file).read_bytes();source_log[file]={'url':url,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def segment_distance(p,a,b):
 dx,dy=b[0]-a[0],b[1]-a[1]
 if dx==dy==0:return (p[0]-a[0])**2+(p[1]-a[1])**2
 t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)))
 return (p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2
def rdp(points,tolerance=.018):
 if len(points)<3:return points
 a,b=points[0],points[-1];distance,index=max((segment_distance(p,a,b),i) for i,p in enumerate(points[1:-1],1))
 if distance<=tolerance*tolerance:return [a,b]
 return rdp(points[:index+1],tolerance)[:-1]+rdp(points[index:],tolerance)
def ring(points):
 points=[p[:2] for p in points]
 # Preserve dateline-crossing rings; simplification otherwise uses degrees at world-map scale.
 if len(points)>8 and not any(abs(a[0]-b[0])>180 for a,b in zip(points,points[1:])):
  pivot=max(range(1,len(points)-1),key=lambda i:(points[i][0]-points[0][0])**2+(points[i][1]-points[0][1])**2)
  simple=rdp(points[:pivot+1])[:-1]+rdp(points[pivot:])
  if len(simple)>=4:points=simple
 return [[round(float(x),5),round(float(y),5)] for x,y in points]
def geom(g):
 if g['type']=='Polygon':return {'type':'Polygon','coordinates':[ring(r) for r in g['coordinates']]}
 if g['type']=='MultiPolygon':return {'type':'MultiPolygon','coordinates':[[ring(r) for r in p] for p in g['coordinates']]}
 raise ValueError(g['type'])
def centre(g):
 polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
 def area(r):return abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(r,r[1:])))
 r=max(polys,key=lambda p:area(p[0]))[0]
 # A source-polygon representative coordinate, never asserted to be the historical capital.
 return [round(sum(p[1] for p in r)/len(r),4),round(sum(p[0] for p in r)/len(r),4)]
def add_row(id,name,era,category,geometry,**kwargs):
 if any(c['id']==id for c in catalog):return
 catalog.append({'id':id,'name':name,'era':era,'category':category,'map':centre(geometry),**kwargs})
def feature(id,name,country_id,g,source,**kwargs):return {'type':'Feature','id':id,'properties':{'name':name,'countryId':country_id,'source':source,**kwargs},'name':name,'countryId':country_id,'geometry':geom(g),'source':source,**kwargs}
# 2026 lists are a membership-based menu. Recognition is not conferred by the UN.
for c in legacy:
 if c['region'] not in ['Fictional','Historical','Disputed / De facto']:
  catalog.append({'id':c['id'],'name':'Holy See / Vatican City' if c['id']=='vat' else c['name'],'era':2026,'category':'UN Recognized','membership':'UN observer state' if c['id'] in ['vat','pse'] else 'UN member state','map':c['map'],'legacy':True})
 elif c['region']=='Fictional':catalog.append({'id':c['id'],'name':c['name'],'era':2026,'category':'Fictional','map':c['map'],'legacy':True,'geography':'No real-world territorial claim or source boundary.'})
modern_disputed={'TWN':('twn','Taiwan'),'KOS':('xkx','Kosovo'),'CYN':('cyn','Northern Cyprus'),'SOL':('sml','Somaliland'),'SAH':('sah','Western Sahara / SADR')}
modern_extra={'CK':('cok','Cook Islands'),'NU':('niu','Niue')}
features=[]
for i,f in enumerate(modern['features']):
 p=f['properties'];a=p.get('ISO_A2_EH') or p.get('ISO_A2');code=p.get('ADM0_A3');cid=None
 if a in by_iso and by_iso[a]['region'] not in ['Fictional','Historical','Disputed / De facto']:cid=by_iso[a]['id']
 if code in modern_disputed:
  cid,name=modern_disputed[code];add_row(cid,name,2026,'Disputed',f['geometry'],membership='Outside UN membership; status/sovereignty contested.',region=p.get('REGION_UN'))
 if a in modern_extra:
  cid,name=modern_extra[a];add_row(cid,name,2026,'Non-UN Recognized',f['geometry'],membership='Self-governing state in free association; not a UN member or observer state.',region=p.get('REGION_UN'))
 # A dependency has an inspectable outline; it is not silently promoted to a sovereign country.
 features.append(feature('ne-'+str(i),p['ADMIN'],cid,f['geometry'],'Natural Earth 1:50m',status=p.get('TYPE'),sovereign=p.get('SOVEREIGNT'),disputed=code in modern_disputed))
# Breakaway boundary labels supplied by Natural Earth; excluded obsolete separatist administrations.
for i,f in enumerate(disputed['features']):
 p=f['properties'];brk=p.get('BRK_NAME') or p.get('NAME');name=p.get('NAME');cid=None
 if name=='Moldova':cid='tns';display='Transnistria'
 elif name=='Georgia':
  cid={'Abkhazia':'abk','South Ossetia':'sos'}.get(brk)
  if not cid:continue
  display=brk
 else:
  if p.get('TYPE') in ['Disputed','Indeterminate']:
   features.append(feature('ne-claim-'+str(i),p.get('BRK_NAME') or p.get('NAME') or 'Disputed area',None,f['geometry'],'Natural Earth disputed areas',status='Source-mapped disputed claim area; not a live control line.',disputed=True))
  continue
 add_row(cid,display,2026,'Disputed',f['geometry'],legacy=cid=='tns',membership='Outside UN membership; sovereignty contested.')
 features.append(feature('ne-dispute-'+str(i),display,cid,f['geometry'],'Natural Earth disputed areas',status='Disputed / breakaway',disputed=True))
maps[2026]={'era':2026,'basis':'2026 membership roster; Natural Earth maintained cartographic basemap, not a live 2026 military-control survey.','features':features,'control':[]}
# CShapes supplies de-jure country/dependency polygons, not WWII occupation fronts.
labels={'Germany (Prussia)':'Germany','Italy/Sardinia':'Kingdom of Italy','India':'British India','Sri Lanka (Ceylon)':'Ceylon','Taiwan':'Taiwan (Japanese territory)','Korea':'Korea (Japanese territory)','Namibia':'South West Africa','Zimbabwe (Rhodesia)':'Southern Rhodesia','Zambia':'Northern Rhodesia','Malawi':'Nyasaland','Botswana':'Bechuanaland','Lesotho':'Basutoland','Ghana':'Gold Coast','Cote D\'Ivoire':'Ivory Coast','Mali':'French Sudan','United Arab Emirates':'Trucial States','Indonesia':'Dutch East Indies','New Guinea (German New Guinea) (Kaiser Wilhelmsland)':'New Guinea','Congo, Democratic Republic of (Zaire)':'Belgian Congo','Madagascar (Malagasy)':'Madagascar','Swaziland (Eswatini)':'Swaziland','Federated Malay States':'Federated Malay States','Vietnam (Annam/Cochin China/Tonkin)':'Vietnamese territories (French Indochina)','Cambodia (Kampuchea)':'Cambodia','French Guyana':'French Guiana','British Somaliland (Somaliland Republic)':'British Somaliland'}
for year in [1919,1942]:
 date=(year,1,1);features=[]
 for f in cshapes['features']:
  p=f['properties'];start=tuple(p[k] for k in ['gwsyear','gwsmonth','gwsday']);end=tuple(p[k] for k in ['gweyear','gwemonth','gweday'])
  if not start<=date<=end:continue
  raw=p['cntry_name'];name=labels.get(raw,raw)
  if raw=='Russia (Soviet Union)':name='Russian SFSR' if year==1919 else 'Soviet Union'
  if raw=='Turkey (Ottoman Empire)':name='Ottoman Empire' if year==1919 else 'Turkey'
  if raw=='United Kingdom':name='United Kingdom of Great Britain and Ireland' if year==1919 else 'United Kingdom'
  if raw=='Thailand' and year==1919:name='Siam'
  if raw=='Iran (Persia)':name='Persia' if year==1919 else 'Iran'
  if raw=='Ireland' and year==1942:name='Ireland'
  cid=f'era{year}-gw{p["gwcode"]}'
  add_row(cid,name,year,'States & dependencies',f['geometry'],capital=p['capname'],map=[p['caplat'],p['caplong']],sourceName=raw,source='CShapes 2.0',validFrom=list(start),validTo=list(end),gameValues='Synthetic scenario values; not historical economic statistics.')
  features.append(feature(cid,name,cid,f['geometry'],'CShapes 2.0',sourceName=raw,status='State or dependency in the source dataset',validFrom=list(start),validTo=list(end)))
 maps[year]={'era':year,'snapshot':f'{year}-01-01','basis':'Dated de-jure state and dependency boundaries; source excludes many temporary wartime changes and small territorial changes.','features':features,'control':[]}
# The 1783 source preserves polities and super-polity relationships. Avoid drawing aggregate duplicates.
clio=load('clio_1783.geojson')['features'];features=[];review=[]
known_bad={'New France','New Netherland','County of Urgell','Sultanate of Malacca','Khmer Empire'}
for f in clio:
 p=f['properties'];raw=p['Name']
 if p.get('Components') or raw.startswith('('):continue
 if raw in known_bad:
  review.append({'sourceName':raw,'reason':'Source label is anachronistic or unresolved for 1783; withheld from selectable roster.'});continue
 name={'Kingdom of Naples (Napoleonic)':'Kingdoms of Naples and Sicily','Swedish Empire':'Sweden','Duchy of Bavaria':'Electorate of Bavaria'}.get(raw,raw)
 cid='era1783-'+hashlib.sha256(raw.encode()).hexdigest()[:12]
 add_row(cid,name,1783,'Polities & dependencies',f['geometry'],source='Cliopatria 0.2.1',sourceName=raw,parent=p.get('MemberOf','').strip('()'),validFrom=p['FromYear'],validTo=p['ToYear'],gameValues='Synthetic scenario values; not historical economic statistics.')
 features.append(feature(cid,name,cid,f['geometry'],'Cliopatria 0.2.1',sourceName=raw,parent=p.get('MemberOf','').strip('()'),status='Historical reconstruction; source-year resolution',uncertain=True))
maps[1783]={'era':1783,'snapshot':'1783 (source-year resolution)','basis':'Historical reconstruction, not an exhaustive gazetteer or surveyed international frontier. Known unresolved/anachronistic source records are withheld. Blank areas are coverage gaps, not unclaimed land.','features':features,'control':[],'withheld':review}
# WWII control is an independently sourced, year-resolution reconstruction, not inferred from CShapes.
clio=load('clio_1942.geojson')['features']
controllers={'Nazi Germany','Empire of Japan','Kingdom of Italy','Vichy France','Free French','Independent State of Croatia','Communist Party of China'}
for f in clio:
 p=f['properties'];name=p['Name']
 if name not in controllers or p.get('Components'):continue
 maps[1942]['control'].append(feature('control-'+hashlib.sha256(name.encode()).hexdigest()[:10],name,None,f['geometry'],'Cliopatria 0.2.1',status='Source-year territorial-control reconstruction; includes domestic territory, occupation and/or dependencies as coded by the source.',uncertain=True))
# War-era de-facto polity choices supplement the de-jure roster and remain clearly distinguished.
for f in clio:
 p=f['properties'];name=p['Name']
 if name not in {'Nazi Germany','Empire of Japan','Vichy France','Free French','Independent State of Croatia','Communist Party of China'}:continue
 cid='era1942-control-'+hashlib.sha256(name.encode()).hexdigest()[:10]
 add_row(cid,name,1942,'Wartime polities',f['geometry'],source='Cliopatria 0.2.1',sourceName=name,gameValues='Synthetic scenario values; not historical economic statistics.')
 for item in maps[1942]['control']:
  if item['name']==name:
   item['countryId']=cid;item['properties']['countryId']=cid
for year,data in maps.items():
 data['type']='FeatureCollection'
 out=OUT/f'world-{year}.geojson';out.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')));print(year,len(data['features']),len(data['control']),out.stat().st_size)
(OUT/'catalog.js').write_text('export const ATLAS_ROWS='+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+';\n')
provenance={'generated':'2026-10-28','sources':source_log,'transform':'Filter source validity intervals; retain sourced polygons; simplify rings at 0.018 degree tolerance, preserving small and dateline-crossing rings; round coordinates to 5 decimals. No generated or hand-drawn national territories.','licenses':{'Natural Earth':'Public domain','CShapes 2.0':'CC BY-NC-SA 4.0','Cliopatria':'CC BY 4.0'},'limitations':['2026 is a membership scenario label, not a claim that the maintained basemap is a live military-control survey.','CShapes de-jure polygons do not imply wartime occupation.','1942 control has annual resolution and is not guaranteed to align to 1942-01-01.','1783 coverage is not exhaustive; source uncertainty and withheld records are disclosed.'],'catalogCount':len(catalog)}
(OUT/'provenance.json').write_text(json.dumps(provenance,indent=2))
print('catalog',len(catalog))
