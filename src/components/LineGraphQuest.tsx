import { useEffect, useState } from 'react'

type Question = {
  prompt: string
  options: string[]
  answer: string
  hint: string
}

const QUESTIONS: Question[] = [
  { prompt: 'Books Read: Mon=1, Tue=2, Wed=2, Thu=3, Fri=4. Highest day?', options: ['Tuesday', 'Thursday', 'Friday'], answer: 'Friday', hint: 'Find the largest value on the graph.' },
  { prompt: 'Plants grown: Mon=2, Tue=3, Wed=3, Thu=5, Fri=4. Lowest day?', options: ['Monday', 'Wednesday', 'Friday'], answer: 'Monday', hint: 'Look for the smallest value.' },
  { prompt: 'If a line goes UP from Tue to Wed, the value...', options: ['decreases', 'increases', 'stays zero'], answer: 'increases', hint: 'Up means bigger.' },
  { prompt: 'If two points are at same height, values are...', options: ['equal', 'random', 'missing'], answer: 'equal', hint: 'Same height = same number.' },
  { prompt: 'X-axis in a line graph usually shows...', options: ['time/days', 'colors', 'marks only'], answer: 'time/days', hint: 'Horizontal axis often shows time.' },
  { prompt: 'Y-axis usually shows...', options: ['values/amount', 'days only', 'student names'], answer: 'values/amount', hint: 'Vertical axis shows quantity.' },
  { prompt: 'Rainfall: Mon=4, Tue=6, Wed=5. From Mon to Tue it...', options: ['increased', 'decreased', 'stayed same'], answer: 'increased', hint: '4 to 6 goes up.' },
  { prompt: 'Scores: Mon=5, Tue=5, Wed=7. Equal days are...', options: ['Mon & Tue', 'Tue & Wed', 'Mon & Wed'], answer: 'Mon & Tue', hint: 'Same value pair.' },
  { prompt: 'Steps: Mon=3, Tue=4, Wed=6, Thu=5. Peak day?', options: ['Tuesday', 'Wednesday', 'Thursday'], answer: 'Wednesday', hint: 'Peak = highest point.' },
  { prompt: 'Main use of a line graph?', options: ['Show change over time', 'Show 3D shapes', 'Show only pictures'], answer: 'Show change over time', hint: 'It tracks trends over days/time.' },
]

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function LineGraphQuest() {
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
      <h3>Line Graph Quest (Grade 3)</h3>
      <p>Answer line graph questions quickly. Build streak for bonus points.</p>
      <div className="mini-stats">
        <span>Score: {score}</span>
        <span>Streak: {streak}</span>
        <span>Time: {time}s</span>
      </div>

      {!started || time <= 0 ? (
        <button onClick={start}>{time <= 0 ? 'Play Again' : 'Start Line Graph Quest'}</button>
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
