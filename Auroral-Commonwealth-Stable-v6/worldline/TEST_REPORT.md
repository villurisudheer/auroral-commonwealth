# Worldline Intelligence Suite 1.0 — validation record

Tested 27 October 2026 against base commit `fba3feaaa175a27c535420e44467108381a8b12c` with Node **24.22.1**. Node 18+ is the target; a separate Node 18 execution was not available. No new package dependencies were installed in the game.

## Executed checks

| Command/check | Observed result |
|---|---|
| `node worldline/build.mjs` | PASS: 16 engine/data modules generated from the existing source; original source files were not written by the generator. |
| `npm run validate` | PASS: original v6.1 checks and 23 new extension regression groups. |
| JS/MJS syntax checks | PASS: the original validator walks every JS/MJS file, including all new and generated files. |
| `node worldline/smoke.mjs` | PASS: server startup, health endpoint, 45 application/module assets plus extension CSS, WebSocket room/capacity and authoritative actions. |
| `git diff --check` | PASS after removing a trailing space introduced on an added guard line. |
| Original-line preservation audit (`git diff --numstat`) | PASS: no original line deleted or replaced; all changes limited to Stable v6. Historical editions unchanged. |

The original validator confirms 202 unique country/scenario IDs, all-country 12-month finite-value runs, policy mappings/clamps, invalid financial/resource actions, zero-stock behavior, chart bounds, malformed-save repair and rendering of the existing view markup.

## New regression groups

1. Seeded source replay without replacing global randomness.
2. Complete experiment isolation from source state and existing save data.
3. Identical-action branches and whole-experiment replay produce identical complete results.
4. Validated policy changes alter calculated engine outcomes.
5. Scheduled policy timing and effective clamped values.
6. Trace inputs/before/after/deltas and event references match actual execution.
7. Genuine changed decisions and rejected actions recorded; unchanged decisions not duplicated.
8. Observer errors cannot replay or prevent engine execution.
9. Seeded randomness in event-choice effects.
10. Finite metrics and bounded ledgers at 3/6/12/24 months.
11. All 202 countries execute the isolated monthly sequence.
12. JSON experiment roundtrip preserves replay.
13. Archive JSON/CSV and grounded deterministic report behavior.
14. Fresh storage adapter reload retains experiment inputs, results and ledger.
15. Malformed imports, future versions, unsafe object keys and multiplayer source states rejected.
16. Invalid schedules, unsupported actions and prototype keys rejected.
17. Corrupt storage/quota failures remain graceful.
18. Zero/missing-baseline metric comparisons remain safe.
19. Cancellation leaves source state unchanged.
20. Generated adapters are fresh and simulation random calls are audited.
21. Four-branch, 24-month results fit the import/file validation bound; imported caches are discarded.
22. Retention trims computed caches while keeping replay inputs.
23. Monthly sequence matches the actual active game; overlay/engine fingerprints are fresh.

## HTTP/WebSocket checks

The smoke script starts the actual server on a temporary port and terminates its own server/client processes afterward. It checks the actual module graph over HTTP and verifies `/health` reports 202 countries and a 20-player cap. Twenty human clients join one room and client 21 receives the full-room rejection. A started room accepts an authoritative valid tax update and rejects a negative loan and an unknown policy key.

The first plain server startup reproduced an existing `uv_interface_addresses` failure inside `os.networkInterfaces()` in this environment. The two added try/catch guard lines were then tested successfully through the actual smoke script. Health, room authority and capacity logic remain unchanged.

## Unverified / limitations

Real browser rendering and end-to-end clicks are **not verified**. A local Chromium install failed because its browser download was empty/truncated; the connected browser could not attach to this originating context, and the cloud browser reached its own localhost service rather than this workspace server. No screenshot or visual QA claim is made. HTTP asset delivery and view-markup validation do not prove visual layout or interactive browser correctness.

UI source was reviewed for modal focus/keyboard handling, escaped imported text, meaningful empty/error states, live progress and theme-variable reuse. Full browser tests for navigation, file pickers, refreshes, responsive layout, light/high-contrast mode and export downloads remain necessary before merging this draft release.

Function-level tracing is complete only within isolated Worldlines; live play records whole monthly transitions and supported UI actions. Multiplayer archival instrumentation, quantified per-term causal attribution and reconstructed historical states are deferred and disclosed in the interface/documentation.
