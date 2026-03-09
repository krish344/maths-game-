import { useEffect, useMemo, useState } from 'react'
import { makeQuestion } from './math'
import type { Side, TugState } from './types'
import { useTugRoom } from './useTugRoom'

const PULL_CORRECT = 18
const PUSH_WRONG = 8

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function initialState(roomId: string): TugState {
  return {
    roomId,
    rope: 0,
    winner: null,
    question: null,
    scoreA: 0,
    scoreB: 0,
    round: 0,
    attempts: {},
  }
}

function ClassroomMode() {
  const [timeLeft, setTimeLeft] = useState(90)
  const [leftScore, setLeftScore] = useState(0)
  const [rightScore, setRightScore] = useState(0)
  const [rope, setRope] = useState(0)
  const [leftInput, setLeftInput] = useState('')
  const [rightInput, setRightInput] = useState('')
  const [leftQ, setLeftQ] = useState(() => makeQuestion(1))
  const [rightQ, setRightQ] = useState(() => makeQuestion(1))
  const [winner, setWinner] = useState<string>('')

  const level = useMemo(() => Math.min(8, Math.floor((leftScore + rightScore) / 10) + 1), [leftScore, rightScore])
  const gameOver = !!winner || timeLeft <= 0

  useEffect(() => {
    if (gameOver) return
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [gameOver])

  useEffect(() => {
    if (timeLeft > 0 || winner) return
    if (rope > 0) setWinner('Team 2 Wins!')
    else if (rope < 0) setWinner('Team 1 Wins!')
    else setWinner('Draw!')
  }, [timeLeft, rope, winner])

  const pushRope = (team: 'left' | 'right') => {
    setRope((r) => {
      const next = team === 'left' ? Math.max(-8, r - 1) : Math.min(8, r + 1)
      if (next <= -8) setWinner('Team 1 Wins!')
      if (next >= 8) setWinner('Team 2 Wins!')
      return next
    })
  }

  const submit = (team: 'left' | 'right') => {
    if (gameOver) return
    if (team === 'left') {
      if (Number(leftInput) === leftQ.options[leftQ.correctIndex]) {
        setLeftScore((s) => s + 1)
        pushRope('left')
        setLeftQ(makeQuestion(level))
      }
      setLeftInput('')
      return
    }

    if (Number(rightInput) === rightQ.options[rightQ.correctIndex]) {
      setRightScore((s) => s + 1)
      pushRope('right')
      setRightQ(makeQuestion(level))
    }
    setRightInput('')
  }

  const tap = (team: 'left' | 'right', v: string) => {
    if (gameOver) return
    if (team === 'left') setLeftInput((x) => (x + v).slice(0, 4))
    else setRightInput((x) => (x + v).slice(0, 4))
  }

  const back = (team: 'left' | 'right') => {
    if (team === 'left') setLeftInput((x) => x.slice(0, -1))
    else setRightInput((x) => x.slice(0, -1))
  }

  const reset = () => {
    setTimeLeft(90)
    setLeftScore(0)
    setRightScore(0)
    setRope(0)
    setLeftInput('')
    setRightInput('')
    setLeftQ(makeQuestion(1))
    setRightQ(makeQuestion(1))
    setWinner('')
  }

  const winnerSide = winner.includes('Team 1') ? 'left' : winner.includes('Team 2') ? 'right' : null
  const ropePos = winnerSide === 'left' ? '12%' : winnerSide === 'right' ? '88%' : `${50 + rope * 4}%`

  const Pad = ({ team, q, value, score }: { team: 'left' | 'right'; q: string; value: string; score: number }) => (
    <div className={`tug-pad ${team === 'left' ? 'team-left' : 'team-right'}`}>
      <div className="mini-stats" style={{ marginBottom: 8 }}>
        <span>{team === 'left' ? 'Team 1' : 'Team 2'}</span>
        <span>Score {score}</span>
      </div>
      <div className="tug-question">{q}</div>
      <div className="tug-answer-screen">{value || '0'}</div>

      <div className="options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 10 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} onClick={() => tap(team, String(n))}>{n}</button>
        ))}
        <button onClick={() => back(team)} style={{ background: '#fee2e2', color: '#b91c1c' }}>Back</button>
        <button onClick={() => tap(team, '0')}>0</button>
        <button onClick={() => submit(team)} style={{ background: '#dcfce7', color: '#166534' }}>OK</button>
      </div>
    </div>
  )

  return (
    <>
      <div className="mini-stats" style={{ marginBottom: 6 }}>
        <span>Time {timeLeft}s</span>
        <span>Level {level}</span>
      </div>

      <div className="tug-arena">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
          <span>Team 1 • {leftScore}</span>
          <span>Team 2 • {rightScore}</span>
        </div>
        <div className={`tug-track ${winnerSide ? `win-${winnerSide}` : ''}`}>
          <div className="tug-center-line" />
          <div className="tug-rope" />
          <div className={`tug-team tug-team-a ${winnerSide === 'left' ? 'winner-pull' : ''}`}>TEAM 1</div>
          <div className={`tug-team tug-team-b ${winnerSide === 'right' ? 'winner-pull' : ''}`}>TEAM 2</div>
          <div className={`tug-flag ${winnerSide ? 'winner-flag' : ''}`} style={{ left: ropePos }}>FLAG</div>
          {winnerSide && <div className={`tug-boom ${winnerSide}`}>BOOM!</div>}
        </div>
      </div>

      {winner ? <div className="snake-status" style={{ fontSize: 20, fontWeight: 900 }}>{winner}</div> : null}

      <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <Pad team="left" q={leftQ.prompt} value={leftInput} score={leftScore} />
        <Pad team="right" q={rightQ.prompt} value={rightInput} score={rightScore} />
      </div>

      <div className="snake-controls" style={{ gridTemplateColumns: '1fr' }}>
        <button onClick={reset}>Restart Match</button>
      </div>
    </>
  )
}

function RealtimeMode() {
  const [roomInput, setRoomInput] = useState('room-1')
  const [roomId, setRoomId] = useState('')
  const [name, setName] = useState(`Player-${Math.floor(Math.random() * 1000)}`)
  const [state, setState] = useState<TugState>(initialState(''))

  const playerId = useMemo(() => crypto.randomUUID(), [])
  const { connected, players, events, send } = useTugRoom(roomId, playerId, name)

  const myIndex = players.findIndex((p) => p.id === playerId)
  const mySide: Side | null = myIndex === 0 ? 'A' : myIndex === 1 ? 'B' : null
  const hostId = players[0]?.id
  const isHost = hostId === playerId

  const nextRound = () => {
    if (!isHost || !roomId) return
    setState((prev) => {
      const q = makeQuestion(prev.round + 1)
      const next = { ...prev, question: q, round: prev.round + 1, attempts: {} }
      send({ type: 'state', state: next })
      return next
    })
  }

  useEffect(() => {
    if (!isHost || !connected || !roomId) return
    if (!state.question && !state.winner) nextRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, connected, roomId])

  useEffect(() => {
    if (!roomId) return
    for (const e of events) {
      if (e.type === 'state') {
        setState(e.state)
        continue
      }
      if (e.type === 'reset') {
        setState(initialState(roomId))
        if (isHost) nextRound()
        continue
      }

      if (e.type === 'answer' && isHost) {
        setState((prev) => {
          if (prev.winner || !prev.question) return prev
          if (e.round !== prev.round) return prev
          if (prev.attempts[e.side]) return prev

          const correct = e.optionIndex === prev.question.correctIndex
          const nextAttempts = { ...prev.attempts, [e.side]: true }
          const sideSign = e.side === 'A' ? -1 : 1
          const nextRope = correct
            ? clamp(prev.rope + sideSign * PULL_CORRECT, -100, 100)
            : clamp(prev.rope + sideSign * -PUSH_WRONG, -100, 100)

          const next: TugState = {
            ...prev,
            rope: nextRope,
            attempts: nextAttempts,
            scoreA: prev.scoreA + (correct && e.side === 'A' ? 1 : 0),
            scoreB: prev.scoreB + (correct && e.side === 'B' ? 1 : 0),
            winner: nextRope <= -100 ? 'A' : nextRope >= 100 ? 'B' : null,
          }

          send({ type: 'state', state: next })
          if (!next.winner && correct) setTimeout(() => nextRound(), 900)
          return next
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  useEffect(() => {
    if (!isHost || !state.question || state.winner) return
    const ms = state.question.deadlineMs - Date.now()
    if (ms <= 0) {
      nextRound()
      return
    }
    const t = setTimeout(() => nextRound(), ms)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.question?.id, isHost, state.winner])

  const submit = (idx: number) => {
    if (!mySide || !state.question || state.winner) return
    send({ type: 'answer', playerId, side: mySide, round: state.round, optionIndex: idx, sentAt: Date.now() })
  }

  const timeLeft = state.question ? Math.max(0, Math.ceil((state.question.deadlineMs - Date.now()) / 1000)) : 0

  return (
    <>
      {!roomId ? (
        <div className="settings-drawer">
          <label className="setting-item"><span>Name</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="setting-item"><span>Room</span><input value={roomInput} onChange={(e) => setRoomInput(e.target.value)} /></label>
          <button onClick={() => { const r = roomInput.trim().toLowerCase(); setRoomId(r); setState(initialState(r)) }}>Join Room</button>
        </div>
      ) : (
        <>
          <div className="mini-stats">
            <span>Room: {roomId}</span>
            <span>{connected ? 'Live' : 'Connecting...'}</span>
            <span>You: {mySide ?? 'Spectator'}</span>
          </div>

          <div className="snake-question-card">
            <div className="snake-question-title">Same question for both players • first correct pulls rope</div>
            <div className="snake-question">{state.question?.prompt ?? 'Waiting for host...'}</div>
            <div className="mini-stats"><span>Time: {timeLeft}s</span><span>Round: {state.round}</span></div>
          </div>

          <div style={{ padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>A ({players[0]?.name ?? 'Player A'}) • {state.scoreA}</span>
              <span>B ({players[1]?.name ?? 'Player B'}) • {state.scoreB}</span>
            </div>
            <div style={{ marginTop: 8, background: '#e2e8f0', borderRadius: 999, height: 16, position: 'relative' }}>
              <div style={{ position: 'absolute', left: `${50 + state.rope / 2}%`, top: -4, width: 8, height: 24, background: '#0f172a', borderRadius: 4, transform: 'translateX(-50%)', transition: 'left 220ms ease' }} />
            </div>
          </div>

          <div className="options-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {state.question?.options.map((o, idx) => (
              <button key={`${o}-${idx}`} onClick={() => submit(idx)} style={{ minHeight: 64, fontSize: 22, fontWeight: 900 }}>{o}</button>
            ))}
          </div>

          {state.winner && (
            <div className="snake-status" style={{ fontSize: 18, fontWeight: 900 }}>
              Winner: {state.winner === 'A' ? players[0]?.name ?? 'Player A' : players[1]?.name ?? 'Player B'}
            </div>
          )}

          <div className="snake-controls" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <button onClick={() => send({ type: 'reset', by: playerId })}>Reset Match</button>
            <button onClick={() => setRoomId('')}>Leave Room</button>
          </div>
        </>
      )}
    </>
  )
}

export default function TugOfWarMathGame() {
  const [mode, setMode] = useState<'classroom' | 'realtime'>('classroom')

  return (
    <div className="mini-game">
      <h3>Tug of War Math</h3>
      <div className="snake-controls" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <button onClick={() => setMode('classroom')} style={{ opacity: mode === 'classroom' ? 1 : 0.6 }}>Classroom keypad mode</button>
        <button onClick={() => setMode('realtime')} style={{ opacity: mode === 'realtime' ? 1 : 0.6 }}>Realtime room mode</button>
      </div>

      {mode === 'classroom' ? <ClassroomMode /> : <RealtimeMode />}
    </div>
  )
}
