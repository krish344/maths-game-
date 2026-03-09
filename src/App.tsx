import { Suspense, lazy, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import FractionPick from './components/FractionPick'
import GameErrorBoundary from './components/GameErrorBoundary'
import MathSnakeGame from './components/MathSnakeGame'
import MathSprint from './components/MathSprint'
import QuizShooterGame from './components/QuizShooterGame'
import MathObbyTower from './components/MathObbyTower'
import TugOfWarMathGame from './games/tug-of-war/TugOfWarMathGame'
import LineGraphQuest from './components/LineGraphQuest'
import AverageQuest from './components/AverageQuest'

const MathObbyGame = lazy(() => import('./components/MathObbyGame'))

type GameKey = 'obby' | 'obby-tower' | 'sprint' | 'fraction' | 'snake' | 'shooter' | 'tug' | 'line-graph' | 'average'
type Stage = 'login' | 'select' | 'play'

const GAME_PASSWORD = import.meta.env.VITE_GAMES_PASSWORD || 'ignite123'

const GAME_META: Record<GameKey, { title: string; desc: string; color: string }> = {
  obby: { title: '3D Math Obby', desc: 'Run, jump, avoid obstacles, solve checkpoints.', color: 'linear-gradient(135deg, #8b5cf6, #4f46e5)' },
  'obby-tower': { title: 'Math Obby Tower', desc: 'Roblox-style gate challenge tower climb.', color: 'linear-gradient(135deg, #06b6d4, #4f46e5)' },
  sprint: { title: 'Math Sprint', desc: 'Fast mental math with a timer.', color: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
  fraction: { title: 'Fraction Pick', desc: 'Practice equivalent fractions in quick rounds.', color: 'linear-gradient(135deg, #10b981, #0d9488)' },
  snake: { title: 'Math Snake', desc: 'Eat the correct answer block to grow.', color: 'linear-gradient(135deg, #84cc16, #15803d)' },
  shooter: { title: 'Quiz Shooter', desc: 'Shoot the correct answer balloon.', color: 'linear-gradient(135deg, #f97316, #e11d48)' },
  tug: { title: 'Tug of War Math', desc: '2-player realtime rope battle with shared questions.', color: 'linear-gradient(135deg, #d946ef, #7e22ce)' },
  'line-graph': { title: 'Line Graph Quest (G3)', desc: 'Read line graphs and answer quick trend questions.', color: 'linear-gradient(135deg, #0ea5e9, #2563eb)' },
  average: { title: 'Average Quest (G5)', desc: 'Solve average questions with speed + streak bonus.', color: 'linear-gradient(135deg, #14b8a6, #0f766e)' },
}

function App() {
  const [stage, setStage] = useState<Stage>('login')
  const [selected, setSelected] = useState<GameKey | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const gameList = useMemo(() => Object.keys(GAME_META) as GameKey[], [])
  const topicGames = useMemo(() => (['average', 'line-graph', 'sprint', 'fraction', 'snake', 'shooter', 'tug'] as GameKey[]), [])

  const onLogin = (e: FormEvent) => {
    e.preventDefault()
    if (password !== GAME_PASSWORD) {
      setError('Wrong password. Try again.')
      return
    }
    setError('')
    setStage('select')
  }

  const logout = () => {
    setPassword('')
    setSelected(null)
    setStage('login')
  }

  const renderSelectedGame = () => {
    if (!selected) return null

    if (selected === 'obby') {
      return (
        <GameErrorBoundary>
          <Suspense fallback={<div className="mini-game">Loading 3D Vrindavan world…</div>}>
            <MathObbyGame />
          </Suspense>
        </GameErrorBoundary>
      )
    }
    if (selected === 'obby-tower') return <MathObbyTower />
    if (selected === 'sprint') return <MathSprint />
    if (selected === 'fraction') return <FractionPick />
    if (selected === 'snake') return <MathSnakeGame />
    if (selected === 'shooter') return <QuizShooterGame />
    if (selected === 'tug') return <TugOfWarMathGame />
    if (selected === 'line-graph') return <LineGraphQuest />
    if (selected === 'average') return <AverageQuest />
    return null
  }

  if (stage === 'login') {
    return (
      <main className="app-shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <section className="panel" style={{ width: 'min(440px, 94vw)' }}>
          <h2>Games Login</h2>
          <p className="subtitle" style={{ color: '#475569' }}>Enter password to unlock game selection.</p>

          <form onSubmit={onLogin} style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{ minHeight: 42, borderRadius: 10, border: '1px solid #cbd5e1', padding: '0 12px' }}
            />
            {error ? <p style={{ margin: 0, color: '#dc2626', fontWeight: 600 }}>{error}</p> : null}
            <button type="submit" style={{ minHeight: 44, borderRadius: 10, border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 700 }}>
              Login
            </button>
          </form>
        </section>
      </main>
    )
  }

  if (stage === 'select') {
    return (
      <main className="app-shell">
        <header className="hero">
          <p className="tag">Student Game Zone</p>
          <h1>Choose Your Game</h1>
          <p className="subtitle">Each box opens a dedicated page for that game.</p>
        </header>

        <section className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <h2 style={{ margin: 0 }}>Game Boxes</h2>
            <button onClick={logout} className="settings-btn">Logout</button>
          </div>

          <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
            <p style={{ margin: 0, fontWeight: 800, color: '#334155' }}>Featured obby games</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(['obby', 'obby-tower'] as GameKey[]).map((key) => (
                <button
                  key={`featured-${key}`}
                  className="game-card"
                  onClick={() => {
                    setSelected(key)
                    setStage('play')
                  }}
                  style={{ color: '#fff', border: 'none', background: GAME_META[key].color }}
                >
                  <strong>{GAME_META[key].title}</strong>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>{GAME_META[key].desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="game-grid" style={{ marginBottom: 10 }}>
            {gameList.map((key) => (
              <button
                key={key}
                className="game-card"
                onClick={() => {
                  setSelected(key)
                  setStage('play')
                }}
                style={{
                  color: '#fff',
                  border: 'none',
                  background: GAME_META[key].color,
                }}
              >
                <strong>{GAME_META[key].title}</strong>
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{GAME_META[key].desc}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <p style={{ margin: 0, fontWeight: 800, color: '#334155' }}>Topic Games</p>
            <div className="game-grid">
              {topicGames.map((key) => (
                <button
                  key={`topic-${key}`}
                  className="game-card"
                  onClick={() => {
                    setSelected(key)
                    setStage('play')
                  }}
                  style={{
                    color: '#fff',
                    border: 'none',
                    background: GAME_META[key].color,
                  }}
                >
                  <strong>{GAME_META[key].title}</strong>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>{GAME_META[key].desc}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="tag" style={{ color: '#64748b' }}>Selected Game</p>
        <h2 style={{ marginTop: 4 }}>{selected ? GAME_META[selected].title : 'Game'}</h2>
        <p className="subtitle" style={{ color: '#475569' }}>{selected ? GAME_META[selected].desc : ''}</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button className="settings-btn" onClick={() => setStage('select')}>Back to game boxes</button>
          <button className="settings-btn" onClick={logout}>Logout</button>
        </div>
      </section>

      {renderSelectedGame()}
    </main>
  )
}

export default App
