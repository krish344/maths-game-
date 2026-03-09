export const IMMUTABLE_ARCHITECTURE = {
  world: 'Linear obby world',
  obstacleDifficulty: 'Fixed',
  mathEngine: 'Adaptive weighted-random',
  modes: ['Single Player', 'Co-op', 'Race'],
  multiplayerWorld: 'Same 3D world',
  rooms: 'Private invite rooms only',
  backend: 'Supabase (Auth + Postgres + Realtime)',
  avatar: 'Modular avatar (idle/run/jump only)',
  design: 'Mobile-first',
  pwa: true,
} as const

export type GameMode = 'single' | 'coop' | 'race'
