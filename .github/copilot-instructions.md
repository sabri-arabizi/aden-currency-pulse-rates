## Purpose
This file gives AI coding agents the minimal, actionable context to work productively in this repo: architecture, run/build commands, conventions, and integration points.

## Big picture
- **Frontend:** Vite + React + TypeScript app (SPA) in `src/` — entry: [src/main.tsx](src/main.tsx#L1).
- **Backend:** lightweight Node Express server for local APIs in `backend/` — entry: [backend/src/server.js](backend/src/server.js#L1).
- **Supabase:** hosted DB + serverless functions under `supabase/functions/` used for scheduled updates and imports.
- **Mobile / Native:** Capacitor integration (see `capacitor.config.ts`) with Android project in `android/` and native plugins under `capacitor-cordova-android-plugins/`.

## How to run (developer workflows)
- Frontend dev: `npm run dev` (root `package.json`) — runs Vite dev server. See [package.json](package.json#L1).
- Frontend build: `npm run build` or `npm run build:dev` for development build.
- Backend dev: `cd backend && npm run dev` (uses `nodemon` to restart on changes). See [backend/package.json](backend/package.json#L1).
- Preview production build: `npm run preview` (Vite preview).
- Mobile build: use Capacitor tooling + Android Studio — the Android project is in `android/`; run `npx cap sync` then open Android Studio.

## Key integrations & data flow
- Frontend fetches primary data through the API base defined in [src/lib/api.ts](src/lib/api.ts#L1). Default API_BASE falls back to `http://localhost:3000`.
- Many UI data hooks read directly from Supabase via `src/integrations/supabase/client.ts` and the table-backed hooks in `src/hooks/` (examples: `useExchangeRates`, `useGoldPrices`).
- Scheduled/automated updates and transformations live in `supabase/functions/` (look for `update-*` jobs). These are authoritative for price updates.

## Project-specific conventions & patterns
- Data hooks: use `@tanstack/react-query` for polling and caching. Look at `src/hooks/useExchangeRates.ts` and `src/hooks/useGoldPrices.ts` for patterns (queryKey structure, `refetchInterval`, `staleTime`).
- Supabase usage: `supabase` client is generated and stored at `src/integrations/supabase/client.ts` — code reads/writes directly to tables (no REST proxy). Prefer this client for DB access.
- Components: small, focused presentational components in `src/components/` and feature components in `src/pages/`.
- Native integrations: Unity Ads helpers exist in `src/lib/capacitorUnityAds.ts` and `src/lib/unityAds.ts` — follow their APIs when adding native ad interactions.

## Important files to inspect when troubleshooting
- App entry & styles: [src/main.tsx](src/main.tsx#L1), [src/App.tsx](src/App.tsx#L1), [src/index.css](src/index.css#L1)
- API helpers: [src/lib/api.ts](src/lib/api.ts#L1)
- Supabase client: [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts#L1)
- Hooks: `src/hooks/` (useExchangeRates, useGoldPrices, useRefreshCounter)
- Supabase functions: `supabase/functions/` — these scripts run scheduled updates and should be treated as authoritative for price calculations.

## Security & secrets
- The repo contains a generated Supabase client with a publishable key; this is intended for client use. Do not expect server-private keys here. For any secret changes check the deployment/host (Supabase project settings).

## When editing or adding features
- Follow existing hook patterns: create a typed interface in the hook file, use `useQuery` with a descriptive `queryKey`, and set sensible `refetchInterval`/`staleTime`.
- When adding backend endpoints, keep them in `backend/src/` and mirror `API_BASE` paths used by `src/lib/api.ts`.
- For scheduled data updates, prefer adding or modifying functions under `supabase/functions/` and test locally against a dev Supabase instance if possible.

## Quick diagnostics checklist
- If UI shows stale or missing rates — check `useExchangeRates` logs, Supabase table (`exchange_rates`) and recent runs of `supabase/functions/update-*`.
- If fetches fail locally — confirm `VITE_API_BASE` env or that `backend` server is running at `http://localhost:3000`.
- Android/Capacitor: run `npx cap sync` after native dependency changes, then open `android/` in Android Studio.

## Contact / follow-ups
If anything in this guide is unclear or you want me to expand a section (e.g., sample PR checklist, testing instructions, or specific file walkthroughs), tell me which area to expand.
