# Architecture Lock Contract

The following constraints are immutable unless explicitly changed by product owner:

1. World topology remains linear obby.
2. Obstacle difficulty remains fixed (no dynamic obstacle balancing).
3. Math challenge selection remains adaptive weighted-random.
4. Single-player mode is always available.
5. Multiplayer includes only Co-op and Race.
6. Multiplayer runs in the same 3D world model.
7. Multiplayer access is only through private invite rooms.
8. Subscription status is validated server-side (never trusted from client-only checks).
9. Backend stack is Supabase Auth + Postgres + Realtime.
10. Avatar modularity limited to idle/run/jump animation states.
11. UI prioritizes mobile-first responsiveness.
12. Project must remain PWA-installable.
