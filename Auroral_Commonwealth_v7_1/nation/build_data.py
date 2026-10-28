"""Build offline first-level regions and selected second-level regions from attributed sources."""
import ast,collections,hashlib,json,pathlib,sys
SRC=pathlib.Path(sys.argv[1]);HERE=pathlib.Path(__file__).parent;OUT=HERE/'data';OUT.mkdir(exist_ok=True)
old=ast.parse((HERE.parent/'atlas/build_data.py').read_text())
for node in old.body:
 if isinstance(node,ast.FunctionDef) and node.name in {'segment_distance','rdp','ring','geom','centre'}:exec(compile(ast.Module(body=[node],type_ignores=[]),'geometry functions','exec'))
ne=json.loads((SRC/'natural-earth-admin1.geojson').read_text());groups=collections.defaultdict(list);withheld=[]
for f in ne['features']:
 p=f['properties'];iso=p.get('adm0_a3');name=p.get('name_en') or p.get('name')
 if not iso or not name:continue
 # Keep internationally disputed source assignments out of an unqualified Russian-region drilldown.
 if iso=='RUS' and (str(p.get('iso_3166_2','')).startswith('UA-') or any(v in name.lower() for v in ['crimea','sevastopol','donetsk','luhansk','kherson','zaporiz'])):
  withheld.append({'name':name,'reason':'Disputed Ukraine/Russia assignment; omitted from unqualified Russian administration.'});continue
 groups[iso].append({'type':'Feature','id':p['adm1_code'],'name':name,'unit':p.get('type_en') or 'Region','iso':p.get('iso_3166_2'),'geometry':geom(f['geometry']),'source':'Natural Earth 1:10m Admin 1','properties':{'name':name}})
for iso,fs in groups.items():(OUT/f'{iso}-adm1.geojson').write_text(json.dumps({'type':'FeatureCollection','country':iso,'level':1,'features':fs,'basis':'Natural Earth maintained administrative reference; not certified 2026 legal boundaries. No historical validity is implied.'},ensure_ascii=False,separators=(',',':')))
def rings(g):return [g['coordinates']] if g['type']=='Polygon' else g['coordinates']
def inside_ring(point,r):
 x,y=point;inside=False
 for a,b in zip(r,r[1:]):
  if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:inside=not inside
 return inside

def inside(point,g):return any(inside_ring(point,p[0]) and not any(inside_ring(point,h) for h in p[1:]) for p in rings(g))
def bbox(g):
 pts=[p for poly in rings(g) for p in poly[0]];return [min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts)]
def representative(g):
 poly=max(rings(g),key=lambda p:len(p[0]));r=poly[0];candidate=[sum(p[0] for p in r)/len(r),sum(p[1] for p in r)/len(r)]
 if inside(candidate,g):return candidate
 for a,b in zip(r,r[1:]):
  q=[(a[0]+b[0])/2*.99999+candidate[0]*.00001,(a[1]+b[1])/2*.99999+candidate[1]*.00001]
  if inside(q,g):return q
 return r[0]
provenance={'admin1':{'source':'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/','license':'Public domain','sha256':hashlib.sha256((SRC/'natural-earth-admin1.geojson').read_bytes()).hexdigest(),'countries':{k:len(v) for k,v in groups.items()}},'admin2':{},'withheldDisputed':withheld,'limitations':['First-level source is maintained cartography, not a dated 2026 administrative survey.','District sources represent 2021 India, 2018 USA and 2017 Russia; newly formed units may be absent.','Parent links are spatial joins using an interior representative point. Unmatched records are withheld from drilldown, never assigned to the nearest state.','Historical regions use clearly fictional gameplay sectors, not modern administrative divisions.','City views share a national economy and building pool; no separate province economy or local population is implied.']}
for iso in ['IND','USA','RUS']:
 raw=json.loads((SRC/f'{iso}-ADM2.geojson').read_text());meta=json.loads((SRC/f'{iso}-ADM2-meta.json').read_text());parents=groups[iso];bounds={p['id']:bbox(p['geometry']) for p in parents};features=[];unmatched=[]
 for f in raw['features']:
  p=f['properties'];point=representative(f['geometry']);candidates=[parent for parent in parents if bounds[parent['id']][0]<=point[0]<=bounds[parent['id']][2] and bounds[parent['id']][1]<=point[1]<=bounds[parent['id']][3] and inside(point,parent['geometry'])]
  if len(candidates)!=1:unmatched.append({'id':p['shapeID'],'name':p['shapeName'],'candidateParents':[c['name'] for c in candidates]});continue
  features.append({'type':'Feature','id':p['shapeID'],'name':p['shapeName'],'parentId':candidates[0]['id'],'parentName':candidates[0]['name'],'unit':'County / equivalent' if iso=='USA' else 'District / local unit' if iso=='IND' else 'Rayon / municipal equivalent','geometry':geom(f['geometry']),'source':'geoBoundaries gbOpen '+iso+' ADM2 ('+str(meta['boundaryYearRepresented'])+')','properties':{'name':p['shapeName'],'parentId':candidates[0]['id']}})
 data={'type':'FeatureCollection','country':iso,'level':2,'sourceYear':meta['boundaryYearRepresented'],'features':features,'unmatched':unmatched,'basis':'Source-year administrative reference; not an exhaustive or certified 2026 district list. '+str(len(unmatched))+' unmatched records withheld from state drilldown.'}
 (OUT/f'{iso}-adm2.geojson').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
 provenance['admin2'][iso]={'source':meta['simplifiedGeometryGeoJSON'],'sourceYear':meta['boundaryYearRepresented'],'boundarySource':meta['boundarySource'],'license':meta['boundaryLicense'],'licenseSource':meta.get('licenseSource'),'sourceCount':len(raw['features']),'linkedCount':len(features),'unmatched':unmatched,'sha256':hashlib.sha256((SRC/f'{iso}-ADM2.geojson').read_bytes()).hexdigest()};print(iso,'states',len(parents),'districts',len(features),'unmatched',len(unmatched))
(OUT/'index.js').write_text('export const ADMIN_COUNTRIES='+json.dumps({k:len(v) for k,v in groups.items()},separators=(',',':'))+';\nexport const ADMIN_ISO2='+json.dumps({f['properties']['iso_a2']:f['properties']['adm0_a3'] for f in ne['features'] if f['properties'].get('iso_a2')},separators=(',',':'))+';\n')
(OUT/'provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n');print('Admin1',len(groups),'countries',sum(map(len,groups.values())),'regions')
