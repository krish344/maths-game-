import { useEffect, useRef, useState } from 'react'

type Dir = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'
type Cell = { x: number; y: number }
type Apple = Cell & { value: number }

type Question = { prompt: string; answer: number; options: number[] }

const GRID = 20
const CELL = 20
const CANVAS = GRID * CELL

function createQuestion(level: number): Question {
  const max = Math.min(10 + level * 2, 24)
  const a = Math.floor(Math.random() * max) + 1
  const b = Math.floor(Math.random() * max) + 1
  const answer = a * b

  const options = [answer]
  while (options.length < 3) {
    const wrong = Math.max(1, answer + Math.floor(Math.random() * (8 + level)) - Math.floor((8 + level) / 2))
    if (!options.includes(wrong)) options.push(wrong)
  }

  options.sort(() => Math.random() - 0.5)
  return { prompt: `${a} × ${b}`, answer, options }
}

function randomCell(exclude: Cell[]): Cell {
  let p: Cell = { x: 0, y: 0 }
  do {
    p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
  } while (exclude.some((e) => e.x === p.x && e.y === p.y))
  return p
}

function makeApples(question: Question, snake: Cell[]): Apple[] {
  const used: Cell[] = [...snake]
  return question.options.map((value) => {
    const pos = randomCell(used)
    used.push(pos)
    return { ...pos, value }
  })
}

export default function MathSnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [tickMs, setTickMs] = useState(190)
  const [gameOver, setGameOver] = useState(false)
  const [question, setQuestion] = useState<Question>(() => createQuestion(1))
  const [status, setStatus] = useState('Eat the correct answer to grow the snake.')

  const game = useRef({
    snake: [{ x: 10, y: 10 }] as Cell[],
    dir: 'RIGHT' as Dir,
    apples: [] as Apple[],
    question: createQuestion(1),
    score: 0,
    level: 1,
  })

  const setDirection = (next: Dir) => {
    const current = game.current.dir
    if (next === 'LEFT' && current === 'RIGHT') return
    if (next === 'RIGHT' && current === 'LEFT') return
    if (next === 'UP' && current === 'DOWN') return
    if (next === 'DOWN' && current === 'UP') return
    game.current.dir = next
  }

  const resetGame = () => {
    const q = createQuestion(1)
    const snake = [{ x: 10, y: 10 }]
    game.current = {
      snake,
      dir: 'RIGHT',
      apples: makeApples(q, snake),
      question: q,
      score: 0,
      level: 1,
    }

    setScore(0)
    setLevel(1)
    setTickMs(190)
    setQuestion(q)
    setStatus('Eat the correct answer to grow the snake.')
    setGameOver(false)
  }

  useEffect(() => {
    resetGame()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setDirection('LEFT')
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setDirection('RIGHT')
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setDirection('UP')
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setDirection('DOWN')
      }
    }
    window.addEventListener('keydown', onKey, { passive: false })
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { snake, apples, question: q } = game.current

    ctx.clearRect(0, 0, CANVAS, CANVAS)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, CANVAS, CANVAS)

    // subtle grid
    ctx.strokeStyle = 'rgba(148,163,184,0.12)'
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL, 0)
      ctx.lineTo(i * CELL, CANVAS)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * CELL)
      ctx.lineTo(CANVAS, i * CELL)
      ctx.stroke()
    }

    apples.forEach((apple) => {
      const cx = apple.x * CELL + CELL / 2
      const cy = apple.y * CELL + CELL / 2
      ctx.beginPath()
      ctx.arc(cx, cy, CELL / 2 - 2, 0, Math.PI * 2)
      ctx.fillStyle = apple.value === q.answer ? '#16a34a' : '#f97316'
      ctx.fill()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px Arial'
      ctx.fillText(String(apple.value), apple.x * CELL + 4, apple.y * CELL + 14)
    })

    snake.forEach((s, i) => {
      const cx = s.x * CELL + CELL / 2
      const cy = s.y * CELL + CELL / 2
      const r = CELL / 2 - 2

      const hue = Math.max(140, 190 - i * 2)
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 ? '#14b8a6' : `hsl(${hue}, 70%, 55%)`
      ctx.fill()

      // subtle outline for "real" body look
      ctx.strokeStyle = i === 0 ? '#0f766e' : 'rgba(15,23,42,0.35)'
      ctx.lineWidth = 1.4
      ctx.stroke()

      if (i === 0) {
        // snake eyes based on direction
        const dx = game.current.dir === 'LEFT' ? -1 : game.current.dir === 'RIGHT' ? 1 : 0
        const dy = game.current.dir === 'UP' ? -1 : game.current.dir === 'DOWN' ? 1 : 0
        const eyeOffsetX = dx !== 0 ? dx * 4 : 3
        const eyeOffsetY = dy !== 0 ? dy * 4 : -3

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(cx - eyeOffsetX, cy + eyeOffsetY, 2.2, 0, Math.PI * 2)
        ctx.arc(cx + eyeOffsetX, cy + eyeOffsetY, 2.2, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#0f172a'
        ctx.beginPath()
        ctx.arc(cx - eyeOffsetX, cy + eyeOffsetY, 1, 0, Math.PI * 2)
        ctx.arc(cx + eyeOffsetX, cy + eyeOffsetY, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  useEffect(() => {
    draw()
  })

  useEffect(() => {
    if (!running) return

    const tick = () => {
      const g = game.current
      const head = { ...g.snake[0] }

      if (g.dir === 'LEFT') head.x -= 1
      if (g.dir === 'RIGHT') head.x += 1
      if (g.dir === 'UP') head.y -= 1
      if (g.dir === 'DOWN') head.y += 1

      const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID
      const hitSelf = g.snake.some((s) => s.x === head.x && s.y === head.y)

      if (hitWall || hitSelf) {
        setStatus('Crashed! Try again.')
        setRunning(false)
        setGameOver(true)
        return
      }

      g.snake.unshift(head)
      const appleIndex = g.apples.findIndex((a) => a.x === head.x && a.y === head.y)

      if (appleIndex >= 0) {
        const eaten = g.apples[appleIndex]
        if (eaten.value === g.question.answer) {
          g.score += 1
          if (g.score % 5 === 0) {
            g.level += 1
            setTickMs((p) => Math.max(75, p - 16))
            setStatus('Level up! Snake speed increased.')
          } else {
            setStatus('Correct! Keep going.')
          }

          g.question = createQuestion(g.level)
          g.apples = makeApples(g.question, g.snake)
        } else {
          setStatus(`Wrong! Correct answer was ${g.question.answer}.`)
          setRunning(false)
          setGameOver(true)
          return
        }
      } else {
        g.snake.pop()
      }

      setScore(g.score)
      setLevel(g.level)
      setQuestion(g.question)
      draw()
    }

    const id = window.setInterval(tick, tickMs)
    return () => window.clearInterval(id)
  }, [running, tickMs])

  const startGame = () => {
    if (gameOver) resetGame()
    setRunning(true)
  }

  const restartGame = () => {
    resetGame()
    setRunning(true)
  }

  return (
    <div className="mini-game snake-wrap" style={{ touchAction: 'none', overscrollBehavior: 'contain' }}>
      <h3>🐍 Math Snake</h3>
      <p>Eat correct answer fruits to grow. Wrong answer or crash ends the run.</p>

      <div className="mini-stats">
        <span>Score: {score}</span>
        <span>Level: {level}</span>
      </div>

      <div className="snake-question-card">
        <div className="snake-question-title">Current Question</div>
        <div className="snake-question">{question.prompt} = ?</div>
        <div className="snake-options-inline">
          {question.options.map((o, idx) => (
            <span key={`${o}-${idx}`}>{String.fromCharCode(65 + idx)}: {o}</span>
          ))}
        </div>
      </div>
      <div className="snake-status">{status}</div>

      <canvas
        ref={canvasRef}
        width={CANVAS}
        height={CANVAS}
        style={{ width: '100%', maxWidth: 420, borderRadius: 14, border: '3px solid #bfdbfe', boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}
      />

      <div className="snake-controls">
        <button onClick={() => setDirection('LEFT')}>◀</button>
        <button onClick={() => setDirection('UP')}>▲</button>
        <button onClick={() => setDirection('DOWN')}>▼</button>
        <button onClick={() => setDirection('RIGHT')}>▶</button>
      </div>

      {!running && !gameOver && <button onClick={startGame}>Start Snake</button>}
      {gameOver && <button onClick={restartGame}>Restart Snake</button>}
    </div>
  )
}
