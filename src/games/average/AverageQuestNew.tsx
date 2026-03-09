import { useEffect, useState, useCallback } from 'react'

interface Question {
  type: string
  text: string
  numbers: number[]
  options: string[]
  answer: number
  hint: string
}

const QUESTIONS: Question[] = [
  { type: 'FIND THE AVERAGE', text: 'What is the average of 4, 8 and 12?', numbers: [4, 8, 12], options: ['6', '8', '10', '12'], answer: 1, hint: '(4+8+12) / 3 = 24 / 3' },
  { type: 'FIND THE AVERAGE', text: 'What is the average of 10, 20, 30 and 40?', numbers: [10, 20, 30, 40], options: ['20', '25', '30', '35'], answer: 1, hint: '(10+20+30+40) / 4 = 100 / 4' },
  { type: 'FIND THE AVERAGE', text: 'Average of 5, 10, 15, 20?', numbers: [5, 10, 15, 20], options: ['10', '12', '12.5', '15'], answer: 2, hint: '(5+10+15+20) / 4 = 50 / 4' },
  { type: 'FIND THE SUM', text: 'Average of 5 numbers is 8. What is their sum?', numbers: [], options: ['13', '35', '40', '45'], answer: 2, hint: 'Sum = Average x Count = 8 x 5' },
  { type: 'REAL LIFE', text: 'Riya scored 60, 70 and 80 in 3 tests. What is her average?', numbers: [60, 70, 80], options: ['65', '70', '75', '80'], answer: 1, hint: '(60+70+80) / 3 = 210 / 3' },
  { type: 'FIND THE AVERAGE', text: 'What is the average of 2, 4, 6, 8 and 10?', numbers: [2, 4, 6, 8, 10], options: ['5', '6', '7', '8'], answer: 1, hint: '(2+4+6+8+10) / 5 = 30 / 5' },
  { type: 'REAL LIFE', text: 'A shop sold 20, 30, 40 items in 3 days. Average daily sale?', numbers: [20, 30, 40], options: ['25', '28', '30', '35'], answer: 2, hint: '(20+30+40) / 3 = 90 / 3' },
  { type: 'FIND THE AVERAGE', text: 'Average of 100, 200 and 300?', numbers: [100, 200, 300], options: ['150', '180', '200', '250'], answer: 2, hint: '(100+200+300) / 3 = 600 / 3' },
  { type: 'FIND THE SUM', text: 'Average of 4 numbers is 15. What is their sum?', numbers: [], options: ['19', '45', '60', '75'], answer: 2, hint: 'Sum = 15 x 4' },
  { type: 'REAL LIFE', text: '5 students heights: 130, 135, 140, 145, 150 cm. Average?', numbers: [130, 135, 140, 145, 150], options: ['138', '140', '142', '145'], answer: 1, hint: '(130+135+140+145+150) / 5 = 700 / 5' },
]

const PRAISE = ['🎉 Excellent!', '⭐ Correct!', '🔥 Amazing!', '✅ Well done!']

function NumberBar({ numbers }: { numbers: number[] }) {
  if (!numbers.length) return null
  const sum = numbers.reduce((a, b) => a + b, 0)
  return (
    <div style={{
      background: '#101c50', borderRadius: 14, padding: '14px 16px',
      marginBottom: 16, border: '1.5px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 }}>
        {numbers.map((n, i) => (
          <div key={i} style={{
            background: 'linear-gradient(135deg, #1a2a8f, #2d3db5)',
            border: '2px solid #ffe045', borderRadius: 10,
            padding: '8px 14px', fontFamily: "'Fredoka One', cursive",
            fontSize: '1.2rem', color: '#ffe045', minWidth: 48, textAlign: 'center'
          }}>{n}</div>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#aab0e0' }}>
        Sum = <span style={{ color: '#60e0ff', fontWeight: 800 }}>{sum}</span>
        &nbsp;÷&nbsp;
        Count = <span style={{ color: '#60e0ff', fontWeight: 800 }}>{numbers.length}</span>
        &nbsp;=&nbsp;
        <span style={{ color: '#1ac46e', fontWeight: 800, fontSize: '1rem' }}>?</span>
      </div>
    </div>
  )
}

interface AverageQuestNewProps {
  onBack?: () => void
}

export default function AverageQuestNew({ onBack }: AverageQuestNewProps) {
  const [current, setCurrent]   = useState(0)
  const [score, setScore]       = useState(0)
  const [lives, setLives]       = useState(3)
  const [streak, setStreak]     = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null)
  const [gameOver, setGameOver] = useState(false)

  const q = QUESTIONS[current]
  const progress = (current / QUESTIONS.length) * 100
  const hearts = ['', '❤️', '❤️❤️', '❤️❤️❤️'][Math.max(0, lives)]

  const handleAnswer = useCallback((idx: number) => {
    if (answered) return
    setAnswered(true)
    setSelected(idx)

    if (idx === q.answer) {
      const bonus = streak >= 2 ? 15 : 10
      setScore(s => s + bonus)
      setStreak(s => s + 1)
      setFeedback({
        text: streak >= 2 ? `🔥 ${streak + 1}x Streak! +${bonus} pts!` : PRAISE[Math.floor(Math.random() * PRAISE.length)],
        correct: true
      })
    } else {
      setLives(l => {
        const next = l - 1
        if (next <= 0) setTimeout(() => setGameOver(true), 800)
        return next
      })
      setStreak(0)
      setFeedback({ text: '❌ Not quite! Check the hint below.', correct: false })
      setShowHint(true)
    }
    setShowNext(true)
  }, [answered, q, streak])

  const nextQuestion = useCallback(() => {
    if (current + 1 >= QUESTIONS.length) { setGameOver(true); return }
    setCurrent(c => c + 1)
    setAnswered(false); setSelected(null)
    setFeedback(null); setShowNext(false); setShowHint(false)
  }, [current])

  const restart = useCallback(() => {
    setCurrent(0); setScore(0); setLives(3); setStreak(0)
    setAnswered(false); setSelected(null)
    setFeedback(null); setShowNext(false); setShowHint(false); setGameOver(false)
  }, [])

  useEffect(() => {
    if (gameOver) {
      try {
        const scores = JSON.parse(localStorage.getItem('obby_scores') || '{}')
        scores.average_new = Math.max(score, scores.average_new || 0)
        localStorage.setItem('obby_scores', JSON.stringify(scores))
      } catch { }
    }
  }, [gameOver, score])

  const total = QUESTIONS.length * 10
  const pct = score / total
  const stars = pct >= 0.8 ? '⭐⭐⭐' : pct >= 0.5 ? '⭐⭐' : '⭐'
  const endMsg = pct >= 0.8 ? '🏆 Average Master! Top of the class!' : pct >= 0.5 ? '📊 Good effort! Practice more!' : '💪 Keep going — you can do it!'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
        .av-root { font-family:'Nunito',sans-serif; background:#0d2b1b; color:#e8fff4; min-height:100vh; display:flex; flex-direction:column; align-items:center; }
        .av-root::before { content:''; position:fixed; inset:0; pointer-events:none; background:radial-gradient(ellipse at 20% 30%,#0a7a5a33 0%,transparent 60%),radial-gradient(ellipse at 80% 70%,#ffe04522 0%,transparent 60%); }
        .av-header { width:100%; background:linear-gradient(135deg,#0a5a3a,#1a8a5a); padding:14px 20px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 4px 20px #0007; position:sticky; top:0; z-index:10; }
        .av-back { background:rgba(255,255,255,0.15); border:none; border-radius:10px; padding:7px 14px; color:white; font-family:'Nunito',sans-serif; font-weight:700; font-size:0.9rem; cursor:pointer; transition:all 0.2s; }
        .av-back:hover { background:rgba(255,255,255,0.25); }
        .av-title { font-family:'Fredoka One',cursive; font-size:1.5rem; color:#ffe045; }
        .av-badge { background:#f59e0b; color:white; font-weight:800; padding:4px 14px; border-radius:20px; font-size:0.85rem; }
        .av-wrap { width:min(100%,680px); padding:16px; display:flex; flex-direction:column; gap:14px; }
        .av-stats { display:flex; gap:10px; }
        .av-stat { flex:1; background:#0a3d25; border-radius:14px; padding:10px; text-align:center; border:1.5px solid rgba(255,255,255,0.1); }
        .av-stat-val { font-family:'Fredoka One',cursive; font-size:1.7rem; color:#ffe045; }
        .av-stat-lbl { font-size:0.68rem; color:#6ee7b7; text-transform:uppercase; letter-spacing:1px; }
        .av-progress { background:rgba(255,255,255,0.1); border-radius:99px; height:9px; overflow:hidden; }
        .av-progress-fill { height:100%; background:linear-gradient(90deg,#1ac46e,#ffe045); border-radius:99px; transition:width 0.5s ease; }
        .av-card { background:#0a3d25; border-radius:22px; padding:22px; border:1.5px solid rgba(255,255,255,0.1); box-shadow:0 8px 32px rgba(0,0,0,0.4); }
        .av-qtype { font-size:0.72rem; color:#f59e0b; text-transform:uppercase; letter-spacing:2px; font-weight:800; margin-bottom:8px; text-align:center; }
        .av-qtext { font-size:1.1rem; font-weight:700; color:white; margin-bottom:16px; line-height:1.5; text-align:center; }
        .av-answers { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
        .av-ans { background:#0d4a2d; border:2px solid rgba(255,255,255,0.12); border-radius:14px; padding:13px 10px; font-family:'Nunito',sans-serif; font-size:0.95rem; font-weight:700; color:white; cursor:pointer; transition:all 0.18s; }
        .av-ans:hover:not(:disabled) { background:#1a6b3d; transform:translateY(-2px); border-color:#ffe045; }
        .av-ans:disabled { opacity:0.65; cursor:default; }
        .av-ans.correct { background:#14633d !important; border-color:#1ac46e !important; animation:av-pop 0.3s; }
        .av-ans.wrong { background:#6b1a1a !important; border-color:#e63946 !important; animation:av-shake 0.3s; }
        @keyframes av-pop { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes av-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .av-feedback { text-align:center; font-size:1rem; font-weight:800; min-height:28px; margin-bottom:8px; }
        .av-feedback.correct { color:#1ac46e; }
        .av-feedback.wrong { color:#e63946; }
        .av-hint { background:#1a3d25; border:1.5px solid #f59e0b44; border-radius:12px; padding:10px 14px; font-size:0.9rem; color:#fcd34d; margin-bottom:10px; text-align:center; }
        .av-next { width:100%; background:linear-gradient(135deg,#0a7a5a,#1ac46e); border:none; border-radius:16px; padding:14px; font-family:'Fredoka One',cursive; font-size:1.1rem; color:white; cursor:pointer; letter-spacing:1px; transition:all 0.2s; box-shadow:0 4px 16px rgba(26,196,110,0.4); }
        .av-next:hover { transform:translateY(-2px); }
        .av-hint-btn { width:100%; background:transparent; border:1.5px dashed #f59e0b66; border-radius:12px; padding:8px; font-family:'Nunito',sans-serif; font-size:0.85rem; color:#f59e0b; cursor:pointer; margin-bottom:8px; transition:all 0.2s; }
        .av-hint-btn:hover { background:#f59e0b11; }
        .av-end { text-align:center; padding:28px 16px; background:#0a3d25; border-radius:22px; border:1.5px solid rgba(255,255,255,0.1); }
        .av-end h2 { font-family:'Fredoka One',cursive; font-size:2rem; color:#ffe045; margin-bottom:6px; }
        .av-final { font-family:'Fredoka One',cursive; font-size:3rem; color:#1ac46e; margin:8px 0; }
        .av-stars { font-size:2.2rem; margin:8px 0; letter-spacing:4px; }
        .av-end-msg { font-size:0.95rem; color:#6ee7b7; margin-top:6px; }
        .av-btn-row { display:flex; gap:12px; justify-content:center; margin-top:18px; flex-wrap:wrap; }
        .av-btn { background:linear-gradient(135deg,#0a5a3a,#1a8a5a); border:none; border-radius:14px; padding:13px 28px; font-family:'Fredoka One',cursive; font-size:1rem; color:white; cursor:pointer; transition:all 0.2s; }
        .av-btn:hover { transform:scale(1.04); }
        .av-btn.secondary { background:linear-gradient(135deg,#333,#555); }
        .av-credit { font-size:0.7rem; color:#1a4a30; text-align:center; padding:14px; }
        .streak-badge { background:linear-gradient(135deg,#f59e0b,#ef4444); color:white; font-weight:800; padding:3px 10px; border-radius:99px; font-size:0.75rem; margin-left:6px; animation:av-pop 0.3s; display:inline-block; }
      `}</style>

      <div className="av-root">
        <header className="av-header">
          <button className="av-back" onClick={onBack}>← Back</button>
          <span className="av-title">📊 Average Quest</span>
          <span className="av-badge">Grade 5</span>
        </header>

        <div className="av-wrap">
          <div className="av-stats">
            <div className="av-stat">
              <div className="av-stat-val">{score}{streak >= 2 && <span className="streak-badge">{streak}x</span>}</div>
              <div className="av-stat-lbl">Score</div>
            </div>
            <div className="av-stat">
              <div className="av-stat-val">{current + 1}/{QUESTIONS.length}</div>
              <div className="av-stat-lbl">Question</div>
            </div>
            <div className="av-stat">
              <div className="av-stat-val">{hearts}</div>
              <div className="av-stat-lbl">Lives</div>
            </div>
          </div>

          <div className="av-progress">
            <div className="av-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {gameOver ? (
            <div className="av-end">
              <h2>🎉 Quest Complete!</h2>
              <div className="av-final">{score} / {total}</div>
              <div className="av-stars">{stars}</div>
              <div className="av-end-msg">{endMsg}</div>
              <div className="av-btn-row">
                <button className="av-btn" onClick={restart}>Play Again 🔄</button>
                {onBack && <button className="av-btn secondary" onClick={onBack}>🏠 Home</button>}
              </div>
            </div>
          ) : (
            <div className="av-card">
              <div className="av-qtype">{q.type}</div>
              <div className="av-qtext">{q.text}</div>

              <NumberBar numbers={q.numbers} />

              {!answered && (
                <button className="av-hint-btn" onClick={() => setShowHint(h => !h)}>
                  💡 {showHint ? 'Hide hint' : 'Show hint'}
                </button>
              )}

              {showHint && (
                <div className="av-hint">💡 Hint: {q.hint}</div>
              )}

              <div className="av-answers">
                {q.options.map((opt, i) => {
                  let cls = 'av-ans'
                  if (answered) {
                    if (i === q.answer) cls += ' correct'
                    else if (i === selected) cls += ' wrong'
                  }
                  return (
                    <button key={i} className={cls} disabled={answered} onClick={() => handleAnswer(i)}>
                      {opt}
                    </button>
                  )
                })}
              </div>

              {feedback && (
                <div className={`av-feedback ${feedback.correct ? 'correct' : 'wrong'}`}>
                  {feedback.text}
                </div>
              )}

              {showNext && (
                <button className="av-next" onClick={nextQuestion}>
                  {current + 1 >= QUESTIONS.length ? 'See Results 🏆' : 'Next ➜'}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="av-credit">Ignite Mind Academy — ignitemindacademy.online</div>
      </div>
    </>
  )
}
