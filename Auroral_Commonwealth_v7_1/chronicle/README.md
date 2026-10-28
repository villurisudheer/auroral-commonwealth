# Auroral Commonwealth v7.1 — Chronicle Edition

This edition builds on the AI Edition. Original simulation lines and earlier maps remain in place. The default 2D entry view is now the nation you chose, with administrative drilldown into local cities.

## Start

Extract the whole archive. On Windows, run `START_CHRONICLE_WINDOWS.bat`, or run `npm.cmd start` from this game folder. Open http://127.0.0.1:8000. Node 18+ is required; no Python environment is needed for play. The loaded home screen and browser title identify Chronicle v7.1; the retained base engine/package identifies itself as 6.1 internally.

Offline ML, maps, custom-country drawing and cities run without an account or API key. Optional Ollama LLM setup remains documented in `intelligence/README.md`. No LLM weights are bundled.

## Era selector

“Peak” is an editorial scenario choice rather than an objectively unique day. The new-game selector has 16 eras:

| Choice | Start / map precision | Why this snapshot |
|---|---|---|
| 2026 | Membership scenario | Modern countries, non-members, disputed entities and fiction |
| WWII | 1 November 1942 | Near the height of German/Axis expansion; theatres did not all peak simultaneously |
| WWI | 1 July 1917 | After US entry, while Russia remained in the war |
| 1871 | Annual reconstruction | German unification and changing European state boundaries |
| 1812 | Annual reconstruction | Napoleonic dominance and the Russian campaign |
| 1783 | Existing annual layer | Revolutionary-era world |
| 1648 | Annual reconstruction | Westphalian settlement period |
| 1492 | Annual reconstruction | Granada and sustained transatlantic encounters |
| 1453 | Annual reconstruction | Ottoman conquest of Constantinople |
| 1259 | Annual reconstruction | Mongol expansion before the succession conflict; not maximum later khanate area |
| 1206 | Annual reconstruction | Genghis Khan and the Delhi Sultanate transition |
| AD 750 | Annual reconstruction | Abbasid revolution and Tang-era Eurasia |
| AD 476 | Annual reconstruction | Western Roman imperial transition and successor kingdoms |
| AD 220 | Annual reconstruction | Han-to-Three-Kingdoms transition |
| AD 117 | Annual reconstruction | Trajan's final year and expanded Roman frontiers |
| AD 14 | Annual reconstruction | End of Augustus's reign; Rome, Parthia, Xin China and other mapped polities |

The twelve additional earlier snapshots are 1871, 1812, 1648, 1492, 1453, 1259, 1206, 750, 476, 220, 117 and 14. WWI replaces 1919 in the new-game selector. WWII replaces the January 1942 choice. Earlier saved-game IDs and their original map files remain available for compatibility; existing saves are not backdated or silently moved to the new scenarios.

CShapes green state/dependency polygons are filtered to the chosen WWI/WWII date. CShapes omits many temporary wartime occupations, so those green polygons are not actual occupation fronts. The separate red Cliopatria layers show only three selected WWI or seven selected WWII annual territorial extents. They may include claims, home territory, dependencies or occupation, and do not necessarily describe the green layer's day. They are not a complete frontline reconstruction.

Ancient/medieval layers are incomplete source-year reconstructions. Known suspect existence windows/labels were withheld, but remaining overlaps, aggregates, boundary and dating errors are possible. Grey reference land means no historical polygon coverage, not unclaimed land. Annual layers starting the simulation in January do **not** claim that the polygons describe 1 January. In particular, transition years can cover more than one regime during a year.

Primary background for the two war choices:
https://encyclopedia.ushmm.org/content/en/article/german-wartime-expansion
https://www.army.mil/article/185229/world_war_i_building_the_american_military
Other era selection references are recorded in `data/eras.json`.

## Continents and map interaction

Both the country picker and Chronicle Atlas offer World, Africa, Europe, Asia, North America, South America, Oceania and Antarctica closeups. These are regional camera windows, not a claim that every political unit belongs exclusively to one continent. Oceania supports the Pacific seam.

Switching views animates camera zoom and a short slide/fade. Drag to pan, double-click or use +/− to zoom, and use arrow keys to pan. Keyboard Enter selects a focused feature. Animation is suppressed when device reduced motion is enabled; the in-game animations setting is respected in the active atlas. The camera is an equirectangular schematic, not an equal-area or navigational projection.

Green state borders and red annual wartime extents have separate visibility controls. Hover/selection displays a readable territorial label and source note.

## Draw a custom country

In single player, open the picker or Chronicle Atlas → **Custom country**. Give it a name, colour, starting population and treasury. Click **Start drawing**, add 3–40 map vertices, then **Save country & choose difficulty**. The picker proceeds to the normal difficulty/start flow; creating from the active atlas stores the country for selection in a new game.

While drawing, arrows move the map and Enter adds the centre point. Undo, clear and pause/resume drawing are available. Crossing/self-touching edges, repeated adjacent points, line-only areas and malformed inputs are rejected. Dateline-adjacent polygons are supported without inventing legal sovereignty.

Custom countries are fictional overlays; they do not erase sourced borders or change real diplomatic recognition. Up to 24 are stored in this browser. Their geometry is also embedded in game saves so it can be restored when the local custom list is absent. The tool reports browser-storage failure. Custom country creation/selection is single-player only; it does not bypass the multiplayer roster.

Antarctica appears only in the 2026 Fictional category as a disabled **Penguin Kingdom — Coming Soon** announcement. Its planned Christmas theme and penguin monarchy are not implemented gameplay, and it is not added to the UN list.

## Country, province and district view

New games open on the chosen country's source outline.

- Most modern countries: country → state/province/emirate/etc. → local city.
- India, USA and Russia: country → state/federal subject → district/county/local equivalent → local city.
- Historic scenarios and custom shapes without sourced subdivisions: explicitly fictional gameplay sectors, clipped to the chosen source outline. For historically corresponding India/USA/Russia scenarios, generated second-level gameplay areas provide the extra drilldown. These are not asserted to be historical provinces or counties.

The modern first-level reference covers 251 source country/territory codes and 4,587 regions; not all source territories are independent playable countries. Russia's unqualified regional drilldown withholds disputed Ukraine/Russia assignments. Source-year second-level files link 733 Indian districts, 3,121 US counties/equivalents and 2,318 Russian local units to source first-level regions. Respectively 2, 112 and 9 records lacked one unambiguous spatial parent and are withheld from state drilldown. Territories outside the included first-level state list can be among those unmatched records.

These are **not certified 2026 administrative registers**: district sources represent India 2021, USA 2018 and Russia 2017. Newly created districts, reorganizations and renamed units may be missing. Parent links use an interior-point spatial join, not invented nearest-neighbour assignment. See `nation/data/provenance.json` for counts, dates, exclusions and attribution.

Local cities track their own building ownership and layouts. The first entered local city receives the nation's starting buildings as its capital allocation; later areas start empty. A new purchase adds one building to that area and to the national total. This does not duplicate buildings in every town. Treasury, population, industry, energy and other economic aggregates remain national; this edition does not simulate independent provincial budgets or local population statistics.

The city view adds a clickable minimap, panning controls, next-owned-district navigation, empty-plot finder and a country-map breadcrumb. Multiplayer can browse geography, but local district construction is single-player only; existing multiplayer construction remains national.

## Economy, currency and prices

New campaigns receive an economy profile once. Existing saved campaigns retain their previous values.

- Modern currency codes/names use the SIX ISO 4217 list published 17 September 2026, with explicit mixed/non-ISO conventions for some disputed places. Bulgaria uses EUR. Palestine is labelled as mixed circulation rather than assigned a fictional sovereign currency.
- Historical major-polity rules select period denominations such as Roman denarius/solidus, Chinese cash/silver accounts, pound sterling, French livre/franc, German mark/Reichsmark, rupee and Ottoman akçe/kuruş/lira. A polity without an individually verified denomination explicitly falls back to **local coin/commodity accounting unit**. This is not a complete monetary-history database.
- Inflation starts vary by era/country calibration. UK WWI and WWII starts use the annual 1917 and 1942 historical price-change references (25.2% and 7.5%) from House of Commons RP02/44, table 1. Those are annual references, not observations specific to the selected start month. Other historical rates are labelled gameplay calibrations. Ancient CPI is not fabricated as measured data. Wartime official series do not cover all black-market transactions.
- A persisted price index compounds monthly from simulated inflation. It affects market resource prices and quoted new construction/project/action costs. Cost checks debit the actual quoted cost and reject unaffordable/future actions without manufacturing funds. Existing research instalments and event/contract fixed fees retain their original nominal schedules rather than being presented as reconstructed historical prices.
- Unsupported future infrastructure, industrial resource markets and the original future-tech research list are unavailable in earlier eras. Ancient city labels use academies/healing districts and modern car decorations are hidden before 1900. This is still an abstract strategy engine, not a complete ancient institutional, technological or military simulation.

All macro monetary values remain **billions of scaled local game-accounting units**. Historical population/GDP templates and nominal scales are synthetic. Relabelling those game accounts is not a claim of authentic local-currency GDP, commodity quotations, historical purchasing power or live foreign-exchange conversion. Modern starting inflation values remain inherited game reference values, not a live October-2026 statistical feed. The UI exposes the basis and scale in its economy note.

Sources:
https://www.six-group.com/en/products-services/financial-information/market-reference-data/data-standards.html
https://researchbriefings.files.parliament.uk/documents/RP02-44/RP02-44.pdf
Currency list source hash and historical denomination/fallback scope are documented in the source modules.

**Export resources** now sells **5 units** per click; **Repay debt** repays up to **50 billion** per click. The server rejects unsupported export/repayment quantities. Imports remain at 20 units. Repayment still caps at available funds and outstanding debt.

## Worldline Suite in human language

Archives and Observatory now show readable measurements and sentences such as “Inflation rose from 4% to 6%.” Technical function names are translated into phrases such as “Monthly economy update.” Country/era source notes remain visible. Raw JSON is hidden in the default interface; machine-readable exports remain intact.

The price/inflation extension runs inside the isolated Worldline rule boundary as well as the live game/server. A deterministic regression verifies identical live and isolated monthly states. Replay identity includes the economy extension. Earlier saved games remain usable; older **experiments** may have a different engine fingerprint and require recreation for replay. Existing archive records are retained.

The bundled ML model was reproduced for the updated engine identity but still learns the original baseline economics. It explicitly warns that new scenario economics were outside its training coverage. Use engine verification; do not interpret its ranking as historically validated policy advice. No new LLM was trained and no live LLM reply was tested in this build.

## Sources, licenses and rebuilding

Historical geometry: Cliopatria 0.2.1 (CC BY 4.0) and CShapes 2.0, Schvitz et al. (2022) (CC BY-NC-SA 4.0). Modern outlines/first-level regions: Natural Earth, public domain. Second-level regions: geoBoundaries gbOpen, with original source/license attribution in `nation/data/licenses/ATTRIBUTION.md`. Adapted India/Russia second-level data is supplied under ODbL 1.0; the license copy is included. US second-level source is Census public-domain data. Unrelated original game-code licenses are unchanged.

- `python atlas/download_sources.py <source-folder>` obtains original historical/modern inputs.
- `python chronicle/build_data.py <source-folder>` creates the new layers using the original atlas simplification definitions without executing its old builder or rewriting earlier maps.
- `python nation/download_sources.py <admin-source-folder>` restores checked administrative inputs; pinned geoBoundaries URLs and SHA-256 checks prevent silently accepting changed data.
- `python nation/build_data.py <admin-source-folder>` rebuilds administrative layers and spatial parent links.
- `node worldline/build.mjs` updates isolated-engine fingerprints.
- `node intelligence/train.mjs` reproduces baseline ML weights/report for that engine identity; it does not train on saves or chats.
- `npm.cmd run validate`, `node chronicle/server-test.mjs`, and the earlier smoke tests exercise the release.
- `node chronicle/browser-test.mjs` runs optional browser checks if Playwright is installed. AC_BROWSER_EXECUTABLE can select an installed Chromium executable; PLAYWRIGHT_MODULE can select an external Playwright module. Neither is a production dependency.

See `TEST_REPORT.md` for executed results and practical limits.
