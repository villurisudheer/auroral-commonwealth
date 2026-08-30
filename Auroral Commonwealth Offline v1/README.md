# AURORAL COMMONWEALTH

A browser-based fictional country, economy, trade and geopolitical management simulation.

## Run locally

Because the project uses ES modules, serve the folder over a local HTTP server instead of double-clicking `index.html`.

### Python

```bash
cd auroral-commonwealth
python -m http.server 8000
```

Open `http://localhost:8000` in a modern desktop browser.

### Node

Any static server works, for example `npx serve .` if you already have Node tooling available.

## Included systems

- New game flow with 10 reference economies and a fictional country creator
- Easy / Normal / Hard / Nightmare difficulties
- Monthly GDP, tax revenue, spending, inflation, unemployment, population and debt simulation
- Dynamic budget and tax policy controls
- Industries with investment, workers, revenue and costs
- Finite natural-resource reserves, stocks, production, consumption and changing prices
- Energy production/consumption with shortage penalties
- Import/export actions, tariffs and trade agreements
- Technology research with cost, time and productivity effects
- Infrastructure construction with build and maintenance costs
- Diplomacy, relationships, negotiations and sanctions
- Auroral Commonwealth institutions and a multi-factor Power Index leaderboard
- Random national events with consequential choices
- National crisis/collapse stages
- Achievements
- Interactive canvas charts
- Multiple local save slots, rename/delete/load and autosave
- Responsive dark command-center UI

## Simulation note

This is a strategy-game model. Its variables and formulas are intentionally simplified and must not be treated as real economic forecasts.
