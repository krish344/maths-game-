# Math Obby 3D (PWA Starter)

Mobile-first PWA scaffold for a **3D Math Obby** platform with immutable architecture constraints.

## Immutable Architecture (Locked)
- Linear obby world
- Fixed obstacle difficulty
- Adaptive weighted-random math engine
- Single player mode
- Multiplayer (Co-op + Race)
- Same 3D world multiplayer
- Private invite rooms only
- Subscription validation server-side
- Supabase backend (Auth + Postgres + Realtime)
- Modular avatar system (idle/run/jump only)
- Mobile-first design

## Tech
- React + TypeScript + Vite
- @react-three/fiber + drei (3D preview)
- Supabase JS client
- Zustand (state, ready to use)
- vite-plugin-pwa

## Run
```bash
npm install
npm run dev
```

## PWA
Manifest is configured in `vite.config.ts` via `vite-plugin-pwa`.
Generated icons:
- `public/pwa-192.png`
- `public/pwa-512.png`

## Supabase Setup
1. Create project in Supabase.
2. Copy `.env.example` to `.env` and fill values.
3. Apply schema from `supabase/schema.sql`.
4. Add edge function/webhook for **server-side subscription validation**.

## Suggested Next Build Steps
1. Implement player controller (idle/run/jump only).
2. Build linear obby level chunks with fixed obstacle patterns.
3. Wire adaptive question spawn from `src/lib/mathEngine.ts`.
4. Add invite-room flow (create/join by code) with Supabase Realtime.
5. Add race/co-op sync and finish-state validation server-side.
6. Gate play sessions by validated subscription state.
