# Political Atlas 1.0 — test record

Date: 28 October 2026. Runtime: Node 24.22.1. Base: Command Deck commit `c2b2721`.

## Executed checks

| Command/check | Observed result |
|---|---|
| `python atlas/build_data.py /workspace/scratch/097abd4f158c/atlas-source` | PASS: four source-derived, valid GeoJSON FeatureCollections and shared catalog generated. |
| `npm run validate` | PASS: original game checks, 23 Worldline groups, 10 Command Deck groups and 11 new Political Atlas groups. |
| `node worldline/smoke.mjs` | PASS: 52 JS/application assets plus extension CSS delivered, health roster matches expanded registry, 20-player capacity and authority protections retained. |
| `node command/smoke.mjs` | PASS: actual admin assets, login/status protections, framing policy and original health endpoint. |
| `node atlas/server-test.mjs` | PASS: four offline maps, expanded roster, 1942 multiplayer calendar and initial history, mixed-era claim rejection, cross-era diplomatic rejection. |
| `git diff --check` | PASS. |
| Original repository preservation audit against `fba3fea` | PASS: no original source line removed/replaced; historical edition directories untouched. |
| Byte-for-byte rebuild from the same raw research inputs | PASS: every shipped data asset reproduced exactly. |

Two extension smoke-test lines expecting exactly 202 total entries became invalid after adding era choices. They now compare with the exact expanded shared registry count (670). The new preservation test independently verifies that every original one of the 202 IDs remains present, so this change does not weaken legacy coverage.

## Atlas regression groups

1. Original IDs preserved; unique expanded registry and catalog IDs; every selectable record resolves.
2. Exactly 193 UN members and 2 observer states; all four modern categories; non-member/disputed entries separate.
3. Era/category/search isolation, with no modern or fictional records leaking into historical pickers.
4. Valid GeoJSON containers/features, finite world coordinates, consistent property/root country references and valid roster links.
5. Every 1919/1942 green state feature covers January 1 in its source-coded validity interval.
6. Independent green state and red provisional wartime layers; toggles remove only their own outlines; no null-ID mass selection; broad Soviet state geometry is not falsely treated as military control.
7. Known anachronistic 1783 source labels withheld; source uncertainty retained explicitly.
8. Fictional nations do not receive fabricated real-world polygons.
9. Era calendars/initial history initialize correctly; subsequent state dates and existing loaded-save data are preserved.
10. All 667 selectable era templates execute the actual monthly engine with finite economic values.
11. Dateline-crossing polygon rings unwrap locally rather than stretching across the world.

## Visual and historical review limits

The four native SVG maps were rasterized and visually inspected during development. This exposed and corrected a null-selection highlight bug and motivated neutral-grey modern reference land beneath historical coverage gaps. Full browser layout, hover/focus behavior, pointer/keyboard operation and end-to-end picker flows remain unverified in this environment.

The tests establish data validity, source-date filtering, reproducibility and software behavior. They **do not certify historical accuracy**. In particular, the 1783 reconstruction/roster is incomplete and the red 1942 layer consists of selected annual-resolution territorial extents, not a verified worldwide daily occupation map. CShapes excludes many wartime, small or undefined changes. The maintained Natural Earth baseline is not a real-time 2026 front-line survey. These limitations are shown in the interface and README.

No trained ML model or training pipeline was added.
