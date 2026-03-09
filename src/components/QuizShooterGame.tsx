import { useEffect, useRef, useState } from 'react'

type Balloon = { x: number; y: number; value: number; radius: number; hit?: boolean }
type Bullet = { x: number; y: number }

const W = 600
const H = 400

function makeQuestion() {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  const answer = a * b
  const options = [answer]
  while (options.length < 4) {
    const wrong = Math.floor(Math.random() * 100)
    if (!options.includes(wrong)) options.push(wrong)
  }
  options.sort(() => Math.random() - 0.5)
  return { prompt: `${a} × ${b}`, answer, options }
}

export default function QuizShooterGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [questionText, setQuestionText] = useState('')
  const [musicOn, setMusicOn] = useState(true)
  const [status, setStatus] = useState('Press Start Game')

  const game = useRef({
    cannon: { x: W / 2 - 20, y: H - 50, width: 40, height: 40 },
    bullets: [] as Bullet[],
    balloons: [] as Balloon[],
    correctAnswer: 0,
    score: 0,
    running: false,
    raf: 0,
  })

  const audio = useRef({
    ctx: null as AudioContext | null,
  })

  const tone = (freq: number, dur = 0.12, gainValue = 0.05) => {
    if (!musicOn) return
    const AudioCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return
    if (!audio.current.ctx) audio.current.ctx = new AudioCtor()
    const ctx = audio.current.ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = freq
    osc.type = 'triangle'
    gain.gain.value = gainValue
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + dur)
  }

  const generateQuestion = () => {
    const q = makeQuestion()
    game.current.correctAnswer = q.answer
    setQuestionText(q.prompt)

    game.current.balloons = q.options.map((ans, i) => ({
      x: 80 + i * 120,
      y: H + Math.random() * 100,
      value: ans,
      radius: 30,
      hit: false,
    }))
  }

  const drawCannon = (ctx: CanvasRenderingContext2D) => {
    const c = game.current.cannon
    ctx.fillStyle = '#00aced'
    ctx.fillRect(c.x, c.y, c.width, c.height)
    ctx.fillStyle = '#dbeafe'
    ctx.fillRect(c.x + c.width / 2 - 3, c.y - 10, 6, 12)
  }

  const drawBullets = (ctx: CanvasRenderingContext2D) => {
    const { bullets } = game.current
    ctx.fillStyle = '#fff'
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].y -= 5
      ctx.beginPath()
      ctx.arc(bullets[i].x, bullets[i].y, 5, 0, Math.PI * 2)
      ctx.fill()
      if (bullets[i].y < 0) bullets.splice(i, 1)
    }
  }

  const drawBalloons = (ctx: CanvasRenderingContext2D) => {
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'

    for (let i = game.current.balloons.length - 1; i >= 0; i--) {
      const b = game.current.balloons[i]
      b.y -= 1

      ctx.beginPath()
      ctx.fillStyle = '#ff5e78'
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#fff'
      ctx.fillText(String(b.value), b.x, b.y + 5)

      if (b.y + b.radius < 0) {
        setStatus(`Time's up! Game Over. Score: ${game.current.score}`)
        tone(180, 0.2, 0.045)
        game.current.running = false
        setGameOver(true)
        return
      }
    }
  }

  const detectHits = () => {
    for (let i = game.current.bullets.length - 1; i >= 0; i--) {
      for (let j = game.current.balloons.length - 1; j >= 0; j--) {
        const bullet = game.current.bullets[i]
        const balloon = game.current.balloons[j]
        const dx = bullet.x - balloon.x
        const dy = bullet.y - balloon.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < balloon.radius && !balloon.hit) {
          balloon.hit = true
          game.current.bullets.splice(i, 1)

          if (balloon.value === game.current.correctAnswer) {
            game.current.score += 1
            setScore(game.current.score)
            setStatus('✅ Correct hit!')
            tone(880, 0.08, 0.05)
            tone(1100, 0.08, 0.04)
            generateQuestion()
            return
          }

          setStatus(`❌ Wrong answer! Game Over. Score: ${game.current.score}`)
          tone(220, 0.18, 0.05)
          game.current.running = false
          setGameOver(true)
          return
        }
      }
    }
  }

  const draw = () => {
    if (!gameStarted || gameOver || !game.current.running) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#222'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawCannon(ctx)
    drawBullets(ctx)
    drawBalloons(ctx)
    detectHits()

    game.current.raf = requestAnimationFrame(draw)
  }

  const startGame = async () => {
    game.current.cannon.x = W / 2 - 20
    game.current.bullets = []
    game.current.score = 0
    setScore(0)
    setGameOver(false)
    setGameStarted(true)
    setStatus('Shoot the correct answer balloon')
    generateQuestion()
    game.current.running = true

    if (musicOn) {
      tone(523.25, 0.1, 0.05)
      tone(659.25, 0.1, 0.045)
    }

    cancelAnimationFrame(game.current.raf)
    game.current.raf = requestAnimationFrame(draw)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver || !game.current.running) return
      if (e.key === 'ArrowLeft' && game.current.cannon.x > 0) game.current.cannon.x -= 20
      if (e.key === 'ArrowRight' && game.current.cannon.x + game.current.cannon.width < W) game.current.cannon.x += 20
      if (e.key === ' ' || e.key === 'Enter') {
        game.current.bullets.push({ x: game.current.cannon.x + game.current.cannon.width / 2, y: game.current.cannon.y })
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameStarted, gameOver])

  useEffect(() => {
    return () => cancelAnimationFrame(game.current.raf)
  }, [])

  return (
    <div className="mini-game">
      <h3>🎯 Quiz Shooter</h3>

      {!gameStarted && (
        <div className="start-menu">
          <button onClick={startGame}>Start Game</button>
          <button onClick={() => setMusicOn((v) => !v)}>{musicOn ? '🔊 Sound: On' : '🔇 Sound: Off'}</button>
        </div>
      )}

      {gameStarted && (
        <>
          <div className="mini-stats">
            <span>Question: {questionText}</span>
            <span>Score: {score}</span>
          </div>
          <div className="snake-status">{status}</div>

          <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', maxWidth: 640, borderRadius: 12, border: '4px solid #fff' }} />

          <div className="snake-controls">
            <button onClick={() => (game.current.cannon.x = Math.max(0, game.current.cannon.x - 20))}>◀</button>
            <button onClick={() => game.current.bullets.push({ x: game.current.cannon.x + game.current.cannon.width / 2, y: game.current.cannon.y })}>🔫 Shoot</button>
            <button onClick={() => (game.current.cannon.x = Math.min(W - game.current.cannon.width, game.current.cannon.x + 20))}>▶</button>
          </div>

          <button onClick={startGame}>{gameOver ? 'Restart' : 'Reset'}</button>
        </>
      )}
    </div>
  )
}
