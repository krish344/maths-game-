import { useEffect, useState } from 'react'

type Question = {
  prompt: string
  options: string[]
  answer: string
  hint: string
}

const QUESTIONS: Question[] = [
  { prompt: 'Average of 10, 20, 30 = ?', options: ['20', '30', '15'], answer: '20', hint: 'Sum is 60, count is 3.' },
  { prompt: 'Average of 5, 15, 25 = ?', options: ['10', '15', '20'], answer: '15', hint: '45 ÷ 3' },
  { prompt: 'Average of 8, 10, 12, 14 = ?', options: ['11', '12', '10'], answer: '11', hint: '44 ÷ 4' },
  { prompt: 'Sum = 48 and count = 6. Average = ?', options: ['8', '7', '9'], answer: '8', hint: '48 ÷ 6' },
  { prompt: 'Average of 30, 40, 50 = ?', options: ['40', '35', '45'], answer: '40', hint: '120 ÷ 3' },
  { prompt: 'Average formula is...', options: ['Sum ÷ Count', 'Count ÷ Sum', 'Sum × Count'], answer: 'Sum ÷ Count', hint: 'Total divided by number of values.' },
  { prompt: 'Average of equal numbers 12, 12, 12 is...', options: ['12', '36', '4'], answer: '12', hint: 'Average remains same.' },
  { prompt: 'Average of 9 and 15 = ?', options: ['12', '11', '13'], answer: '12', hint: '(9+15) ÷ 2' },
  { prompt: 'Marks: 60, 70, 80. Average = ?', options: ['70', '75', '65'], answer: '70', hint: '210 ÷ 3' },
  { prompt: 'Steps: 4000, 5000, 6000. Average = ?', options: ['5000', '4500', '5500'], answer: '5000', hint: '15000 ÷ 3' },
]

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function AverageQuest() {
  const [started, setStarted] = useState(false)
  const [time, setTime] = useState(60)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [idx, setIdx] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [deck, setDeck] = useState<Question[]>(() => shuffled(QUESTIONS))

  useEffect(() => {
    if (!started || time <= 0) return
    const id = setInterval(() => setTime((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [started, time])

  const current = deck[idx % deck.length]

  const start = () => {
    setDeck(shuffled(QUESTIONS))
    setIdx(0)
    setScore(0)
    setStreak(0)
    setTime(60)
    setFeedback('')
    setStarted(true)
  }

  const pick = (choice: string) => {
    if (!started || time <= 0) return
    if (choice === current.answer) {
      const nextStreak = streak + 1
      setStreak(nextStreak)
      const bonus = nextStreak >= 3 ? 5 : 0
      setScore((s) => s + 10 + bonus)
      setFeedback(nextStreak >= 3 ? 'Correct! Streak bonus +5' : 'Correct! +10')
    } else {
      setStreak(0)
      setScore((s) => Math.max(0, s - 5))
      setFeedback(`Try again: ${current.hint}`)
    }
    setIdx((i) => i + 1)
  }

  return (
    <div className="mini-game">
      <h3>Average Quest (Grade 5)</h3>
      <p>Solve average questions fast. Build streak for bonus points.</p>
      <div className="mini-stats">
        <span>Score: {score}</span>
        <span>Streak: {streak}</span>
        <span>Time: {time}s</span>
      </div>

      {!started || time <= 0 ? (
        <button onClick={start}>{time <= 0 ? 'Play Again' : 'Start Average Quest'}</button>
      ) : (
        <>
          <p className="question">{current.prompt}</p>
          <div className="options-grid">
            {current.options.map((o) => (
              <button key={o} onClick={() => pick(o)}>{o}</button>
            ))}
          </div>
          {feedback ? <p style={{ marginTop: 10, color: '#0f172a', fontWeight: 700 }}>{feedback}</p> : null}
        </>
      )}
    </div>
  )
}
