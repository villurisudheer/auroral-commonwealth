# Auroral Command Deck 1.0

An additive, playable isometric 2D interface for the existing Stable v6.1 game and Worldline Suite. All pre-existing source lines remain intact. Changes to `main.js`, `server.mjs` and `validate.mjs` are appended integrations; implementation lives in `command/`.

## Run

Open a terminal inside `Auroral Commonwealth Stable v6/` and run `npm start`. On Windows PowerShell, `npm.cmd start` also avoids PowerShell's script-activation restriction. Open `http://localhost:8000` and start/load a single-player game. The Command Deck opens by default. The original Dashboard and all other game screens remain available from the sidebar.

### Play in 2D

- Select an owned facility to inspect its national count and construction effects.
- Select a construction card, choose a vacant land plot and click **Construct on this plot**. The existing game handler charges the actual cost and updates national capacity; successful placement is shown on the map and recorded through the Worldline observer.
- District categories focus transport, energy, public services, knowledge or industry. Nonmatching facilities dim for inspection.
- Drag to pan, use arrow keys when the map is focused, use +/− or the zoom buttons, or centre the map. **Expand view** fills the window.
- Animated vehicles follow transport corridors. Ships, water, smoke and selection outlines provide ambient motion. **Day / Night** changes presentation only. Motion respects the existing animation preference and system reduced-motion setting. Background-tab animations pause.
- The National Pulse provides real approval, stability and infrastructure values. Priority notices use recorded resource/energy diagnostics. The clock controls use the existing simulation; Next Month will not bypass a pending national event.
- Save Progress calls the existing quick-save system. Visual arrangements are saved separately by nation/name; game-save compatibility is preserved. Local layout saving errors do not prevent economic state changes.
- Worldline Lab opens the existing Suite. Archives and Observatory remain in the sidebar.

The map is a schematic representation of national networks, not real geography. Plot location has no new economic bonus or penalty. Each owned building/network has up to eight visual representatives; actual national counts remain visible and are never capped by the renderer. Water/road/forest terrain is presentational. Airplanes, traffic and ships are visual activity and do not claim extra simulated agents or transport capacities.

In multiplayer, district inspection, visuals and host clock controls work; spatial construction and single-month stepping are disabled. Use the existing Infrastructure screen for server-authoritative construction. Clients cannot mutate authoritative room data through the map.

## Admin Console

The console is accessible from the main menu and game sidebar, or directly at `/command/admin.html`. It is a real authenticated server console, not a client-side password overlay.

Admin access is disabled by default. Set a server environment variable with a password of at least 12 characters, then restart the server. For example in PowerShell:

```powershell
$env:AC_ADMIN_PASSWORD = Read-Host "Choose an admin password of at least 12 characters"
npm.cmd start
```

For hosted deployment, configure `AC_ADMIN_PASSWORD` in the host's environment settings. Use HTTPS when accessing admin credentials over a network. Never put the password in browser JavaScript, committed source, or a shared game-save file.

The console provides:

- Real room and player counts, process uptime and memory use.
- Per-room player/country summaries and host roles.
- Room pause controls using the original server clock and broadcast functions.
- Connected-player removal using the original disconnect function; the existing host reassignment rules remain active. Removal is not a persistent ban.
- The latest 100 admin operations in a server-memory audit trail.
- Sign-out and one-hour sessions. Tokens stay in page memory, not browser storage.

Passwords are checked using a server-side scrypt hash and constant-time comparison. Login attempts are bounded by IP, tokens are random and only their hashes are retained by the server, session count is bounded, and cross-origin admin requests are rejected. The admin page permits framing only by the same origin. Restarting the server clears sessions and the audit trail. This is a single-operator console; user accounts, persistent roles, bans and persistent audit storage are deferred.

No balance-breaking treasury editor or free-building controls are provided.

## Files and checks

- `model.js`: deterministic terrain, ownership reconciliation, bounded placements and layout validation.
- `scene.js`: native SVG facility artwork and accessible map geometry.
- `ui.js` / `style.css`: playable map, responsive shell and CSS animation controls.
- `admin-server.mjs`: isolated opt-in authenticated API and original server route delegation.
- `admin.html` / `admin-ui.js`: admin sign-in and operational UI.
- `validate.mjs`: 10 regression groups for map/real construction and admin protections.
- `smoke.mjs`: actual server delivery, login/status and original health checks.

```sh
npm run validate
node worldline/smoke.mjs
node command/smoke.mjs
```

The first command retains the original checks and adds all 23 Worldline and 10 Command Deck regression groups. The original multiplayer smoke checks capacity and authority; the command smoke checks the actual admin installation.

## Verification limits

Tested with Node 24.22.1; Node 18+ remains the base application target. The native SVG was rasterized and visually inspected. Full browser layout, pointer/keyboard integration and animation playback have not been verified end-to-end in this environment. A temporary DOM test dependency could not be fetched within the network timeout; no dependency was added to the game. Review these interactions in a browser before deployment.

This update adds the requested interface and administration, not a trained machine-learning model. The previously discussed data-generation and ML-training pipeline is still a separate next step.
