"""Restore the pinned/hashed inputs used by nation/build_data.py. No app startup network calls.
python nation/download_sources.py /absolute/path/to/admin-source
"""
import concurrent.futures,hashlib,json,pathlib,sys,urllib.request
HERE=pathlib.Path(__file__).parent;OUT=pathlib.Path(sys.argv[1]);OUT.mkdir(parents=True,exist_ok=True)
provenance=json.loads((HERE/'data/provenance.json').read_text())
items=[('natural-earth-admin1.geojson','https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson',provenance['admin1']['sha256'])]
for iso,record in provenance['admin2'].items():
 suffix=record['source'].split('/raw/')[1];items.append((iso+'-ADM2.geojson','https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/'+suffix,record['sha256']))
 metadata={'boundaryYearRepresented':record['sourceYear'],'boundarySource':record['boundarySource'],'boundaryLicense':record['license'],'licenseSource':record.get('licenseSource'),'simplifiedGeometryGeoJSON':record['source']};(OUT/(iso+'-ADM2-meta.json')).write_text(json.dumps(metadata))
def get(item):
 name,url,expected=item;path=OUT/name
 if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest()!=expected:urllib.request.urlretrieve(url,path)
 if hashlib.sha256(path.read_bytes()).hexdigest()!=expected:raise RuntimeError('Source changed: '+name+'. Review the source revision before rebuilding.')
 print(name,path.stat().st_size)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(get,items))
