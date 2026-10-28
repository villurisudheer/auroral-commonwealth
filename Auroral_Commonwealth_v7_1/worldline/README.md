# Auroral Worldline Intelligence Suite 1.0

An additive extension inside **Auroral Commonwealth Stable v6.1**. Open the normal game; the main menu and game sidebar provide the new modules. No separate application or launcher is used.

## Launch and demonstration

Requires Node 18 or newer. From `Auroral Commonwealth Stable v6/`:

```sh
npm start
```

Open `http://localhost:8000`. Generated engine adapters are committed, so normal launch requires no build step and no new dependencies.

1. Start or load a single-player game. Open Government and change a tax or budget slider. Build or research using the existing screens, then advance the clock.
2. Pause and open **Auroral Archives** in the sidebar. Filter the recorded decisions/monthly outcomes, expand an entry and inspect its supporting trace.
3. Open **Systems Observatory**. Choose a changed variable, inspect its before/after values and observed inputs, or select an exact retained snapshot. The crisis button opens the corresponding historical records in reverse order.
4. Open **Worldline Lab**. Choose the current nation, an existing single-player save or a recorded snapshot. Give the experiment a name, seed and a 3/6/12/24-month horizon.
5. Configure one to three named alternatives using taxes, budget shares, infrastructure, industry investment, research or trade agreements. Month 0 applies before the first simulated month. Actions run through the original validated handlers. Policy clamping is reported as an effective value.
6. Run. Compare the baseline with alternatives through real time-series charts, accessible data tables and absolute/relative deltas. Open a branch's Archives or Observatory from the results.
7. Completed experiments and calculated results use separate browser storage. Load & replay reruns the saved inputs. Import/export uses JSON; archive export also offers CSV and eight deterministic dossier styles in printable HTML. Imported archives are explicitly user-supplied evidence. Imported experiment caches are discarded and recomputed.

Opening the suite pauses single-player play; closing it leaves play paused until the player resumes. The native modal prevents background interaction and stops game keyboard shortcuts while its controls have focus.

## Original-code preservation

The existing source lines remain intact. Integration is appended to `main.js`; existing validator checks remain intact and the new tests are appended to `validate.mjs`. `server.mjs` receives two added guard lines around its original LAN enumeration after an actual `os.networkInterfaces()` startup failure was reproduced in this managed environment. No original line is deleted or replaced, and historical edition directories are untouched.

The country roster, existing UI views, multiplayer protocol, save slots, budget/financial safeguards and ordinary live-game formulas retain their original implementations. The current source has no explicit RBA/RBS simulation subsystem to extend; this suite does not invent or merge one.

## Architecture

- `core.js`: weakly associated RNG/observer contexts outside game state, normalized event/trace IDs, cloning, metrics, diagnostics and grounded document templates.
- `engine.js`: isolated branch execution, validated scheduling, engine-version checks and explicit event-choice policy. The monthly order is regression-checked against `main.js`.
- `build.mjs`: reads the actual engine source; generates adapters under `generated/`, redirecting simulation `Math.random()` calls to a per-state random source and wrapping executed functions for observation. Formulas are not reimplemented. Global randomness is never replaced. Originals are never written by this generator.
- `generated/`: checked-in adapters, source hashes and engine identity. Changing the original engine requires regenerating these adapters. Source and overlay fingerprints prevent replay under a different simulator.
- `storage.js`: independent versioned JSON storage, validation, bounded retention, archive import/export and CSV.
- `ui.js` / `style.css`: navigation and modal workstation using the existing charts, CSS theme variables and validated game handlers. No framework or paid API.
- `validate.mjs` / `smoke.mjs`: deterministic and integrity regressions plus HTTP/WebSocket checks.

Live monthly steps and UI decisions are observed around their actual execution. Simulated branches additionally record individual function boundaries. These boundaries prove the recorded transition was executed; they do not quantify the isolated contribution of each input.

When the base engine changes:

```sh
node worldline/build.mjs
npm run validate
node worldline/smoke.mjs
```

The generator changes only extension-owned files. Check in regenerated adapters with the updated source. The validator rejects stale adapters and drift in monthly execution order.

## Randomness audit

Adapted simulation calls: economy (growth shock, unemployment), resource prices, trade exports/imports, industry levels, diplomatic negotiations, event selection and the trade-event negotiation choice in `data/events.js`. Country-creator endowments and save-ID fallbacks retain ordinary randomness; they are initialization/identifier code outside branch advancement. Experiments clone already-created initial endowments.

## Explicit modelling limits

- Baseline is a controlled continuation under the same event strategy as alternatives, not a prediction of a player's unrecorded future decisions. The cheapest affordable event option is resolved before the next monthly step; original option order breaks ties. New final-month events remain pending.
- Identical inputs, seed and engine fingerprint replay identically. A random-consuming action can shift subsequent draws; identical exogenous shock alignment across different action histories is not guaranteed.
- Experiments reuse all existing monthly systems, including research, achievements, resources and national condition. They do not simulate additional human players or invent autonomous diplomatic decisions or a new banking model.
- Worldline experiments are disabled during multiplayer. Server authority remains unchanged. Multiplayer archival instrumentation is deferred; the suite labels this absence and retains only local single-player/branch collections.
- Live traces expose whole-month transitions and observed UI decisions. Internal function traces are available in branch simulations. Per-term mathematical attribution, aggregate dependency inference, and reconstructed states between snapshots are deferred.
- Historical records start when the extension first observes a campaign. Game-save IDs link reloaded campaigns to their sidecar ledgers; loading a pre-extension slot begins recording there. Old decisions are not reconstructed.
- Arrays such as achievement lists and completed research are retained in exact state snapshots; the scalar change view does not diff every array element. Notifications are not treated as an authoritative complete historical ledger.
- Dossiers are deterministic fictional documents, not generative AI. Each style selects actual relevant records. No API key or external AI service is required.
- Each ledger retains at most 320 events, 800 traces and 12 exact snapshots. Up to five campaigns and five experiment input sets are retained. The overall store is bounded near 3.8 MB: older result caches are removed first, then old archive detail if required. Inputs remain replayable. Browser quota failures remain visible; export before clearing browser data. Retained references may point outside the current window and are reported unavailable.
- Imported archive records are not cryptographically authenticated. Validation limits size/shape and escapes rendered text; reports preserve the imported provenance label.

## Validation status

See [TEST_REPORT.md](TEST_REPORT.md). Real browser layout and end-to-end UI interaction remain unverified in this environment; HTTP delivery and model/unit regressions are verified. Do not equate HTTP asset checks with browser rendering tests.
