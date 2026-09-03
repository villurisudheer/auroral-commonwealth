# AURORAL COMMONWEALTH — Stable v6

**Build. Govern. Trade. Survive.**

A browser-based geopolitical strategy and economic simulation with single-player, LAN multiplayer, and online multiplayer for up to **20 human players**.

## Stable v6 highlights

- 202 selectable country/scenario entries.
- 20-player multiplayer cap retained.
- Dark, Light and System appearance modes retained.
- Startup recovery screen: JavaScript/module failures are shown visibly instead of leaving a blank page.
- Docker pre-deploy validation: the image build now fails before deployment if JavaScript syntax, country IDs, resource data, or simulation values are broken.
- `/health` endpoint for deployment checks.
- Safer static-file path handling and clearer no-cache behavior.
- Multiplayer WebSocket message size guard.
- Broader country search: names, aliases, capitals, regions, status text and country codes can be searched.

## Requested special countries/scenarios included

- 🇫🇲 Micronesia
- Transnistria — Disputed / De facto
- The Republic of Samratpur — Fictional
- நாய் Country — Fictional
- Federation of Hyperpixel — Fictional
- Union of Soviet Socialist Republics (USSR) — Historical
- WWII Peak Germany — Historical scenario, neutral presentation
- Ottoman Empire — Historical

Historical and disputed entries are game scenarios and are separated from modern sovereign-state templates.

## Roster by category

- Africa: 54
- Asia: 48
- Europe: 44
- Americas: 35
- Oceania: 14
- Disputed / De facto: 1
- Fictional: 3
- Historical: 3

Total: **202**

## Run locally

Requires Node.js 18+.

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

1. Run `START_LAN_WINDOWS.bat` on the host computer.
2. Share the LAN address printed by the server with players on the same Wi-Fi/router.
3. Host: **Multiplayer → Create Multiplayer Room**.
4. Other players: **Multiplayer → Join Room** and enter the six-character room code.
5. Every player chooses a different country.
6. The host controls the shared game clock.

## Render / public deployment

Deploy this entire folder as a **Docker Web Service**.

Recommended settings:

```text
Root Directory: Auroral Commonwealth Stable v6
Dockerfile Path: ./Dockerfile
Docker Build Context Directory: .
Docker Command: leave blank
```

The Docker build automatically runs:

```bash
npm run validate
```

If a future manual country edit contains a missing comma or broken value, the deployment should stop during the build rather than launching a broken server.

Once live, check:

`https://YOUR-SERVICE.onrender.com/health`

A healthy v6 server returns JSON containing `ok: true`, version `6.0.0`, country count `202`, and max players `20`.

## Validation

Run at any time before committing:

```bash
npm run validate
```

The validator checks:

- every `.js` and `.mjs` file parses;
- country IDs are unique;
- required country fields are present;
- map coordinates are valid;
- resource structures are valid;
- all requested special/historical entries exist;
- every selectable country survives a 12-month simulation smoke test without non-finite core values.

## Appearance

Stable v6 retains:

- Dark Mode
- Light Mode
- System Mode
- Compact / Comfortable UI density
- High Contrast Mode
- Theme-aware charts
- Configurable autosave interval

## Important note

AURORAL COMMONWEALTH is a fictional strategy/economy game. Country statistics, historical scenarios, political systems, resource values, rankings, and outcomes are simplified or fictionalized for gameplay and are not real-world forecasts.
