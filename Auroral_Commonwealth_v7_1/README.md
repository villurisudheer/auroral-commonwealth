# AURORAL COMMONWEALTH — Stable v6.1

**Bug-fix-only release. No new gameplay features, countries, systems, balance features, or UI redesigns were added in v6.1.**

Stable v6.1 is based directly on v6.0.1 and keeps the existing **202 selectable entries**, **20-player multiplayer cap**, Light/Dark/System themes, economy simulation, historical/fictional roster, saves, LAN play, and online multiplayer.

## v6.1 bug fixes

### Policy slider fixes

- Fixed the main single-player tax-slider crash. The UI used the policy group name `tax`, while the actual state container is `taxes`; the old handler attempted to write into a nonexistent `state.tax` object.
- All 5 tax sliders now update the correct state values.
- All 10 national-budget sliders are validated through the same policy path.
- The Trade screen tariff slider now uses the same validated policy handler.
- Slider values are clamped to their legal minimum/maximum values.
- Invalid or non-numeric slider values are ignored safely instead of throwing runtime errors.
- Slider labels and displayed percentages stay synchronized with the committed value.
- Single-player and multiplayer now use the same policy validation logic so they cannot drift apart.

### Save/state stability fixes

- Added repair logic for older or partially malformed local saves.
- Missing taxes, budgets, resources, industries, energy data, research state, diplomacy data, settings, notifications, history, buildings, and monthly-stat objects are repaired with safe defaults.
- Non-finite values in important save fields are repaired before the UI renders.
- Invalid diplomatic relation values are normalized.
- Save/localStorage write failures no longer crash the whole game UI.
- Standard country capitals now correctly fall back to the country's actual capital rather than always becoming `Capital City`.

### Economy/input safety fixes

- Negative debt repayments can no longer mutate treasury/debt incorrectly.
- Negative or invalid borrowing is rejected safely.
- Invalid resource IDs no longer cause import/export action errors.
- Negative resource imports/exports are rejected.
- Negative industry investment is rejected.
- Zero resource stock no longer receives a false fallback stockpile every month.
- Invalid research IDs in damaged/older saves are cleared safely instead of crashing research updates.
- Invalid stale pending-event IDs are cleared so the event system can continue.

### UI/runtime stability fixes

- Constant or all-zero chart series now receive valid chart bounds instead of producing divide-by-zero/NaN drawing coordinates.
- Chart canvas scaling is reset safely before drawing.
- Notification rendering handles malformed/non-string notification text safely.
- Country Creator numeric fields now use browser validity checks before starting a custom country.
- Policy slider markup prevents `NaN` values from reaching range controls.

## Existing roster retained unchanged

v6.1 does not add or remove countries. It retains the same 202 entries from v6.0.1, including:

- Micronesia
- Transnistria
- The Republic of Samratpur
- நாய் Country
- Federation of Hyperpixel
- Union of Soviet Socialist Republics (USSR)
- WWII Peak Germany — historical scenario
- Ottoman Empire

## Run locally

Requires Node.js 18 or newer.

### Windows

Double-click:

`START_WINDOWS.bat`

Then open the Local address printed by the server, normally:

`http://127.0.0.1:8000`

### Manual

```bash
node server.mjs
```

## LAN multiplayer

1. Run `START_LAN_WINDOWS.bat` on the host PC.
2. Other players on the same network open the LAN address printed by the server.
3. Create/join a multiplayer room normally.

## Render deployment

Upload the complete extracted folder to GitHub as:

`Auroral Commonwealth Stable v6.1`

Then set Render to:

```text
Root Directory: Auroral Commonwealth Stable v6.1
Dockerfile Path: ./Dockerfile
Docker Build Context Directory: .
Docker Command: leave blank
```

Deploy the latest commit. The Docker build runs the v6.1 regression validator automatically.

After deployment, verify:

`https://YOUR-SERVICE.onrender.com/health`

A healthy v6.1 server reports version `6.1.0`, 202 countries, and maxPlayers 20.

## Validation

Run manually with:

```bash
npm run validate
```

The v6.1 validator checks JavaScript syntax, all 202 country states, all policy slider mappings and clamps, invalid action handling, resource stock behavior, chart bounds, old-save repair, and rendering of every major game view.

See `TEST_REPORT.md` for the regression-test results.

## Important note

AURORAL COMMONWEALTH is a fictional strategy/economy game. Country statistics, historical scenarios, political systems, resource values, rankings, and outcomes are simplified or fictionalized for gameplay and are not real-world forecasts.

## Worldline Intelligence Suite 1.0 (additive extension)

The normal game now includes Worldline Lab, Auroral Archives and Systems Observatory. Existing source lines are preserved; see [worldline/README.md](worldline/README.md) for architecture, launch/demo instructions and explicit coverage limits. Run `npm run validate` for original and extension regressions, and `node worldline/smoke.mjs` for HTTP/WebSocket smoke tests.

## Animated 2D Command Deck and administration

The normal game now includes a large playable isometric map, contextual construction and district inspection, ambient animation, pan/zoom, lighting and a password-protected server administration console. See [command/README.md](command/README.md) for play controls, admin setup and verified scope. No original source lines are removed.

## Political Atlas and era-specific rosters

New Game and multiplayer now provide separate 2026, 1942, 1919 and 1783 rosters with sourced political outlines. The 2026 picker contains all 193 UN members and 2 observers, with non-member, disputed and fictional categories. Green state/dependency borders and a separate provisional red 1942 territorial reconstruction can be toggled in Political Atlas. See [atlas/README.md](atlas/README.md) for source dates, licensing, historical omissions and accuracy limits; the historical maps are not presented as fully verified. ML remains deferred.

## Auroral Intelligence ML/LLM extension

The AI Adviser is available from the sidebar, 2D Command Deck and Worldline suite. Bundled trained offline ML compares seven policy profiles, verifies a selected plan on cloned game states and applies it only after explicit review. An optional local Ollama bridge answers game-state questions; install a pretrained model separately and set AC_LLM_MODEL before starting the Node server. No original game lines were removed or replaced for this extension. See `intelligence/README.md` for setup, actual training evidence, evaluation baselines and limitations. Run `node intelligence/train.mjs` to reproduce training; the game does not train on player saves or chats.

## Chronicle Edition v7.1

Adds sixteen era choices from AD 14 to 2026, named WWI/WWII scenarios, animated continent cameras, drawn custom territories, a coming-soon fictional Antarctic Penguin Kingdom, country → administrative region → local-city navigation, scenario currency/inflation/pricing, five-unit resource exports, fifty-billion debt repayment and human-readable Worldline Suite records. Start with `START_CHRONICLE_WINDOWS.bat`. Details, source dates, licenses and important historical/economic limits are in `chronicle/README.md`.
