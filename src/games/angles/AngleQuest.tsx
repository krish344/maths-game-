import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Question {
  type: string
  text: string
  deg: number | null
  options: string[]
  answer: number
}

// ─── Question Bank ────────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  { type: 'IDENTIFY THE ANGLE', text: 'What type of angle is shown?', deg: 45, options: ['Acute', 'Right', 'Obtuse', 'Straight'], answer: 0 },
  { type: 'IDENTIFY THE ANGLE', text: 'What type of angle is shown?', deg: 90, options: ['Acute', 'Right', 'Obtuse', 'Straight'], answer: 1 },
  { type: 'IDENTIFY THE ANGLE', text: 'What type of angle is shown?', deg: 130, options: ['Acute', 'Right', 'Obtuse', 'Straight'], answer: 2 },
  { type: 'IDENTIFY THE ANGLE', text: 'What type of angle is shown?', deg: 180, options: ['Acute', 'Right', 'Obtuse', 'Straight'], answer: 3 },
  { type: 'KNOW YOUR ANGLES',   text: 'Which angle is exactly 90 degrees?', deg: null, options: ['Acute', 'Right angle', 'Obtuse', 'Straight'], answer: 1 },
  { type: 'REAL LIFE',          text: 'Corner of your notebook makes which angle?', deg: 90, options: ['Acute', 'Obtuse', 'Right angle', 'Straight'], answer: 2 },
  { type: 'TRUE OR FALSE',      text: 'An ACUTE angle is GREATER than 90°?', deg: 35, options: ['TRUE ✅', 'FALSE ❌'], answer: 1 },
  { type: 'FILL THE BLANK',     text: 'A straight angle equals ___ degrees.', deg: 180, options: ['90°', '45°', '180°', '360°'], answer: 2 },
  { type: 'IDENTIFY THE ANGLE', text: 'What type of angle is shown?', deg: 25, options: ['Straight', 'Obtuse', 'Right', 'Acute'], answer: 3 },
  { type: 'REAL LIFE',          text: 'Clock hands at 3 o\'clock form which angle?', deg: 90, options: ['Acute', 'Obtuse', 'Right angle', 'Straight'], answer: 2 },
]

const PRAISE = ['🎉 Excellent!', '⭐ Correct!', '🔥 Amazing!', '✅ Well done!']

// ─── Canvas Angle Drawer ──────────────────────────────────────────────────────
function AngleCanvas({ deg }: { deg: number | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || deg === null) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const cx = 70, cy = 130, sz = 90
    const rad = (deg * Math.PI) / 180

    // Glow effect
    ctx.shadowColor = '#5588ff'
    ctx.shadowBlur = 14

    // Base ray
    ctx.strokeStyle = '#ffe045'
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sz, cy); ctx.stroke()

    // Angled ray
    ctx.strokeStyle = '#60e0ff'
    ctx.beginPath(); ctx.moveTo(cx, cy)
    ctx.lineTo(cx + sz * Math.cos(rad), cy - sz * Math.sin(rad)); ctx.stroke()

    ctx.shadowBlur = 0

    // Arc
    ctx.strokeStyle = '#ff6b1a'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(cx, cy, 28, -rad, 0); ctx.stroke()

    // Degree label
    const mx = cx + 46 * Math.cos(rad / 2)
    const my = cy - 46 * Math.sin(rad / 2)
    ctx.fillStyle = '#ff6b1a'
    ctx.font = 'bold 13px Nunito, sans-serif'
    ctx.fillText(`${deg}°`, mx, my)

    // Vertex dot
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill()

    // Right angle box
    if (deg === 90) {
      ctx.strokeStyle = '#1ac46e'
      ctx.lineWidth = 2
      ctx.strokeRect(cx, cy - 16, 16, 16)
    }
  }, [deg])

  if (deg === null) return null

  return (
    <div className="angle-canvas-wrap">
      <canvas ref={canvasRef} width={240} height={170} className="angle-canvas" />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface AngleQuestProps {
  onBack?: () => void
}

export default function AngleQuest({ onBack }: AngleQuestProps) {
  const [current, setCurrent]   = useState(0)
  const [score, setScore]       = useState(0)
  const [lives, setLives]       = useState(3)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
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
      setScore(s => s + 10)
      setFeedback({ text: PRAISE[Math.floor(Math.random() * PRAISE.length)], correct: true })
    } else {
      setLives(l => {
        const next = l - 1
        if (next <= 0) setTimeout(() => setGameOver(true), 800)
        return next
      })
      setFeedback({ text: '❌ Not quite! Green is correct.', correct: false })
    }
    setShowNext(true)
  }, [answered, q])

  const nextQuestion = useCallback(() => {
    if (current + 1 >= QUESTIONS.length) {
      setGameOver(true)
      return
    }
    setCurrent(c => c + 1)
    setAnswered(false)
    setSelected(null)
    setFeedback(null)
    setShowNext(false)
  }, [current])

  const restart = useCallback(() => {
    setCurrent(0); setScore(0); setLives(3)
    setAnswered(false); setSelected(null)
    setFeedback(null); setShowNext(false); setGameOver(false)
  }, [])

  // Save best score
  useEffect(() => {
    if (gameOver) {
      try {
        const scores = JSON.parse(localStorage.getItem('obby_scores') || '{}')
        scores.angles = Math.max(score, scores.angles || 0)
        localStorage.setItem('obby_scores', JSON.stringify(scores))
      } catch { /* ignore */ }
    }
  }, [gameOver, score])

  const total = QUESTIONS.length * 10
  const pct = score / total
  const stars = pct >= 0.8 ? '⭐⭐⭐' : pct >= 0.5 ? '⭐⭐' : '⭐'
  const endMsg = pct >= 0.8
    ? '🏆 You are an Angle Master!'
    : pct >= 0.5
    ? '📐 Great effort! Review and try again!'
    : '💪 Keep practising — you\'re getting there!'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
        .aq-root {
          font-family: 'Nunito', sans-serif;
          background: #0d1b4b;
          color: #e8ecff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .aq-root::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 20% 30%, #1a3a8f33 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 70%, #ff6b1a22 0%, transparent 60%);
        }
        .aq-header {
          width: 100%;
          background: linear-gradient(135deg, #1a2a8f, #2d3db5);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 20px #0007;
          position: sticky; top: 0; z-index: 10;
        }
        .aq-back {
          background: rgba(255,255,255,0.15);
          border: none; border-radius: 10px;
          padding: 7px 14px; color: white;
          font-family: 'Nunito', sans-serif;
          font-weight: 700; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s;
        }
        .aq-back:hover { background: rgba(255,255,255,0.25); }
        .aq-title {
          font-family: 'Fredoka One', cursive;
          font-size: 1.5rem; color: #ffe045;
        }
        .aq-badge {
          background: #ff6b1a; color: white;
          font-weight: 800; padding: 4px 14px;
          border-radius: 20px; font-size: 0.85rem;
        }
        .aq-wrap { width: min(100%, 680px); padding: 16px; display: flex; flex-direction: column; gap: 14px; }
        .aq-stats { display: flex; gap: 10px; }
        .aq-stat {
          flex: 1; background: #1a2a6c;
          border-radius: 14px; padding: 10px;
          text-align: center; border: 1.5px solid rgba(255,255,255,0.1);
        }
        .aq-stat-val {
          font-family: 'Fredoka One', cursive;
          font-size: 1.7rem; color: #ffe045;
        }
        .aq-stat-lbl {
          font-size: 0.68rem; color: #aab0e0;
          text-transform: uppercase; letter-spacing: 1px;
        }
        .aq-progress { background: rgba(255,255,255,0.1); border-radius: 99px; height: 9px; overflow: hidden; }
        .aq-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #1ac46e, #ffe045);
          border-radius: 99px; transition: width 0.5s ease;
        }
        .aq-card {
          background: #1a2a6c;
          border-radius: 22px; padding: 22px;
          border: 1.5px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .aq-qtype {
          font-size: 0.72rem; color: #ff6b1a;
          text-transform: uppercase; letter-spacing: 2px;
          font-weight: 800; margin-bottom: 8px; text-align: center;
        }
        .aq-qtext {
          font-size: 1.1rem; font-weight: 700;
          color: white; margin-bottom: 16px;
          line-height: 1.5; text-align: center;
        }
        .angle-canvas-wrap { display: flex; justify-content: center; margin-bottom: 16px; }
        .angle-canvas {
          border-radius: 14px; background: #101c50;
          border: 1.5px solid rgba(255,255,255,0.1);
        }
        .aq-answers {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 12px;
        }
        .aq-ans {
          background: #253080;
          border: 2px solid rgba(255,255,255,0.12);
          border-radius: 14px; padding: 13px 10px;
          font-family: 'Nunito', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          color: white; cursor: pointer; transition: all 0.18s;
        }
        .aq-ans:hover:not(:disabled) {
          background: #3347b0;
          transform: translateY(-2px);
          border-color: #ffe045;
        }
        .aq-ans:disabled { opacity: 0.65; cursor: default; }
        .aq-ans.correct { background: #14633d !important; border-color: #1ac46e !important; animation: aq-pop 0.3s; }
        .aq-ans.wrong   { background: #6b1a1a !important; border-color: #e63946 !important; animation: aq-shake 0.3s; }
        @keyframes aq-pop   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes aq-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .aq-feedback { text-align: center; font-size: 1rem; font-weight: 800; min-height: 28px; margin-bottom: 8px; }
        .aq-feedback.correct { color: #1ac46e; }
        .aq-feedback.wrong   { color: #e63946; }
        .aq-next {
          width: 100%;
          background: linear-gradient(135deg, #ff6b1a, #ff9a4d);
          border: none; border-radius: 16px; padding: 14px;
          font-family: 'Fredoka One', cursive; font-size: 1.1rem;
          color: white; cursor: pointer; letter-spacing: 1px;
          transition: all 0.2s; box-shadow: 0 4px 16px rgba(255,107,26,0.5);
        }
        .aq-next:hover { transform: translateY(-2px); }
        .aq-end {
          text-align: center; padding: 28px 16px;
          background: #1a2a6c; border-radius: 22px;
          border: 1.5px solid rgba(255,255,255,0.1);
        }
        .aq-end h2 {
          font-family: 'Fredoka One', cursive;
          font-size: 2rem; color: #ffe045; margin-bottom: 6px;
        }
        .aq-final-score {
          font-family: 'Fredoka One', cursive;
          font-size: 3rem; color: #1ac46e; margin: 8px 0;
        }
        .aq-stars   { font-size: 2.2rem; margin: 8px 0; letter-spacing: 4px; }
        .aq-end-msg { font-size: 0.95rem; color: #aab0e0; margin-top: 6px; }
        .aq-btn-row { display: flex; gap: 12px; justify-content: center; margin-top: 18px; flex-wrap: wrap; }
        .aq-btn {
          background: linear-gradient(135deg, #1a2a8f, #3347cc);
          border: none; border-radius: 14px; padding: 13px 28px;
          font-family: 'Fredoka One', cursive; font-size: 1rem;
          color: white; cursor: pointer; transition: all 0.2s;
        }
        .aq-btn:hover { transform: scale(1.04); }
        .aq-btn.secondary { background: linear-gradient(135deg, #333, #555); }
        .aq-credit { font-size: 0.7rem; color: #445588; text-align: center; padding: 14px; }
      `}</style>

      <div className="aq-root">
        <header className="aq-header">
          <button className="aq-back" onClick={onBack}>← Back</button>
          <span className="aq-title">📐 Angle Quest</span>
          <span className="aq-badge">Grade 3</span>
        </header>

        <div className="aq-wrap">
          {/* Stats */}
          <div className="aq-stats">
            <div className="aq-stat">
              <div className="aq-stat-val">{score}</div>
              <div className="aq-stat-lbl">Score</div>
            </div>
            <div className="aq-stat">
              <div className="aq-stat-val">{current + 1}/{QUESTIONS.length}</div>
              <div className="aq-stat-lbl">Question</div>
            </div>
            <div className="aq-stat">
              <div className="aq-stat-val">{hearts}</div>
              <div className="aq-stat-lbl">Lives</div>
            </div>
          </div>

          {/* Progress */}
          <div className="aq-progress">
            <div className="aq-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Game Over / End Screen */}
          {gameOver ? (
            <div className="aq-end">
              <h2>🎉 Quest Complete!</h2>
              <div className="aq-final-score">{score} / {total}</div>
              <div className="aq-stars">{stars}</div>
              <div className="aq-end-msg">{endMsg}</div>
              <div className="aq-btn-row">
                <button className="aq-btn" onClick={restart}>Play Again 🔄</button>
                {onBack && <button className="aq-btn secondary" onClick={onBack}>🏠 Home</button>}
              </div>
            </div>
          ) : (
            /* Question Card */
            <div className="aq-card">
              <div className="aq-qtype">{q.type}</div>
              <div className="aq-qtext">{q.text}</div>

              <AngleCanvas deg={q.deg} />

              <div className="aq-answers" style={{ gridTemplateColumns: q.options.length === 2 ? '1fr 1fr' : '1fr 1fr' }}>
                {q.options.map((opt, i) => {
                  let cls = 'aq-ans'
                  if (answered) {
                    if (i === q.answer) cls += ' correct'
                    else if (i === selected) cls += ' wrong'
                  }
                  return (
                    <button
                      key={i}
                      className={cls}
                      disabled={answered}
                      onClick={() => handleAnswer(i)}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>

              {feedback && (
                <div className={`aq-feedback ${feedback.correct ? 'correct' : 'wrong'}`}>
                  {feedback.text}
                </div>
              )}

              {showNext && (
                <button className="aq-next" onClick={nextQuestion}>
                  {current + 1 >= QUESTIONS.length ? 'See Results 🏆' : 'Next ➜'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="aq-credit">Ignite Mind Academy — ignitemindacademy.online</div>
      </div>
    </>
  )
}
