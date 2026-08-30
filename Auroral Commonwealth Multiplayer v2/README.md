# AURORAL COMMONWEALTH — Multiplayer Edition

A browser-based country/economy strategy sandbox with single-player, online-ready multiplayer, and LAN multiplayer.

## What changed in v2

- Multiplayer rooms with six-character room codes.
- Up to 10 human players per room.
- One human-controlled reference country per player.
- Country locking so two players cannot select the same country.
- Shared room clock controlled by the host.
- Server-side monthly economy simulation for every player nation.
- Server-authoritative tax/budget changes and gameplay actions.
- Live country summaries broadcast to all room members.
- Player-to-player 50B aid transfers.
- Host migration if the current host leaves.
- Invite URLs such as `https://your-host/?room=ABC123`.
- Uses WebSockets implemented with Node's built-in modules; there are no npm runtime dependencies.

## Requirements

- A modern browser (Chrome, Edge, Firefox, Safari).
- Node.js 18 or newer for multiplayer/LAN mode.

Single-player can still be served by any normal static web server, but the **Multiplayer** button needs `server.mjs`.

## Start on Windows

Double-click:

`START_WINDOWS.bat`

Then open the LOCAL address printed in the terminal, normally:

`http://127.0.0.1:8000`

## LAN multiplayer

1. The host runs `START_LAN_WINDOWS.bat` or `node server.mjs`.
2. The terminal prints a LAN address such as `http://192.168.1.20:8000`.
3. Other players connected to the same Wi-Fi/router open that LAN address in their browsers.
4. The host presses **Multiplayer → Create Multiplayer Room**.
5. Other players press **Multiplayer → Join Room** and enter the six-character room code.
6. Every player selects a different country.
7. The host starts the shared simulation and controls Pause / 1x / 2x / 5x / 10x.

If another device cannot open the LAN address, allow Node.js through the host computer's local/private-network firewall.

## Internet multiplayer

The multiplayer code is internet-ready, but the server must be reachable on a public HTTPS address. The recommended setup is to deploy this entire folder to a Node-compatible hosting provider.

The host should run:

`node server.mjs`

The server automatically reads the hosting provider's `PORT` environment variable and uses secure WebSockets (`wss://`) automatically whenever the site is opened over HTTPS.

After deployment:

1. Open the public site.
2. Choose **Multiplayer → Create Multiplayer Room**.
3. Press **Copy Invite Link**.
4. Send that invite link to the other players.
5. They open the link and join the room.

For safety and reliability, public hosting is preferable to exposing a home PC directly to the internet.

## Docker deployment

A `Dockerfile` is included. Any service that can deploy a small Node container can run it.

Build:

`docker build -t auroral-commonwealth .`

Run:

`docker run -p 8000:8000 auroral-commonwealth`

## Multiplayer architecture

`server.mjs` is both the static HTTP server and the WebSocket multiplayer server. Each room contains:

- host player ID
- connected players
- selected countries
- one complete simulation state per player country
- shared speed and room status

The browser does not advance multiplayer months independently. The server advances all player states, then broadcasts updated state snapshots. Important actions and policy changes are also submitted to the server instead of being trusted as local-only mutations.

## Current multiplayer limitations

- Room state lives in server memory. Restarting the server ends active rooms.
- There is no password/account system yet; room codes are the access mechanism.
- The host controls shared time.
- Player-to-player interaction currently includes live comparison and direct aid; a full negotiated bilateral trade/treaty system can be added later.
- Multiplayer is designed for small private rooms (maximum 10 players), not massive public servers.

## Single-player saves

The original local save system remains available. Multiplayer room state is separate from local single-player save slots.

## Development checks

Run:

`npm run check`

This checks the JavaScript syntax for the main browser entry, multiplayer client, and server.

See `TEST_REPORT.md` for the multiplayer smoke-test results.
