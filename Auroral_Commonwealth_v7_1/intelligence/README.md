# Auroral Intelligence 1.0 — ML + local LLM

This extension is incorporated into the existing HTML/CSS/JavaScript game. It adds an **AI Adviser** button to the sidebar, 2D Command Deck and Worldline suite. Existing game functions remain in place. It does not replace the simulation with generated text.

## Start the integrated game

Open a terminal inside `Auroral Commonwealth Stable v6` and run:

```powershell
npm.cmd start
```

Open http://127.0.0.1:8000 and start or load a campaign. Click **AI Adviser**.

Windows shortcut: double-click `START_AI_WINDOWS.bat` to start the game with the optional qwen2.5:3b chat adapter configured. Offline ML works even if Ollama is not installed; chat then shows a setup message.

There is no Python virtual environment to activate. The bundled ML model works without an account, API key, paid service or model download. Keep the files together and use the Node server rather than opening index.html directly. Node 18+ is required.

## What works immediately

- **ML Policy Lab:** a trained regression forest compares seven candidate tax/budget profiles over six simulated months. Choose balanced, growth or solvency priorities. Every prediction is a policy effect **relative to unchanged policy**, not a prediction of the country's total outcome.
- **Verify in game engine:** runs two cloned game states through the existing seeded Worldline engine. One keeps policy unchanged; the other receives the selected plan. The live nation is untouched. A fixed seed is one scenario, not a promise about every random event.
- **Apply verified policy changes:** requires explicit clicking, a current snapshot, single player and no unresolved event. Changes go through the original policy setter. No money, buildings or simulation months are fabricated. A decision trace appears in the existing Worldline archive.
- **Export Worldline experiment:** exports a compatible experiment JSON for Worldline Lab → Import experiment JSON. The same AI panel is accessible inside Worldline's tabs.
- **Model & evidence:** displays the actual training/test split, errors, baseline comparisons, limitations and an exportable training report.

Multiplayer permits reading the local player's state and ML estimates. AI experiments and commits are disabled there; no other player's authority is bypassed. Opening the adviser pauses single player. It stays paused when the adviser closes.

## Enable the optional language model

An LLM is already integrated as a server-side adapter, but pretrained LLM weights are **not bundled**. Install Ollama separately using its official site, then install a local model. This example uses an existing Qwen model, not a model trained by this project:

```powershell
ollama pull qwen2.5:3b
```

Keep Ollama running. In a PowerShell window inside the game folder, run:

```powershell
$env:AC_LLM_MODEL = 'qwen2.5:3b'
npm.cmd start
```

For Command Prompt instead:

```bat
set AC_LLM_MODEL=qwen2.5:3b
npm.cmd start
```

For macOS/Linux:

```sh
AC_LLM_MODEL=qwen2.5:3b npm start
```

Restart an already running game server after changing this environment variable. Open **http://127.0.0.1:8000** on the server computer, then AI Adviser → Ask local LLM. The browser sends the displayed summary, selected ML estimate and your question through the game's Node server to Ollama at http://127.0.0.1:11434/api/chat. Model selection and endpoint configuration are server-only. `AC_OLLAMA_URL` can override the Ollama port but accepts HTTP loopback addresses only. Only locally installed models are supported; do not select a cloud-backed model.

The LLM explains the budget, policy tradeoffs and controls. It cannot call game actions, execute code, grant admin rights, alter territory or access other players. Every question is independent; chat history is displayed only in memory and is not sent as conversation history or saved for training. Close the panel to clear that history. The live game summary is exposed in the UI before sending. Reply text is escaped before rendering. The model can still give incorrect explanations: inspect the game and engine comparison.

The bridge allows requests only from loopback clients using a localhost/127.0.0.1 Host, rejects other origins, bounds input/output, permits one inference at a time, limits each local address to six requests per minute and times out after one minute. LAN players retain offline ML but cannot use the host's LLM endpoint. Admin authentication remains separate and unchanged.

Model installation requires a separate download and sufficient memory. The model provider's license applies to its weights. No LLM weights or provider API keys are included in this game archive.

Official protocol and model references checked for this implementation:

- https://docs.ollama.com/api/chat
- https://docs.ollama.com/capabilities/structured-outputs
- https://ollama.com/library/qwen2.5:3b

## What was actually trained

`model/policy-forest.json` contains trained numerical weights: 32 bootstrapped multi-output regression trees, maximum depth eight and minimum leaf size eight. It predicts seven policy effects using current state, current/proposed policies and policy differences. It is a small task-specific ML model, not a language model or a general intelligence.

`train.mjs` generates its own labeled examples using the existing seeded game engine. It uses 205 non-fictional modern roster entries, three nearby-policy scenarios per country and seven policy profiles. There are 3,444 training examples from 164 nations and 861 held-out examples from 41 different nations. Country assignment happens before simulation, so states of the same nation cannot appear in both sets. Branches use the same starting snapshot and random seed. Events use the cheapest affordable option before the next monthly step. Economic inputs are the game's synthetic statistics, not historical measurements.

Every target measures the candidate rollout minus an unchanged-policy rollout. GDP growth uses percentage-point differences; treasury and debt use a percentage of starting GDP; approval, stability, inflation and unemployment use percentage points. Utility rankings are a transparent weighted sum, defined in `schema.js`, rather than a claim that a government policy is objectively best.

Full metrics, seed, training fingerprint, country IDs and engine version are in `model/training-report.json`. Model spread is disagreement between trees, not a calibrated uncertainty interval. Inputs outside observed training ranges are flagged.

The balanced ranking is narrow: spending restraint dominates this game setup. Compare the ML ranking against the fixed-profile baseline in the report, not chance alone. A high ranking-match score here does not demonstrate broad strategic intelligence. Some targets may be worse than a mean-only baseline; those results are retained.

Historical and fictional eras can use the adviser because they share the game engine, but their economies are synthetic and outside the historical validity of the training data. Nothing in this extension improves the atlas's documented source coverage or frontier accuracy.

## Retrain or extend

From the game folder:

```powershell
node intelligence/train.mjs
node intelligence/validate.mjs
node intelligence/server-test.mjs
npm.cmd run validate
```

Training is an explicit developer action. The default game never collects saves or chat logs and does not silently retrain. Retraining overwrites only the two generated files under `intelligence/model/`. The algorithm, scenarios, seed and feature contract are committed alongside the weights. The trainer temporarily seeds Math.random only inside its dedicated synchronous process, restoring it after each rollout; it never changes the running game's random generator.

To add candidate policies, edit this extension's `PROFILES` in `schema.js`, then retrain and rerun validation. Engine-version mismatches prevent the browser from loading stale weights. To add a different language model, install it in Ollama and change AC_LLM_MODEL. Fine-tuning an LLM is a separate future project requiring a suitable dataset, model license, compute and evaluation; this version does not claim that was done.

## File layout

- `schema.js`: features, profiles, objectives, game summary and snapshot fingerprint.
- `forest.js`: inference and strict model validation.
- `train.mjs`: reproducible simulator data generation and training.
- `actions.js`: stale-safe, single-player policy commit using original setters and archive tracing.
- `ui.js`, `style.css`: integrated adviser interface.
- `server.mjs`: optional host-local Ollama bridge, no external dependencies.
- `model/`: actual weights and evaluation report.
- `validate.mjs`, `server-test.mjs`: regression checks and HTTP/protocol fixtures.
- `TEST_REPORT.md`: what was actually exercised and what remains unverified.

## Explanation for a school demonstration

“Our game uses two different forms of AI. A small machine-learning model was trained on thousands of examples generated by our own game simulation. It estimates what a proposed tax or budget change could do compared with leaving policy unchanged. The player can test that estimate with the original simulation before approving a change. A separately installed pretrained language model can explain the current game state in ordinary language. We trained the policy predictor; we did not train a large language model from scratch. All results describe our game, not real-world economic forecasts.”
