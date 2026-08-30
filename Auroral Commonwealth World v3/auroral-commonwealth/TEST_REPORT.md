# AURORAL COMMONWEALTH v2 — Test Report

## Static/code checks

PASS — `node --check main.js`

PASS — `node --check multiplayer.js`

PASS — `node --check server.mjs`

PASS — HTTP server returned `200 OK` for the game root.

## Two-client WebSocket smoke test

A scripted two-browser-equivalent test was run against the local multiplayer server.

PASS — Client A created a room and received a six-character room code.

PASS — Client B joined the same room.

PASS — Client A claimed United States.

PASS — Client B claimed India.

PASS — Duplicate-country locking is enforced by server room state.

PASS — Host started the shared match.

PASS — Host set the shared simulation to 10x.

PASS — The server advanced the countries to the next game month and broadcast the update.

PASS — A borrowing action was executed server-side and returned a successful action result.

PASS — Player-to-player 50B aid transferred through the server.

PASS — When the host disconnected, host authority migrated to the remaining player.

PASS — The new host successfully changed the shared speed to 2x.

## Verification scope

The networking protocol, room lifecycle, country claims, shared clock, server simulation, server action dispatch, aid transfer, and host migration were exercised programmatically.

A full automated graphical-browser click-through was not run because Playwright/Puppeteer is not installed in this build environment. The browser modules were syntax-checked and the same HTTP/WebSocket endpoints used by the UI passed the network smoke test.

## World roster v3 verification

- 195 countries loaded with unique IDs.
- Regional totals: Africa 54, Asia 48, Europe 44, Americas 35, Oceania 14.
- All 195 country templates completed a 12-month simulation without NaN/Infinity.
- Main client, multiplayer client, server, map, and country-data syntax checks passed.
- Multiplayer room cap configured to 20 players.
