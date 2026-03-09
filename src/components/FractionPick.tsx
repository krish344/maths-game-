import { useState } from 'react'

type Item = { prompt: string; answer: string; options: string[] }

function nextItem(): Item {
  const pool: Item[] = [
    { prompt: 'Which fraction is equal to 1/2?', answer: '2/4', options: ['2/4', '3/4', '1/3', '4/5'] },
    { prompt: 'Which fraction is equal to 3/4?', answer: '6/8', options: ['6/8', '3/8', '5/8', '2/6'] },
    { prompt: 'Which fraction is equal to 2/3?', answer: '4/6', options: ['4/6', '3/6', '2/6', '5/9'] },
  ]
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function FractionPick() {
  const [item, setItem] = useState<Item>(nextItem())
  const [score, setScore] = useState(0)
  const [rounds, setRounds] = useState(0)

  const done = rounds >= 8

  const choose = (v: string) => {
    if (done) return
    if (v === item.answer) setScore((s) => s + 1)
    setRounds((r) => r + 1)
    setItem(nextItem())
  }

  const reset = () => {
    setScore(0)
    setRounds(0)
    setItem(nextItem())
  }

  return (
    <div className="mini-game">
      <h3>Fraction Pick</h3>
      <p>Choose equivalent fractions. 8 rounds.</p>
      <div className="mini-stats">
        <span>Score: {score}</span>
        <span>Round: {Math.min(rounds + 1, 8)}/8</span>
      </div>
      {done ? (
        <>
          <p className="question">Great! Final score: {score}/8</p>
          <button onClick={reset}>Play Again</button>
        </>
      ) : (
        <>
          <p className="question">{item.prompt}</p>
          <div className="options-grid">
            {item.options.map((o) => (
              <button key={o} onClick={() => choose(o)}>
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
