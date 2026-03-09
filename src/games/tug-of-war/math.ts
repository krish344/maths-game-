import type { TugQuestion } from './types'

export function makeQuestion(round: number): TugQuestion {
  const max = Math.min(12 + round, 30)
  const a = Math.floor(Math.random() * max) + 1
  const b = Math.floor(Math.random() * max) + 1
  const answer = a + b
  const options = [answer]

  while (options.length < 4) {
    const wrong = Math.max(1, answer + Math.floor(Math.random() * 13) - 6)
    if (!options.includes(wrong)) options.push(wrong)
  }

  options.sort(() => Math.random() - 0.5)
  const correctIndex = options.findIndex((n) => n === answer)
  const seconds = 8 + Math.floor(Math.random() * 5) // 8-12s

  return {
    id: crypto.randomUUID(),
    prompt: `${a} + ${b} = ?`,
    options,
    correctIndex,
    deadlineMs: Date.now() + seconds * 1000,
  }
}
