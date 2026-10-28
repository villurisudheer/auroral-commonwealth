# Executed validation — Auroral Intelligence 1.0

Tested with Node 24.22.1 on 28 October 2026. Runtime target remains Node 18+. No production packages were added.

## Passed

- Full `npm run validate`: original game checks, 23 Worldline groups, 10 Command Deck groups, 11 Political Atlas groups and 11 new Intelligence groups (55 extension groups total).
- ML checks load real numerical weights, validate feature/target dimensions and engine version, verify disjoint country partitions, deterministic finite inference, explicit out-of-range flags, and analysis of tiny/historical nations.
- Commit checks exercise original policy setters, retained causal archive records, no month/treasury/history changes, and rejection without partial mutation for stale snapshots, multiplayer, unresolved events and malformed plans.
- Seeded engine comparisons replay identically and leave the input nation unchanged.
- `node intelligence/server-test.mjs`: actual HTTP fixture implementing the Ollama /api/chat protocol. Validates request schema, response parsing, whitelisted game context, input/response bounds, malformed replies, timeout, concurrency, request rate, Origin/Fetch-Site/Host rejection and preservation of earlier server listeners. The fixture returns fixed text; it is not a real LLM inference run.
- The same script launches the shipped server: new assets and model files return HTTP 200; an unconfigured LLM returns a clear 503; expanded atlas assets, health and protected admin framing remain available.
- `node worldline/smoke.mjs`: actual game server, module delivery, 20-player room, rejection of player 21, authoritative policy and financial-action validation.
- `node command/smoke.mjs`: actual protected admin login/status, assets and framing.
- `node atlas/server-test.mjs`: all era maps, era-specific multiplayer dates, mixed-era claim rejection and cross-era diplomacy rejection.
- A second `node intelligence/train.mjs` produced byte-identical policy weights and evaluation report. Training data SHA-256 is included in the report. No user saves or chats were used.
- Existing-line preservation audit against both the pre-AI commit (89c8beb) and original repository baseline (fba3fea): every existing line in changed files remains in sequence. The new AI hooks and documentation are appended. Other editions were untouched.
- `git diff --check` passed.

## Evaluation interpretation

3,444 training examples from 164 nations; 861 test examples from 41 distinct nations. All policies/scenarios of each country stay in one partition. Seven profiles over six game months; common random seeds for candidate versus unchanged-policy comparisons.

The report retains all errors, including stability performance worse than the mean-only baseline. Balanced ranking matches the simulated best profile for approximately 95.9% of held-out states, but a fixed spending-restraint profile selected using training data already matches approximately 95.1% and has slightly lower mean regret. This is a narrow prototype and does not establish superiority over that simple strategy. Engine verification remains required before UI commits.

## Not verified

- No pretrained LLM weights were installed or queried. The server adapter was tested against a local HTTP protocol fixture, not a live Ollama model. Language quality, hallucination rate, device memory use and real-model latency remain unmeasured.
- Full browser rendering, focus behavior, clicking and responsive layouts were not exercised. A Chromium download was attempted, but the environment returned an empty/truncated archive. HTML/CSS/JS parse and HTTP checks do not substitute for browser end-to-end validation.
- The Windows batch launcher was inspected but not executed on Windows.
- The inherited historical-map coverage and economic-simulation limitations remain. This update does not verify historical frontiers or create an accurate historical economic model.

Chronicle v7.1 supersedes the earlier build's browser/replay-identity status above. Its broader executed browser checks, scenario-economy validation and remaining limits are recorded in `../chronicle/TEST_REPORT.md`. The bundled model still warns that new scenario economics are outside its baseline training domain.
