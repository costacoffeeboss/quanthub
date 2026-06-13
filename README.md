# QuantHub

A free hub for UK students and graduates breaking into quant finance: role explainers,
an application tracker, factual firm profiles, ~240 worked interview brainteasers, a timed
mock interview with LLM grading, interactive options theory, and nine market-making games.

## Stack

- Vite + React + TypeScript
- React Router
- Tailwind CSS v4
- No backend — personal data (tracker statuses, question progress/bookmarks, game high
  scores, calibration history, optional API key) lives in `localStorage` via a typed wrapper
  (`src/lib/storage.ts`) with an in-memory fallback.

## Develop

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build
npm run preview  # serve the production build
node scripts/verify-questions.mjs   # independently recompute every numeric answer
```

## Structure

- `src/data/` — typed static data: `firms.ts` (Trackr programmes), `firms-detail.ts` (firm
  profiles), `roles.ts`, and `questionBank/` (8 category files + index with the daily-question
  helper, ~240 questions).
- `src/pages/` — one component per top-nav tab (Home, Roles, Trackr, Firms, Questions, Mock,
  Options, Games, Resources).
- `src/games/` — nine games: Counting Cards, Adverse Selection, Hidden Dice, Kelly Criterion,
  Calibration Duel, Sequence Sprint, Market Maker, Mental Math Sprint, Dice EV.
- `src/components/` — Layout, Ticker, QuestionCard.
- `src/lib/storage.ts` — persistence wrapper. `src/lib/anthropic.ts` — browser-side Anthropic
  call used only by the Mock interview's optional LLM grading.
- `scripts/verify-questions.mjs` — exact + Monte-Carlo recomputation of every numeric answer
  in the bank (173 checks); run it after editing questions.

## Mock interview grading

The Mock page grades free-text answers three ways (`src/lib/grading.ts`), all keeping the site
backendless:

- **Free, in-browser model (default, no key)** — an open model (Qwen2.5 / Llama-3.2) runs entirely
  in the visitor's browser via WebGPU using [`@mlc-ai/web-llm`](https://github.com/mlc-ai/web-llm).
  The library is **dynamically imported**, so its ~6 MB chunk only downloads when this mode is
  chosen; model weights (~1–2 GB) download once and are cached by the browser. Requires a
  WebGPU-capable desktop browser (Chrome/Edge); auto-falls back to self-grade otherwise.
- **Bring your own key** — Anthropic (direct browser call via the
  `anthropic-dangerous-direct-browser-access` header) or any **OpenAI-compatible** endpoint
  (OpenRouter — which has free models — Groq, OpenAI, or a local Ollama). The key is stored only in
  this browser's localStorage and sent directly to the chosen provider. Some providers block
  direct browser calls (CORS); OpenRouter, Groq, Anthropic, and local Ollama work.
- **Self-grade** — no model; you score each answer 0–5 against the worked solution. Always
  available on any device, and the fallback whenever an automated grade fails.

## Honesty notes

Opening windows in the Trackr are *typical of recent cycles*, not live status, and the UI says
so. Compensation figures (Trackr, Roles, and Firm Profiles) are labelled approximate and, for
firms, drawn from cross-referenced public/forum data — orders of magnitude, not offers. Firm
interview-process and culture notes are aggregated public reports, not official. There are no
testimonials and no invented statistics.
