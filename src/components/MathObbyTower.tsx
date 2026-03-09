import { useMemo, useState } from 'react'

type Q = { prompt: string; options: number[]; answer: number }

function makeQ(level: number): Q {
  const max = Math.min(10 + level * 2, 30)
  const a = Math.floor(Math.random() * max) + 1
  const b = Math.floor(Math.random() * max) + 1
  const op = level >= 4 && Math.random() > 0.45 ? 'x' : '+'
  const answer = op === 'x' ? a * Math.min(12, b) : a + b
  const prompt = op === 'x' ? `${a} × ${Math.min(12, b)} = ?` : `${a} + ${b} = ?`

  const options = [answer]
  while (options.length < 3) {
    const d = Math.floor(Math.random() * 9) + 1
    const wrong = Math.max(1, answer + (Math.random() > 0.5 ? d : -d))
    if (!options.includes(wrong)) options.push(wrong)
  }
  options.sort(() => Math.random() - 0.5)

  return { prompt, options, answer }
}

export default function MathObbyTower() {
  const [floor, setFloor] = useState(1)
  const [lives, setLives] = useState(3)
  const [coins, setCoins] = useState(0)
  const [streak, setStreak] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [msg, setMsg] = useState('Pick the correct gate to climb the obby tower!')
  const [q, setQ] = useState<Q>(() => makeQ(1))

  const targetFloor = 15
  const won = floor > targetFloor

  const level = useMemo(() => Math.min(10, Math.floor((floor - 1) / 2) + 1), [floor])

  const chooseGate = (value: number) => {
    if (gameOver || won) return

    if (value === q.answer) {
      const nextStreak = streak + 1
      const bonus = nextStreak >= 3 ? 2 : 0
      setFloor((f) => f + 1)
      setCoins((c) => c + 5 + bonus)
      setStreak(nextStreak)
      setMsg(nextStreak >= 3 ? 'Perfect streak! Speed boost activated ⚡' : 'Nice jump! You crossed the gate ✅')
      setQ(makeQ(level + 1))
      return
    }

    const nextLives = lives - 1
    setLives(nextLives)
    setStreak(0)
    setMsg('Oops! Wrong gate. You slipped on the obby ❌')
    if (nextLives <= 0) {
      setGameOver(true)
      return
    }
    setQ(makeQ(level))
  }

  const reset = () => {
    setFloor(1)
    setLives(3)
    setCoins(0)
    setStreak(0)
    setGameOver(false)
    setMsg('Pick the correct gate to climb the obby tower!')
    setQ(makeQ(1))
  }

  return (
    <div className="mini-game">
      <h3>🧱 Math Obby Tower (Roblox-style)</h3>
      <p>{msg}</p>

      <div className="mini-stats">
        <span>Floor: {Math.min(floor, targetFloor)}/{targetFloor}</span>
        <span>Lives: {'❤️'.repeat(Math.max(0, lives))}</span>
      </div>
      <div className="mini-stats">
        <span>Coins: 🪙 {coins}</span>
        <span>Streak: {streak}</span>
      </div>

      <div style={{ height: 14, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.min(100, ((floor - 1) / targetFloor) * 100)}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #06b6d4, #4f46e5)',
            transition: 'width 240ms ease',
          }}
        />
      </div>

      {won ? (
        <div className="snake-status" style={{ fontSize: 18, fontWeight: 900 }}>
          🎉 Tower Cleared! You reached the top obby platform.
          <div style={{ marginTop: 8 }}>
            <button onClick={reset}>Play Again</button>
          </div>
        </div>
      ) : gameOver ? (
        <div className="snake-status" style={{ fontSize: 18, fontWeight: 900 }}>
          💥 You fell from the obby. Try again!
          <div style={{ marginTop: 8 }}>
            <button onClick={reset}>Retry Tower</button>
          </div>
        </div>
      ) : (
        <>
          <div className="snake-question-card">
            <div className="snake-question-title">Floor {floor} • Gate Challenge</div>
            <div className="snake-question">{q.prompt}</div>
          </div>

          <div className="options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {q.options.map((o, i) => (
              <button key={`${o}-${i}`} onClick={() => chooseGate(o)} style={{ minHeight: 68, fontSize: 24, fontWeight: 900 }}>
                🚪 {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
