"""Download the four upstream research inputs; does not run on normal game launch."""
import pathlib,urllib.request,sys,subprocess,json,concurrent.futures
folder=pathlib.Path(sys.argv[1]).resolve();folder.mkdir(parents=True,exist_ok=True)
urls={'modern.geojson':'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson','disputed.geojson':'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_breakaway_disputed_areas.geojson','cshapes.geojson':'https://icr.ethz.ch/data/cshapes/CShapes-2.0.geojson','cliopatria.zip':'https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/main/cliopatria.geojson.zip'}
def download(item):
 name,url=item
 with urllib.request.urlopen(url,timeout=120) as source,(folder/name).open('wb') as target:
  import shutil;shutil.copyfileobj(source,target)
 print(name,(folder/name).stat().st_size,'bytes')
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(download,urls.items()))
source=(pathlib.Path(__file__).resolve().parent.parent/'data/countries.js').as_uri()
script='import {COUNTRIES} from '+json.dumps(source)+';console.log(JSON.stringify(COUNTRIES))'
legacy=subprocess.check_output(['node','--input-type=module','-e',script],text=True)
(folder/'legacy-roster.json').write_text(legacy)
print('Research source inputs ready. Run atlas/build_data.py with this directory.')
