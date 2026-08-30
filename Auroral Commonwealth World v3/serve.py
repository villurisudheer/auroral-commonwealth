from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, webbrowser

ROOT = Path(__file__).resolve().parent
HOST, PORT = '127.0.0.1', 8000
os.chdir(ROOT)
print(f'AURORAL COMMONWEALTH running at http://{HOST}:{PORT}')
print('Press Ctrl+C to stop the server.')
try:
    webbrowser.open(f'http://{HOST}:{PORT}')
except Exception:
    pass
ThreadingHTTPServer((HOST, PORT), SimpleHTTPRequestHandler).serve_forever()
