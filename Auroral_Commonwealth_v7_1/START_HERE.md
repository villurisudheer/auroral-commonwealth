# Auroral Commonwealth v7.1 — Chronicle Edition

## Play

Extract the entire archive. Open the Auroral_Commonwealth_v7_1 folder and run START_CHRONICLE_WINDOWS.bat, or run npm.cmd start there. Open http://127.0.0.1:8000. Node.js 18+ is required. No Python activation, API key or package installation is needed for gameplay.

This is the full game, not just a patch. Existing AI, Worldline, admin and earlier map modules are included.

## New in this edition

- Sixteen era choices: WWII (November 1942), WWI (July 1917), 1871, 1812, 1783, 1648, 1492, 1453, 1259, 1206, AD 750, AD 476, AD 220, AD 117, AD 14, and 2026.
- World and seven continent views with zoom/slide transitions, pointer and keyboard navigation, and reduced-motion support.
- Draw/save fictional custom countries and their territory, then play them in single player.
- Antarctica Penguin Kingdom is a disabled, Christmas-themed coming-soon announcement in 2026's Fictional category.
- Country-shaped national view with administrative drilldown. India, USA and Russia have an extra district/county/local-unit step before the town view. Local buildings/layouts are tracked separately; the economy and treasury remain national.
- Currency/era inflation and price profiles, with future technologies/resources restricted and source/calibration notes visible.
- Export 5 resource units; repay up to 50 billion per click.
- Worldline Intelligence Suite records and measurements shown in human language.

## Important interpretation

Ancient/medieval borders are incomplete source-year reconstructions; their subdivisions are explicitly generated gameplay sectors, not historical provinces. Green war-era state coding and red annual extents are not complete occupation/frontline maps. Modern district sources are dated: India 2021, USA 2018 and Russia 2017; newly changed units may be absent and unmatched units are withheld. Source dates, uncertainty, exclusions, attribution and licenses are included.

Currencies are period/modern conventions, while macro amounts are scaled local game-accounting units. Most historical inflation/price values are labelled calibrations, not measured historical statistics or live exchange rates. The original population/GDP templates remain synthetic. Read chronicle/README.md before presenting the project as historical research.

The baseline ML weights are included; scenario economics carry an explicit training-coverage warning and engine verification is available. Optional local LLM chat still needs separately installed Ollama/model weights; see intelligence/README.md. No live LLM was tested or trained from scratch for this release.

## Validation

71 extension regression groups plus original game checks, five server smoke scripts and an actual Chromium/Playwright workflow passed. Browser coverage includes custom drawing/save/start, national/state/county/city navigation, construction, minimap, resource/debt buttons, plain-language Suite, AI verification and compact/reduced-motion navigation. See chronicle/TEST_REPORT.md for limits.

Original source lines remain in sequence and earlier editions were not edited. New hooks/modules build on the existing game. Generated replay metadata and baseline ML outputs were refreshed for the extension fingerprint. Older game saves remain usable; older experiments can require recreation under the new fingerprint.

## Optional source patches

Chronicle_Only_Update.patch applies to the preceding AI Edition commit e2ca7f0. Complete_Update.patch applies to the original repository baseline fba3fea. Use the full included game if you do not use git patches. Keep a backup of your own project and saves before replacing local files.
