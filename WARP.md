# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository layout

This project is a Magic: The Gathering card guessing game composed of two separate Node/TypeScript projects:

- `backend/`: Express + TypeScript API server that encapsulates all game logic, persistence, and coin systems.
- `frontend/`: React + TypeScript single-page app (Create React App) that implements the UI, game flows, authentication, coins UI, and leaderboards.

Each side is developed and deployed independently but communicates over HTTP via a REST API.

## Development commands

All commands below are intended to be run from the repository root unless stated otherwise.

### Backend (Express / TypeScript API)

Change into the backend project first:

- Install dependencies:
  - `cd backend && npm install`
- Run development server with auto-reload:
  - `cd backend && npm run dev`
- Run the API directly (no dev reload):
  - `cd backend && npm start`
- Type-check and build TypeScript:
  - `cd backend && npm run build`

Notes:
- The backend listens on `process.env.PORT` or `3001` by default (see `backend/src/app.ts`).
- A MongoDB instance is required; connection is configured via `MONGODB_URI` in the backend environment.

### Frontend (React / CRA)

Change into the frontend project first:

- Install dependencies:
  - `cd frontend && npm install`
- Run development server:
  - `cd frontend && npm start`
- Build production bundle:
  - `cd frontend && npm run build`
- Run tests (Jest via `react-scripts`):
  - `cd frontend && npm test`

Notes:
- The frontend expects `REACT_APP_API_URL` to point at the backend API (e.g., `http://localhost:3001`) and Auth0-related variables (see **Environment & configuration**).
- To focus on a single test when they exist, use Jest’s built-in filtering, for example by running `npm test` and using the interactive watch mode to filter by test name.

### Running the full stack locally

Typical local development uses two terminals:

1. Terminal A (API): `cd backend && npm run dev`
2. Terminal B (UI): `cd frontend && npm start`

Ensure the frontend’s `REACT_APP_API_URL` matches the backend URL/port in use.

## Environment & configuration

### Backend

Backend configuration is driven primarily by environment variables:

- `MONGODB_URI`: connection string for MongoDB Atlas/instance. Required; `backend/src/app.ts` will throw on startup if this is missing.
- `PORT` (optional): port for the Express server; defaults to `3001`.
- `NODE_ENV` (optional): used to decide whether to include detailed error objects in some controllers.

Other configuration is defined in code:

- Daily cards are stored in MongoDB via `backend/src/repositories/dailyCardRepository.ts`. On startup, `backend/src/app.ts` seeds a fixed list of daily cards into this collection using `dailyCardRepo.setDailyCard`.
- Hint configuration (available hint types, costs, descriptions) is centralized in `backend/src/config/hintConfig.ts` and consumed by `backend/src/services/hintService.ts`.
- Ad system configuration (ad types, rate limits, bonuses) is centralized in `backend/src/config/adConfig.ts` and consumed by `backend/src/controllers/adController.ts` and `backend/src/services/adService.ts`.

### Frontend

The frontend uses Create React App environment variables (all must be prefixed with `REACT_APP_`):

- `REACT_APP_API_URL`: base URL of the backend API (used throughout services such as `src/services/mtgApi.ts`, `src/services/coinsApi.ts`, and hooks like `src/hooks/useDailyPlayedDates.ts`).
- `REACT_APP_AUTH0_DOMAIN`, `REACT_APP_AUTH0_CLIENT_ID`, `REACT_APP_AUTH0_AUDIENCE`: used for Auth0 authentication flows in `src/components/Login.tsx`.

There is a `.env` file under `frontend/` in this repo that illustrates expected keys. Do not rely on its concrete values in new code; treat them as local/dev examples.

## High-level backend architecture

### Overview

The backend is a TypeScript Express app organized along typical layered boundaries:

- **Entry point:** `backend/src/app.ts`
- **Routing layer:** `backend/src/routes/*`
- **Controller layer:** `backend/src/controllers/*`
- **Services layer:** `backend/src/services/*`
- **Persistence layer:** `backend/src/repositories/*` (Mongoose models and query helpers)
- **Domain types/config:** `backend/src/types/*`, `backend/src/config/*`, plus various utility modules under `backend/src/utils/*`.

`app.ts` is responsible for:

- Loading environment via `dotenv`.
- Connecting to MongoDB using `MONGODB_URI`.
- Attaching middlewares (`body-parser`, `cors`).
- Wiring main route groups:
  - `/api` → MTG game routes via `setRoutes` from `src/routes/mtgRoutes.ts`.
  - `/api/coins` → coins API routes from `src/routes/coinsRoutes.ts`.
  - `/api/ads` → ad-related routes from `src/routes/adRoutes.ts`.
- Seeding initial “daily” cards into Mongo via `dailyCardRepo.setDailyCard` when the server starts.

### Game core & Scryfall integration

The primary gameplay endpoints are defined in `backend/src/controllers/mtgController.ts` and wired in `backend/src/routes/mtgRoutes.ts`:

- **Game lifecycle endpoints:**
  - `POST /api/new-game` — starts a normal game based on difficulty (easy/medium/hard) using a curated list from `cardDifficulties` and fetches card data from `ScryfallService`.
  - `POST /api/new-text-game` — starts a “text mode” game; the selected card’s rules text is censored via `maskCardNameInText` before being sent to the client.
  - `POST /api/new-blur-game` — starts a “blur mode” game; stores blur-related metadata (`initialBlur`, `blurReduction`, `maxBlurAttempts`) in an in-memory `games` map.
  - `GET /api/blur-game/:gameId` — reads blur game status (without revealing the card) from the same `games` map.
  - `GET /api/daily-game` — daily-mode game; determines the daily card for a given date via `dailyCardRepo.getDailyCard` and Scryfall lookup.
- **Guessing & feedback:**
  - `POST /api/guess` — core guess endpoint; delegates comparison logic to `mtgGameService.processGuessCard`, logs attempts, and maps known error messages to HTTP status codes.
  - Older generic MTG API logic is encapsulated in `backend/src/services/mtgService.ts` (simple wrapper around `https://api.magicthegathering.io/v1/cards` with a basic `validateGuess` helper). Newer flows instead use `ScryfallService` (not shown here but widely imported).
- **Hint system:**
  - `POST /api/request-hint` — validates input via `validateHintRateLimit` and `validateHintRequest` middleware; uses `hintService` to compute a hint value (mana cost or card type) for the current game’s target card; charges user coins via `coinsRepository.spendCoins` and returns updated balance.
  - `GET /api/available-hints` — exposes supported hint types and their costs from `hintService.getAvailableHints()`.

Game sessions for normal/text/blur modes are held in-memory in the `games` object keyed by `gameId`. Persistent stats and leaderboards rely on Mongo collections managed by repositories.

### Persistence & repositories

Data is stored in MongoDB using Mongoose schemas defined under `backend/src/repositories` and `backend/src/types`:

- **Matches:** `matchRepository.ts` defines the `Match` model used for normal games. It exposes methods to `saveMatch`, query matches for a user, and build simple aggregate leaderboards.
- **Daily matches:** `dailyMatchRepository` (not shown here but referenced in multiple services) stores daily-game results and supports queries like `getPlayedDates(userId)` and `getAllByUser(userId)`.
- **Daily cards:** `dailyCardRepository.ts` stores a `date` → `cardName` mapping; used by both seeding at startup and the daily game flow.
- **Coins:** `coinsRepository.ts` manages two collections — `CoinTransaction` (per-transaction log) and `UserCoins` (current balance and totals). It provides methods to:
  - Initialize or retrieve a user’s coin record on demand (`getUserCoins`).
  - Add and spend coins, always recording a corresponding transaction (`addCoins`, `spendCoins`).
  - Aggregate daily coin earnings/spend via Mongo aggregation.
  - Inspect stats and reset balances.

Other repositories (e.g., for blur/text matches or ad tracking) follow a similar pattern: a dedicated Mongoose schema/model and a small class that wraps common queries.

### Coins system

The coins system underpins hints and game rewards:

- All coin balances and transactions are written via `coinsRepository`.
- `CoinsController` (not shown, see `src/routes/coinsRoutes.ts`) exposes a public HTTP API under `/api/coins` for the frontend:
  - Balance and stats: `GET /api/coins/:userId`, `GET /api/coins/:userId/stats`.
  - History and statements: `GET /api/coins/:userId/history`, `GET /api/coins/:userId/statement`.
  - Mutation endpoints: `POST /api/coins/add`, `POST /api/coins/spend`, `POST /api/coins/reward`, plus `PUT /api/coins/:userId/reset` for resets.

The **ad system** is layered similarly:

- `AdController` handles `GET /api/ads/availability/:userId`, `POST /api/ads/watch`, `GET /api/ads/stats/:userId`, and `GET /api/ads/config`.
- `adService` (not shown) tracks view limits, cooldowns, and computes base/bonus rewards per ad type using `AD_CONFIG`.
- Successful ad views reward coins via `coinsRepository.addCoins` and return the new balance to the client, so the UI can animate coin gains.

### Stats & leaderboards

User stats and leaderboards are built on top of stored match/daily data:

- `userStatsService.ts` aggregates:
  - Normal games from `matchRepository`.
  - Daily games from `dailyMatchRepository`.
  - Computes totals, best attempts/time, averages, last played card/date, streaks, and a list of all guessed cards.
  - Exposed via `GET /api/user-stats/:userId` in `MtgController`.
- `leaderboardService.ts` builds multiple leaderboards using Mongo aggregation pipelines:
  - Normal games leaderboard: `getNormalLeaderboard` aggregates games per user and computes averages and bests.
  - Daily leaderboard: `getDailyLeaderboard` aggregates daily games and computes current/longest streaks by analyzing distinct dates.
  - Speed/perfect leaderboards: `getSpeedLeaderboard` and `getPerfectLeaderboard` select fastest/best-attempt runs across normal/daily games.

Separate repositories/services for blur and text game leaderboards feed the blur/text-specific endpoints exposed via `mtgRoutes.ts`.

## High-level frontend architecture

### Overview

The frontend is a React + TypeScript SPA structured around:

- A root `App` component that manages global theme, authentication state, and main routing.
- Page-level components in `src/pages/` (`Home`, `LeaderboardsPage`, `StartGame`).
- UI building blocks in `src/components/` (guess input, history, modals, ads, leaderboards, profile, coins, etc.).
- Context providers under `src/contexts/` (notably `CoinsContext`) for cross-cutting state.
- Service modules under `src/services/` that encapsulate all HTTP calls to the backend.
- Small config/hooks modules (`src/config/adConfig.ts`, `src/hooks/useDailyPlayedDates.ts`).

Material UI (`@mui/material`) is used heavily for layout and theming, and React Router is used for navigation.

### App shell, theming & routing

`frontend/src/App.tsx` is the main composition root:

- Manages a light/dark theme using an MUI `ThemeProvider` and a `getTheme(mode)` helper that tunes typography, palettes, and component overrides for this game.
- Holds authentication state (`token`, `userId`, `name`, `email`) in local React state and persists it to `localStorage` if the user is not a guest.
- Renders a full-screen **Login** experience when there is no `token` or `userId`. The `Login` component handles Auth0 flows and calls back to `App` via `onLoginSuccess`.
- Once logged in, wraps the UI in `CoinsProvider` (coin context) and global layout:
  - Toggles theme via a floating icon button.
  - Shows `CoinDisplay` for current balance and opens a `CoinStatement` dialog for detailed coin history.
  - Shows a profile icon that opens the `MeuPerfil` dialog, which combines game stats (from `/api/user-stats`) and coin stats (from `/api/coins/:userId/stats`).
- Sets up routing with `BrowserRouter`:
  - `/` → `Home` (main game screen; props include `userId`, `name`, `email`, and theme state handlers).
  - `/leaderboards` → `LeaderboardsPage`, which just renders the `Leaderboards` component.

### Game flows (Home + StartGame + core components)

`frontend/src/pages/Home.tsx` orchestrates the various game modes and is the key hub where many backend integrations converge:

- Maintains the current game state: `gameStarted`, `gameId`, `targetCard`, `guesses`, timing, wrong guess counts, and whether the player has won.
- Supports multiple modes, all triggered via the `StartGame` component:
  - **Normal mode:** `StartGame` calls `POST /api/new-game` to get a `cardName` and `gameId`; `Home` then uses `CardGuess` and `GuessHistory` to drive the guess loop.
  - **Daily mode:** `StartGame` calls `GET /api/daily-game` with `userId` and a selected date; `Home` switches into a “Carta do Dia” UI with stricter hint gating.
  - **Text mode:** `StartGame` calls `POST /api/new-text-game`; `Home` displays a `TextCard` component that shows censored card text while guesses go through the same backend `/api/guess` flow.
  - **Blur mode:** `StartGame` calls `POST /api/new-blur-game`; `Home` uses `BlurredCard` to display an image that becomes progressively less blurred based on feedback from guesses.
- **Guess submission:**
  - The `CardGuess` component is a MUI-powered form with an autocomplete input (`fetchCardNames` service) and submit button.
  - On submit it calls `guessCard` from `src/services/mtgApi.ts`, which posts to `${REACT_APP_API_URL}/api/guess` with the current `gameId`, player identity, attempts, and time spent.
  - `Home` inspects the response’s `feedback` to update hints, blur levels, and to detect when the guess is correct, at which point it shows `VictoryScreen` and may trigger an interstitial ad.
- **Hints in the UI:**
  - For normal/daily modes, hints (flavor text and effect text) are released after specific error thresholds (e.g., after 2 or 5 wrong guesses).
  - For text mode, the `TextCard` component can call `requestHint` (`/api/request-hint`) to reveal mana cost or card type at the cost of coins.

`frontend/src/pages/StartGame.tsx` is responsible for difficulty selection and starting each mode:

- Difficulty (`easy` / `medium` / `hard`) is chosen via a `ToggleButtonGroup` and sent to the backend for all modes.
- Normal mode: `POST /api/new-game`.
- Text mode: `POST /api/new-text-game` (returns card text, type, mana cost, and flags like `hasCensoredContent`).
- Blur mode: `POST /api/new-blur-game` (returns initial blur level and per-guess blur reduction).
- Daily mode:
  - Uses a MUI `DatePicker` and a custom `useDailyPlayedDates` hook to visually mark dates already played (via `GET /api/daily-played-dates/:userId`).
  - Enforces local validation to prevent selecting future dates, mirroring backend checks in `MtgController.dailyGame`.

### Coins & profile UI

Coin-related frontend logic is concentrated in a few modules:

- `frontend/src/contexts/CoinsContext.tsx` holds the canonical client-side coin state:
  - Exposes `balance`, `refreshBalance()` (calls `coinsApi.getUserCoins`), and `animateCoinsGain()` for transitional UI.
  - Tracks and exposes a simple animation state (`coinAnimation`) that `CoinDisplay` uses to show floating `+N` indicators after rewards.
- `frontend/src/services/coinsApi.ts` is the single interface for calling the coins API:
  - Balance/stat endpoints (`getUserCoins`, `getUserCoinStats`).
  - Transaction history and statements (`getCoinHistory`, `getCoinStatement`).
  - Mutation endpoints (`addCoins`, `spendCoins`, `rewardUser`) mirroring backend routes under `/api/coins`.
- `frontend/src/components/CoinDisplay.tsx` shows the user’s balance as a floating MUI `Chip` and triggers the statement dialog.
- `frontend/src/components/CoinStatement.tsx` renders a rich “bank statement” view with summary cards, earnings per reason, recent transactions, and a date-collapsed history.
- `frontend/src/components/MeuPerfil.tsx` combines game stats from `/api/user-stats/:userId` with coin stats from `coinsApi.getUserCoinStats` and surfaces them in a compact profile dialog.


### Leaderboards & stats UI

Leaderboard and stats UIs are centralized under `frontend/src/components/Leaderboards.tsx` and associated services:

- `Leaderboards` renders multiple tabs for:
  - Normal games.
  - Daily games.
  - Blur overall, Blur speed, Blur perfect.
  - Global speed and perfect leaderboards (switchable between normal and daily games).
- Each tab loads its dataset via functions from `src/services/leaderboardApi.ts` (not shown), which call the appropriate backend endpoints defined in `mtgRoutes.ts`.
- `LeaderboardsPage.tsx` simply wraps `Leaderboards` in a standalone route so `/leaderboards` can be linked or opened directly from the game UI.

## How to extend or modify behavior safely

When making non-trivial changes, prefer working with the existing layering:

- For new API behavior, add or extend a **service** under `backend/src/services/` and expose it via a **controller** (`backend/src/controllers`) and **route** (`backend/src/routes`). Keep persistence concerns in a dedicated repository under `backend/src/repositories`.
- For new UI features, keep HTTP calls inside `frontend/src/services/*` and pass data into components via props/context rather than calling `fetch` directly in components. This keeps the contract between frontend and backend centralized.
- When modifying coins or ads logic, go through the existing abstractions (`coinsRepository`, `AdController`/`adService`, `CoinsContext`, `coinsApi`) so rewards, balances, and rate limits stay consistent across modes and surfaces.
