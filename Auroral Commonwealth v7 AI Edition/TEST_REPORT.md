# AURORAL COMMONWEALTH Stable v6.1 — Regression Test Report

**Release type:** Bug fixes only  
**Version:** 6.1.0  
**Test date:** 2026-09-13

## Scope

v6.1 was tested specifically as a stability/bug-fix release. No new gameplay feature or roster expansion was introduced.

## Automated validator

Command:

```bash
npm run validate
```

Result:

```text
AURORAL COMMONWEALTH v6.1 validation PASS
- 202 selectable entries / 202 unique IDs
- every JS/MJS file parses
- every country completed a 12-month finite-value simulation
- all tax/budget slider mappings, clamps and markup passed
- invalid/negative economy actions are rejected safely
- zero-stock resource regression passed
- constant chart bounds regression passed
- malformed/older save-state repair and all major view renders passed
```

## Policy-slider regression

PASS — 5 tax policy sliders map to `state.taxes` correctly.  
PASS — 10 national-budget sliders map to `state.budget` correctly.  
PASS — Trade-screen tariff slider maps to the same tariff policy.  
PASS — Tariff clamps to 0–40%.  
PASS — Other tax sliders clamp to 0–60%.  
PASS — Budget sliders clamp to 0.5–12%.  
PASS — Invalid policy groups/keys are rejected without throwing.  
PASS — Slider markup contains no `NaN` or `undefined` values.

## Multiplayer regression

A two-client WebSocket session was exercised against the v6.1 server.

PASS — room creation  
PASS — second player join  
PASS — India/United States country claims  
PASS — shared match start  
PASS — tax slider update synchronized through server  
PASS — budget slider update synchronized through server  
PASS — server-side tariff clamp  
PASS — server-side budget minimum clamp  
PASS — invalid resource action returned `ok: false` without terminating the server

## Server smoke test

PASS — `/` returned HTTP 200.  
PASS — `/health` returned HTTP 200.  
PASS — health response reported version `6.1.0`.  
PASS — health response reported 202 countries.  
PASS — health response reported maxPlayers 20.

## Economy/input regressions

PASS — negative borrow rejected.  
PASS — negative debt repayment cannot increase treasury/debt.  
PASS — invalid resource ID rejected safely.  
PASS — negative import/export quantities rejected.  
PASS — negative industry investment rejected.  
PASS — depleted zero stock does not magically regenerate from the old fallback expression.

## UI/data stability regressions

PASS — constant zero chart data creates finite chart bounds.  
PASS — malformed/older state can be repaired before rendering.  
PASS — Dashboard renders after repair.  
PASS — Government renders after repair.  
PASS — Industry renders after repair.  
PASS — Resources renders after repair.  
PASS — Trade renders after repair.  
PASS — Technology renders after repair.  
PASS — Infrastructure renders after repair.  
PASS — Diplomacy renders after repair.  
PASS — Commonwealth renders after repair.  
PASS — Analytics renders after repair.  
PASS — Tutorial renders after repair.  
PASS — Settings renders after repair.  
PASS — Saves view renders after repair.

## Roster/content integrity

PASS — 202 roster entries retained.  
PASS — 202 unique country IDs.  
PASS — Micronesia retained.  
PASS — Transnistria retained.  
PASS — Republic of Samratpur retained.  
PASS — நாய் Country retained.  
PASS — Federation of Hyperpixel retained.  
PASS — USSR retained.  
PASS — WWII Peak Germany historical scenario retained.  
PASS — Ottoman Empire retained.

No roster additions/removals or intentional gameplay-feature changes were made for v6.1.
