# Chronicle v7.1 — executed release checks

Tested on 28 October 2026 with Node 24.22.1 and Chrome for Testing 151.0.7922.34. Production runtime target is Node 18+. Playwright/Chromium were test-only tools; no production dependencies or browser binaries are included.

## Passed

- Full `npm run validate`: original game validation plus 23 Worldline, 10 Command Deck, 11 original Atlas, 11 Intelligence and 16 Chronicle/National View regression groups — **71 extension groups**.
- Era tests: sixteen choices, twelve additions, WWI/WWII names and dates, era-specific lists, geometry validity, reference IDs, source validity intervals and preserved earlier country IDs/saves.
- Territory tests: eight regional cameras, projection round trips, bounded custom records, persistent fictional overlays, self-intersection/duplicate-point/invalid-colour/markup rejection, and a non-playable modern-only Penguin Kingdom announcement.
- Administrative tests: global first-level reference, India/USA/Russia district parent links, explicit unmatched records, disputed Russian assignments withheld, and labelled generated historical sectors.
- Local-city tests: distinct district ownership, national total consistency and exact treasury cost. Starting buildings are assigned once to the first entered city; they are not duplicated across towns.
- Economy tests: modern/historical currency conventions, sourced UK wartime inflation references, future-technology gating, price-adjusted purchases, no funds created on failed actions and exact export/repayment quantities.
- A seeded six-month regression compared the **complete live and isolated-engine states**, including scenario inflation and the price index; the states matched exactly. Replay identity includes the economy source/configuration.
- Human-language tests: readable before/after sentences, early-AD dates and escaped user content.
- `node worldline/smoke.mjs`: shipped server, 71 modules/assets, 20-player cap, rejection of player 21 and invalid economy actions.
- `node command/smoke.mjs`: authenticated administration, delivery/framing headers and existing health route.
- `node atlas/server-test.mjs`: preserved legacy maps/calendars and era isolation.
- `node intelligence/server-test.mjs`: bounded/whitelisted local LLM protocol, fixture responses, timeouts, concurrency/rate/origin/Host protection, offline assets and disabled-provider behaviour.
- `node chronicle/server-test.mjs`: all sixteen era maps and six deep-administration files, actual November 1942 start with GBP/UK reference inflation, rejection of same-year but different-scenario claims, exact five-unit exports and fifty-billion repayments, rejection of invalid quantities.
- Actual browser test: loaded v7.1 menu, all sixteen choices, animated World/Africa transitions, reduced-motion Europe transition, custom polygon creation/persistence and campaign start, USA → Texas → county → city navigation, successful construction, minimap, resource/debt controls, plain-language Archives and Observatory, explicit ML coverage warning, isolated AI policy verification and compact-screen navigation. No browser page errors were recorded.
- Visual inspection of national and local-city screens at desktop size; compact navigation exercised at 390 × 844. Internal review screenshots were not packaged as deliverables.
- `git diff --check` and an original-line preservation audit against the initial repository baseline: every original source line remains in sequence; other editions were not edited. Existing extension smoke expectations were updated to the expanded registry. Generated replay metadata and ML outputs were regenerated for the new fingerprint.

## Practical limits

This validation proves the exercised application paths, not historical completeness. Ancient/medieval maps remain uncertain source-year reconstructions; their subdivisions are fictional gameplay sectors. Modern administrative references are not certified 2026 registers: district vintages are India 2021, USA 2018 and Russia 2017, and some units remain unmatched. Historical monetary values are scaled game calibrations; only specifically cited inflation references are historical observations. Modern inflation is not a live feed and local currency labels are not an FX conversion of real national accounts.

The bundled forest remains trained on the original baseline economics and warns that the scenario economy is outside its training domain. Verification uses the updated engine, but one seeded scenario is not a guarantee. No live LLM weights/inference or language-quality evaluation was run; its HTTP adapter used a protocol fixture. Windows launchers were inspected, not executed on Windows. Broad cross-browser/mobile-device coverage and a complete historically faithful technological, military, monetary or provincial-economy simulation are outside this release's evidence.
