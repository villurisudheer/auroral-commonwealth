# Auroral Political Atlas 1.0

An additive political-boundary viewer and era-aware country picker for the existing game. The animated Command Deck, admin console and Worldline Suite remain available. No trained ML functionality is added.

## Open and play

Run `npm start` (Windows PowerShell: `npm.cmd start`) inside the Stable v6 folder. Open `http://localhost:8000`.

- New Game now offers **2026 / 1942 / 1919 / 1783** tabs, category filters, search and a clickable boundary preview.
- In-game, choose **Political Atlas** in the sidebar. Select an era, inspect outlined territories, pan the world map and zoom. Territory details explain the source and status.
- The old schematic Diplomacy map is replaced in the rendered view by an entry to the sourced atlas. Same-era nation inspection retains existing diplomatic actions; cross-era inspection is read-only.
- State/dependency outlines are green. In 1942, a separately toggleable red dashed layer shows selected provisional wartime territorial extents. Red is not a claim that all displayed territory was occupied enemy land.
- Grey land under historical reconstructions is a modern physical-reference basemap indicating gaps in historical coverage. It does not mean unclaimed territory. Small-state dots aid selection without replacing source polygons.
- Source maps are bundled locally. Normal gameplay does not call a mapping API, pay for tiles or download data from external services.

## Rosters

| Era | Selectable records | Basis |
|---|---:|---|
| 2026 | 208 | 193 UN members, 2 observer states, 2 associated non-member states, 8 disputed entities, 3 existing fictional nations |
| 1942 | 175 | 169 CShapes state/dependency records valid at 1942-01-01, plus 6 distinct wartime polity scenarios |
| 1919 | 159 | CShapes state/dependency records valid at 1919-01-01 |
| 1783 | 125 | Cliopatria source-year polities/dependencies after duplicate aggregates and known unresolved labels are withheld |

The 2026 menu uses the user's four labels: **UN Recognized**, **Non-UN Recognized**, **Disputed**, **Fictional**. These are organizational labels, not a legal finding. The UN explains that diplomatic recognition is granted by states, not by the UN itself. Here, “UN Recognized” groups members and the two observer states, and “Non-UN Recognized” groups the Cook Islands and Niue as non-member associated states. Disputed entities are a separate membership/status category, not endorsements of a sovereignty claim.

All 195 original modern-country IDs and the original fictional/de-facto IDs remain compatible. The three older broad historical scenarios also remain in the registry for old saves, but are excluded from the dated era pickers. There are **667 era choices** and **670 compatible registry templates** in total.

For newly added countries and historical scenarios, economic/population/technology parameters are **synthetic gameplay templates**, not historical statistics. Capital coordinates, where supplied by CShapes, are source metadata and have not all been independently date-verified. Cliopatria-derived representative coordinates are not asserted to be historical capitals. Historical scenarios still use the existing economic model; this release does not recreate eighteenth-century economic institutions.

New games start in their chosen era and the first historical state summary uses that year. Existing loaded save dates are preserved. Multiplayer rooms reject mixed-era country claims, initialize the chosen era's calendar before broadcasting, and reject cross-era diplomatic actions. Existing server authority and the 20-player cap remain intact.

## Accuracy: what is and is not established

This is a source-derived atlas, **not a fully verified reconstruction of every frontier or every historical polity**.

- **2026:** the modern member/observer roster is complete. Boundaries use Natural Earth's maintained 1:50m cartographic baseline and disputed-area themes. It is not a live military-control survey for 28 October 2026 and must not be represented as one.
- **1919 / 1942 green:** records are filtered using CShapes start/end dates. CShapes codes de-jure changes and explicitly excludes many temporary wartime changes, small changes and some unrecognized entities. Some source dates and boundaries are approximate/backdated. The January 1 labels describe source validity, not a claim that all international boundaries were settled on those days.
- **1942 red:** seven selected Cliopatria source-year extents are shown: Nazi Germany, Empire of Japan, Kingdom of Italy, Vichy France, Free French, Independent State of Croatia and Communist Party of China. These can combine home territory, dependencies, claims and occupation. They do **not** form an exhaustive or exact daily military-control layer and are not guaranteed to match the January 1 green layer. Broad Soviet/British/Chinese state polygons were not automatically relabelled as military control.
- **1783:** Cliopatria has uneven resolution, overlapping structures, gaps and some questionable labels. Parenthetical aggregate records are not counted again as independent countries. Known anachronistic/unresolved source records (New France, New Netherland, County of Urgell, Sultanate of Malacca and Khmer Empire for this year) are withheld from the roster. The Napoleonic Naples label is displayed as Kingdoms of Naples and Sicily; Swedish Empire as Sweden; Duchy of Bavaria as Electorate of Bavaria. Withheld records are listed in the map's JSON metadata. This is not an exhaustive inventory of every Holy Roman Empire state or Indigenous polity.
- Boundaries are simplified for world-scale rendering at 0.018-degree tolerance, with small/dateline-crossing rings preserved and coordinates rounded to five decimal places. This is unsuitable for cadastral, border-survey or legal purposes.
- The viewer presents starting-era snapshots. It does not update historical frontiers month by month as the sandbox clock advances.

These limitations are displayed in the picker and atlas. A fuller verified 1783 roster and a day-specific worldwide occupation layer remain research work; no missing boundaries are invented to disguise this.

## Sources and licenses

### Modern boundaries

Natural Earth, Tom Patterson, Nathaniel Vaughn Kelso and contributors. Admin-0 Countries 1:50m and Breakaway/Disputed Areas 1:50m. Public domain.

- https://www.naturalearthdata.com/downloads/50m-cultural-vectors/
- https://www.naturalearthdata.com/about/terms-of-use/
- https://github.com/nvkelso/natural-earth-vector/tree/master/geojson

### State/dependency historical geometry

Schvitz, Guy, Seraina Rüegger, Luc Girardin, Lars-Erik Cederman, Nils Weidmann and Kristian Skrede Gleditsch. 2022. “Mapping The International System, 1886–2017: The CShapes 2.0 Dataset.” Journal of Conflict Resolution 66(1): 144–61. **CC BY-NC-SA 4.0**. The noncommercial/share-alike conditions apply to the supplied CShapes-derived data.

- https://icr.ethz.ch/data/cshapes/
- https://icr.ethz.ch/data/cshapes/CShapes-2.0_Codebook.pdf
- https://creativecommons.org/licenses/by-nc-sa/4.0/

### 1783 and selected 1942 territorial reconstructions

Cliopatria 0.2.1, Seshat Global History Databank and contributors. **CC BY 4.0**. Geometry filtered by FromYear/ToYear, duplicate relation-like aggregates excluded and selected display labels corrected/withheld as described above.

- https://github.com/Seshat-Global-History-Databank/cliopatria
- https://github.com/Seshat-Global-History-Databank/cliopatria/blob/main/LICENSE.md
- https://doi.org/10.1038/s41597-025-04516-9
- https://creativecommons.org/licenses/by/4.0/

### Membership terminology

- https://www.un.org/en/about-us/about-un-membership
- https://research.un.org/en/unmembers/observers
- https://history.state.gov/countries/cook-islands
- https://history.state.gov/countries/niue

`data/provenance.json` records exact source URLs, input SHA-256 values, transformation method and coverage limits. All boundary data is external-source geometry; no image generator was used to fabricate national borders.

## Rebuild data (optional development task)

Normal launch uses checked-in files and requires no build or new runtime dependency. To acquire and rebuild research inputs using Python's standard library and Node:

```sh
python atlas/download_sources.py /path/to/atlas-source
python atlas/build_data.py /path/to/atlas-source
```

The inputs include a roughly 46 MB Cliopatria ZIP and 26 MB CShapes GeoJSON. The Cliopatria archive expands to roughly 173 MB. Dataset changes can alter output records, so review geometry, source labels, tests and attribution after rebuilding. The generator never writes pre-existing game source.

## Tests and browser limits

```sh
npm run validate
node worldline/smoke.mjs
node command/smoke.mjs
node atlas/server-test.mjs
```

See `TEST_REPORT.md`. Native SVG map artwork was rasterized and visually reviewed. Full browser pointer/keyboard interaction, responsive layouts and end-to-end picker flows remain unverified in this environment.

The Chronicle v7.1 edition adds a separate sixteen-era selector and new layers under `chronicle/`. This document describes the preserved original four map files, which remain for saved-game compatibility. See `../chronicle/README.md` for the active selector, war dates, continent cameras and historical coverage limits.
