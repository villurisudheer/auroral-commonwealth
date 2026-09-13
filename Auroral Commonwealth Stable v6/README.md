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
