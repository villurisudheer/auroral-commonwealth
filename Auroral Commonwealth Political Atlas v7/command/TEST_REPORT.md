# Command Deck 1.0 — test record

Date: 28 October 2026. Runtime: Node 24.22.1. Base: existing Worldline update commit `79ea6ca`. All previous game source lines retained.

## Executed and passed

- `npm run validate`: original game checks, 23 Worldline regression groups, 10 new Command Deck regression groups. The original validator also syntax-checks every JS/MJS module.
- `node worldline/smoke.mjs`: actual server startup, health endpoint, HTTP module graph (48 application/module assets plus extension CSS), 20-human-player room, rejected 21st player, valid authoritative policy update, rejected invalid financial/action requests.
- `node command/smoke.mjs`: actual server delivery of all six Command Deck/admin assets, protected admin API, valid admin login/status, same-origin framing policy and unchanged health endpoint.
- `git diff --check`: no whitespace errors.
- Preservation audit: modified pre-existing files contain additions only; no historical edition changed.

## New regression coverage

1. Deterministic 143-cell terrain and unique bounded buildable plots.
2. Read-only ownership-to-city projection and distributed representative districts.
3. Construction calls the actual engine, deducts actual funds and places only successful purchases.
4. Invalid/occupied/water plots, insufficient treasury and multiplayer cannot bypass map construction limits.
5. Malformed layouts rejected; large national counts retain bounded representatives without changing ownership.
6. SVG geometry, keyboard-selectable cells and bounded animation objects.
7. Admin access disabled without an adequate server-only password; original request handling remains intact.
8. Authentication, cross-origin rejection, room callback actions, logout and absence of passwords in status output.
9. Expired admin token rejection.
10. Login-guess rate limiting.

## Visual review and remaining checks

The actual SVG scene was rasterized with the runtime's image renderer and visually inspected. This verifies the generated map artwork and basic geometry, not full browser behavior. Full browser end-to-end pointer interaction, CSS layout at device sizes, focus behavior and animation playback remain unverified in this environment. An optional temporary DOM testing package could not be fetched within a 20-second network timeout and was not added to production dependencies.

Manual browser acceptance should cover construction, repeat construction, native pan/zoom and keyboard navigation, new-game/load/menu transitions, reduced motion, night lighting, original dashboard navigation, Worldline opening/closing, admin login/logout and room moderation.

## Intentional limits

The terrain is schematic; spatial location adds no extra economic effects. Up to eight representatives per building type are drawn, while the engine retains full actual counts. Visual arrangements are kept separately per nation/name. Multiplayer spatial construction uses the original Infrastructure screen. Admin sessions and audit entries are in server memory and clear on restart; there are no persistent accounts, bans or roles. No trained ML model is included in this interface release.
