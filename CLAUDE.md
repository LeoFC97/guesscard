# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

A Magic: The Gathering card-guessing game split into two independent Node/TypeScript projects that communicate over HTTP:

- `backend/` — Express + TypeScript API server (game logic, persistence, coins).
- `frontend/` — React + TypeScript SPA built on Create React App + MUI.

There is no monorepo tooling (no workspaces, no top-level `package.json`). Each side installs and runs independently.

A more verbose architectural reference exists at `WARP.md`. It is largely accurate but predates some changes — in particular, **the backend has no `adRoutes`/`adController`/`adService`/`adConfig` despite what WARP.md claims**. Ads are an entirely frontend concern (Google AdSense, see `ADSENSE_SETUP.md`).

## Common commands

### Backend (`cd backend`)
- `npm install`
- `npm run dev` — `ts-node-dev` with auto-reload (preferred for development)
- `npm start` — `ts-node src/app.ts` (no reload)
- `npm run build` — `tsc` type-check + emit
- No test runner is configured.

The backend listens on `process.env.PORT` or `3001`. It **throws on startup if `MONGODB_URI` is unset** (`backend/src/app.ts`). On boot it seeds a hardcoded list of daily cards into Mongo via `dailyCardRepo.setDailyCard` — both an explicit list (2025‑09‑25 → 2025‑10‑15) and a generated range (2025‑10‑16 → 2026‑02‑25) cycling through `extraCards`.

### Frontend (`cd frontend`)
- `npm install`
- `npm start` — dev server (CRA, port 3000)
- `npm run build`
- `npm test` — Jest via `react-scripts` (no tests are checked in; the suite is essentially empty).

**Caveat — broken `NODE_OPTIONS` on macOS/Linux:** `frontend/package.json`'s `start`/`build` scripts use Windows `cmd` syntax: `set NODE_OPTIONS=--openssl-legacy-provider && react-scripts start`. On zsh/bash, `set` is a no-op for env vars, so `NODE_OPTIONS` is **not** actually set. CRA 5 with Node ≥17 may error out on OpenSSL; if that happens, run `NODE_OPTIONS=--openssl-legacy-provider npm start` directly rather than "fixing" the script for everyone (it works on the maintainer's Windows machine).

## Required environment variables

### Backend (`backend/.env`)
- `MONGODB_URI` — required, server throws without it.
- `PORT` — optional, defaults to `3001`.
- `NODE_ENV` — optional, gates verbose error payloads in some controllers.

### Frontend (`frontend/.env`, all `REACT_APP_`-prefixed)
- `REACT_APP_API_URL` — base URL of the backend (e.g. `http://localhost:3001`). Consumed by every service in `src/services/`.
- `REACT_APP_AUTH0_DOMAIN`, `REACT_APP_AUTH0_CLIENT_ID`, `REACT_APP_AUTH0_AUDIENCE` — used by `src/components/Login.tsx`.

The committed `.env` files are dev examples; do not rely on their values.

## Backend architecture

Layered Express app under `backend/src/`:
- `app.ts` — entry point: dotenv → Mongoose connect → middleware → `setRoutes(app)` (mtg) + `app.use('/api/coins', coinsRoutes)` → daily-card seeding on `listen`.
- `routes/` (`mtgRoutes.ts`, `coinsRoutes.ts`) — only two route groups are wired.
- `controllers/` (`mtgController.ts`, `coinsController.ts`) — `mtgController` exposes a mix of instance and static methods; routes invoke each accordingly. Read it before adding new endpoints to match the existing pattern.
- `services/` — `mtgGameService` (guess comparison), `scryfallService` (Scryfall API client; the older `mtgService.ts` is a small wrapper around `magicthegathering.io` and is mostly superseded), `hintService`, `userStatsService`, `leaderboardService`.
- `repositories/` — Mongoose schemas + query helpers. One per persisted entity: `matchRepository`, `dailyMatchRepository`, `blurMatchRepository`, `textMatchRepository`, `dailyCardRepository`, `coinsRepository`.
- `config/hintConfig.ts` — single source of truth for hint types, costs, descriptions.
- `middleware/hintValidation.ts` — `validateHintRateLimit` + `validateHintRequest`, applied to `POST /api/request-hint`.
- `utils/` — `textUtils.maskCardNameInText` (used to censor target card name from rules text in text-mode), `editionUtils`.

### Game session state (important)

Live games for normal/text/blur modes are held in an **in-memory `games: Record<string, any>` map keyed by `gameId`** inside `mtgController.ts`. This means:
- Restarts wipe all in-flight games.
- Any horizontal scaling would break the guess flow — sessions are not in Mongo.
- Only completed matches are persisted (via `matchRepository`, `dailyMatchRepository`, `blurMatchRepository`, `textMatchRepository`).

Daily mode does not use this in-memory map the same way — the target card is derived per-request from `dailyCardRepository.getDailyCard(date)`.

### Coins system

All balance/transaction writes go through `coinsRepository`, which maintains two collections (`UserCoins` for current state, `CoinTransaction` as an append-only log) and exposes `getUserCoins`, `addCoins`, `spendCoins`, plus aggregation helpers. Hints charge coins by calling `coinsRepository.spendCoins` from within `mtgController.requestHint`. Any new feature that mutates coins must go through this repository so the transaction log stays consistent.

## Frontend architecture

CRA + React 18 + MUI 7 + React Router 7 SPA under `frontend/src/`:
- `App.tsx` — root: theme (`getTheme(mode)` light/dark), Auth0-backed login state persisted to `localStorage`, top-level routes (`/` → `Home`, `/leaderboards` → `LeaderboardsPage`), wraps logged-in tree in `CoinsProvider` and `LocaleProvider`.
- `pages/Home.tsx` — the central game hub. Holds `gameStarted`, `gameId`, `targetCard`, `guesses`, timing, and switches UI by mode (normal / daily / text / blur). All mode kickoff goes through `pages/StartGame.tsx`.
- `pages/StartGame.tsx` — difficulty toggle + per-mode start calls: `POST /api/new-game`, `POST /api/new-text-game`, `POST /api/new-blur-game`, `GET /api/daily-game`. Daily mode uses `useDailyPlayedDates` to mark already-played dates on the picker.
- `components/` — `CardGuess` (autocomplete + submit, uses `mtgAutocomplete.ts`), `GuessHistory`, `BlurredCard`, `TextCard`, `VictoryScreen`, `Login` (Auth0), `Leaderboards`, `MeuPerfil`, `CoinDisplay`, `CoinStatement`, `LanguageToggle`, `PlayActionBar`.
- `services/` — **the only place that should call the backend**. `mtgApi.ts` (game/guess/hints), `coinsApi.ts` (`/api/coins/...`), `leaderboardApi.ts`, `mtgAutocomplete.ts`. New components must consume these, not call `fetch`/`axios` directly.
- `contexts/CoinsContext.tsx` — canonical coin state on the client: `balance`, `refreshBalance()`, `animateCoinsGain()`. `CoinDisplay` reads animation state from here for the `+N` floaters.
- `contexts/LocaleContext.tsx` + `i18n/{en,pt}.json` + `utils/translate.ts` — i18n. UI strings live in the JSON files.
- `hooks/useDailyPlayedDates.ts` — `GET /api/daily-played-dates/:userId`.

### Hint UX gating

Hints are released differently per mode:
- Normal/daily: flavor text and effect text unlock after fixed wrong-guess thresholds (handled in `Home.tsx`).
- Text mode: explicit "buy a hint" via `POST /api/request-hint` (mana cost / card type), spending coins.

## Conventions when extending

- **New backend endpoint:** add to a service under `services/`, expose via `controllers/mtgController.ts` (or a new controller), wire in `routes/mtgRoutes.ts`. Persistence belongs in a `repositories/` module — do not touch Mongoose models from controllers.
- **New frontend HTTP call:** add it to the matching file under `src/services/`. Components and pages stay free of fetch logic.
- **Coins / rewards:** never write a balance directly — go through `coinsRepository` on the backend and `coinsApi` + `CoinsContext` on the frontend so the transaction log, animations, and balance stay in sync.
- **Game-mode-specific state:** if you add a new mode, follow the existing split — in-memory `games` map for live state, a dedicated `*MatchRepository` for persisted results, and parallel leaderboard endpoints in `mtgRoutes.ts`.
