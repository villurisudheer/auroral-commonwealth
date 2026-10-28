# Auroral Commonwealth — AI Edition

This archive contains the complete active game, its political atlas, playable 2D Command Deck, authenticated administration, Worldline suite and new integrated AI Adviser.

## Start on Windows

1. Extract the whole archive to a folder.
2. Open `Auroral_Commonwealth_AI_Edition` and double-click `START_AI_WINDOWS.bat`.
3. Open http://127.0.0.1:8000 in your browser, start/load a campaign, then click AI Adviser.

Node.js 18+ is required. No Python activation is needed. Alternatively run `npm.cmd start` in the extracted game folder.

## Included AI

- Actual trained offline ML weights: 32 regression trees, 3,444 training examples and 861 held-out examples generated from the game engine.
- Six-month policy comparisons, three objectives and explicit engine verification before reviewed single-player changes.
- Same adviser accessible from the sidebar, 2D game and Worldline suite.
- Optional pretrained local LLM chat through Ollama. LLM weights are NOT included and no LLM was trained or fine-tuned by this project. To enable the example model, install Ollama, run `ollama pull qwen2.5:3b`, keep Ollama running and use START_AI_WINDOWS.bat. Other setup is documented in intelligence/README.md.

The ML model runs immediately without Ollama. The LLM cannot execute game actions. All existing source lines were preserved; AI hooks were appended. Other repository editions were untouched.

## Evidence and limits

Read intelligence/README.md, intelligence/model/training-report.json and intelligence/TEST_REPORT.md. All 55 extension regression groups plus the original validation and four server smoke scripts passed. Retraining produced identical model files. Real LLM inference and full browser UI testing remain unverified in the build environment; adapter tests used a local HTTP fixture.

This is a narrow game-trained policy predictor, not a general strategic intelligence. Spending restraint dominates the tested balanced objective; the fixed-profile baseline is nearly as strong and has lower average regret. Verify policies using the game engine.

Historical economies are synthetic. Atlas source limits remain: 1783 has coverage gaps; the red 1942 layer contains selected annual territorial extents rather than complete day-exact occupation/frontlines. See atlas/README.md for sources, licensing and limitations. Green state outlines and red wartime extents can be toggled independently.

## Source patches

AI_Only_Update.patch applies to the preceding Political Atlas version (89c8beb). Complete_Update.patch applies to the original repository baseline (fba3fea). Use the full included game if you do not use git patches. Back up your existing project before applying a patch.
