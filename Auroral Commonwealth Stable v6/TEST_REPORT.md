# AURORAL COMMONWEALTH Stable v6 — Test Report

## Build validation

PASS — `npm run validate` completed successfully.

PASS — 202 selectable roster entries loaded.

PASS — 202 unique country IDs detected.

PASS — Required requested entries present: Micronesia, Transnistria, The Republic of Samratpur, நாய் Country, Federation of Hyperpixel, USSR, WWII Peak Germany, and Ottoman Empire.

PASS — Every `.js` and `.mjs` file passed Node syntax parsing.

PASS — Every roster entry has valid required numeric values, map coordinates and resource structures.

PASS — Every one of the 202 entries completed a 12-month normal-difficulty simulation.

PASS — No tested GDP, treasury, debt, inflation, unemployment, population, approval, stability, technology, or infrastructure value became `NaN` or `Infinity`.

## Deployment checks

PASS — Server started successfully on an alternate local port.

PASS — `/` returned the Stable v6 HTML document.

PASS — `/main.js` returned the Stable v6 client build.

PASS — `/health` returned HTTP 200 with version `6.0.1`, country count `202`, max players `20`, and `ok: true`.

PASS — Dockerfile now runs `npm run validate` before producing the deployable image.

## Blank-screen protection

PASS — `index.html` contains a visible boot screen before the main module loads.

PASS — `bootstrap.js` dynamically imports the game and catches startup/module failures.

PASS — Runtime and unhandled-promise failures surface a recovery panel rather than silently leaving the page blank.

## Multiplayer hardening

PASS — Maximum human players remains 20.

PASS — WebSocket hello metadata reports v6 build information.

PASS — Oversized WebSocket messages are rejected.

## Notes

The historical WWII Germany entry uses a neutral historical scenario presentation and does not include extremist symbols.

## v6.0.1 hotfix

PASS — Theme startup order fixed so `systemDark` is initialized before `applyPrefs()` can resolve System appearance.
