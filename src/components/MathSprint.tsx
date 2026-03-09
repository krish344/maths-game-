import { useEffect, useState } from 'react'

function makeQuestion() {
  const a = Math.floor(Math.random() * 20) + 1
  const b = Math.floor(Math.random() * 20) + 1
  const answer = a + b
  const options = [answer, answer + 1, answer - 1, answer + 3].sort(() => Math.random() - 0.5)
  return { prompt: `${a} + ${b} = ?`, answer, options }
}

export default function MathSprint() {
  const [q, setQ] = useState(makeQuestion())
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(45)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started || time <= 0) return
    const id = setInterval(() => setTime((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [started, time])

  const pick = (value: number) => {
    if (!started || time <= 0) return
    if (value === q.answer) setScore((s) => s + 10)
    else setScore((s) => Math.max(0, s - 5))
    setQ(makeQuestion())
  }

  const start = () => {
    setStarted(true)
    setScore(0)
    setTime(45)
    setQ(makeQuestion())
  }

  return (
    <div className="mini-game">
      <h3>Math Sprint</h3>
      <p>Solve as many sums as you can in 45 seconds.</p>
      <div className="mini-stats">
        <span>Score: {score}</span>
        <span>Time: {time}s</span>
      </div>
      {!started || time <= 0 ? (
        <button onClick={start}>{time <= 0 ? 'Play Again' : 'Start Sprint'}</button>
      ) : (
        <>
          <p className="question">{q.prompt}</p>
          <div className="options-grid">
            {q.options.map((o) => (
              <button key={o} onClick={() => pick(o)}>
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
