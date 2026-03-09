export type Side = 'A' | 'B'

export interface TugQuestion {
  id: string
  prompt: string
  options: number[]
  correctIndex: number
  deadlineMs: number
}

export interface TugState {
  roomId: string
  rope: number // -100..100
  winner: Side | null
  question: TugQuestion | null
  scoreA: number
  scoreB: number
  round: number
  attempts: Partial<Record<Side, true>>
}

export type TugEvent =
  | { type: 'hello'; playerId: string; name: string; joinedAt: number }
  | { type: 'state'; state: TugState }
  | { type: 'answer'; playerId: string; side: Side; round: number; optionIndex: number; sentAt: number }
  | { type: 'reset'; by: string }
