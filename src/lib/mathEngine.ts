type Difficulty = 'easy' | 'medium' | 'hard'

export interface MathQuestion {
  id: string
  prompt: string
  options: number[]
  answer: number
  difficulty: Difficulty
  topic: 'addition' | 'subtraction' | 'multiplication' | 'division'
}

const weightedPool: Record<Difficulty, number> = {
  easy: 0.55,
  medium: 0.3,
  hard: 0.15,
}

function pickDifficulty(accuracy: number): Difficulty {
  if (accuracy > 0.85) return Math.random() < 0.45 ? 'hard' : 'medium'
  if (accuracy < 0.55) return Math.random() < 0.75 ? 'easy' : 'medium'

  const r = Math.random()
  let acc = 0
  for (const [level, weight] of Object.entries(weightedPool) as [Difficulty, number][]) {
    acc += weight
    if (r <= acc) return level
  }
  return 'medium'
}

export function nextQuestion(playerAccuracy = 0.7): MathQuestion {
  const difficulty = pickDifficulty(playerAccuracy)
  const base = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 30 : 80
  const a = Math.floor(Math.random() * base) + 1
  const b = Math.floor(Math.random() * base) + 1
  const answer = a + b
  const options = [answer, answer + 1, answer - 1, answer + 3].sort(() => Math.random() - 0.5)

  return {
    id: crypto.randomUUID(),
    prompt: `${a} + ${b} = ?`,
    options,
    answer,
    difficulty,
    topic: 'addition',
  }
}
