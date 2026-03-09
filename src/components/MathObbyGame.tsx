import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Text, useTexture } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import type { Group } from 'three'
import { nextQuestion } from '../lib/mathEngine'

type Phase = 'idle' | 'countdown' | 'run' | 'choose' | 'resolve' | 'won' | 'lost'

type StageQuestion = {
  prompt: string
  options: number[]
  correctIndex: number
}

type AvatarAnim = 'idle' | 'run' | 'jump'
type QualityMode = 'auto' | 'high' | 'low'

const LANES = [-3, -1, 1, 3] as const
const STAGE_Z = [-20, -42, -64, -86, -108, -130]
const RUN_SPEED = 7.8
const CHOOSE_SPEED = 3.2
const RESOLVE_TOTAL = 0.9

function PlayerAvatar({ x, y, z, anim, onTap }: { x: number; y: number; z: number; anim: AvatarAnim; onTap: () => void }) {
  const texture = useTexture('/avatars/krishna-boy-sticker.png')
  const ref = useRef<Group>(null)

  useFrame(({ camera }) => {
    if (!ref.current) return
    ref.current.lookAt(camera.position)

    const t = performance.now() / 1000
    const bob = anim === 'run' ? Math.sin(t * 10) * 0.05 : anim === 'jump' ? 0.06 : Math.sin(t * 3) * 0.02
    ref.current.position.set(x, y + 0.65 + bob, z)

    if (anim === 'run') ref.current.rotation.z = Math.sin(t * 12) * 0.05
    else if (anim === 'jump') ref.current.rotation.x = -0.2
    else ref.current.rotation.x = 0
  })

  return (
    <group ref={ref}>
      {/* shadow */}
      <mesh position={[0, -0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 24]} />
        <meshStandardMaterial color="#0b1220" transparent opacity={0.35} />
      </mesh>

      {/* peacock-feather inspired trail */}
      {[0.28, 0.52, 0.78, 1.04].map((offset, idx) => {
        const colors = ['#22d3ee', '#60a5fa', '#34d399', '#f59e0b']
        return (
          <mesh key={offset} position={[0, -0.08 + idx * 0.01, offset]}>
            <sphereGeometry args={[0.085 - idx * 0.016, 10, 10]} />
            <meshStandardMaterial color={colors[idx]} emissive={colors[idx]} emissiveIntensity={0.65} transparent opacity={0.52 - idx * 0.1} />
          </mesh>
        )
      })}

      <sprite
        scale={[1.05, 1.95, 1]}
        onPointerDown={(e) => {
          e.stopPropagation()
          onTap()
        }}
      >
        <spriteMaterial map={texture} transparent alphaTest={0.25} />
      </sprite>
    </group>
  )
}

function World({
  playerX,
  playerY,
  playerZ,
  currentStage,
  phase,
  countdown,
  stageQuestion,
  chosenIndex,
  resolveTime,
  avatarAnim,
  jumpFx,
  jumpAssistDistance,
  showJumpAssist,
  quality,
  uiScale,
  onAvatarTap,
  onTick,
}: {
  playerX: number
  playerY: number
  playerZ: number
  currentStage: number
  phase: Phase
  countdown: number
  stageQuestion: StageQuestion | null
  chosenIndex: number | null
  resolveTime: number
  avatarAnim: AvatarAnim
  jumpFx: { t: number; x: number; z: number } | null
  jumpAssistDistance: number
  showJumpAssist: boolean
  quality: 'high' | 'low'
  uiScale: number
  onAvatarTap: () => void
  onTick: (dt: number) => void
}) {
  useFrame(({ camera }, dt) => {
    onTick(dt)

    if (phase === 'countdown') {
      const orbit = Math.max(0, countdown)
      camera.position.set(Math.sin(orbit * 1.8) * 4.6, 2.9, playerZ + 9.8 + Math.cos(orbit * 1.8) * 1.8)
      camera.lookAt(0, 0.8, playerZ - 5)
      return
    }

    camera.position.set(playerX * 0.25, 3.8, playerZ + 8.8)
    camera.lookAt(playerX * 0.4, 0.75, playerZ - 7)
  })

  const stageZ = STAGE_Z[Math.min(currentStage, STAGE_Z.length - 1)]
  const resolveProgress = Math.max(0, Math.min(1, resolveTime / RESOLVE_TOTAL))
  const lowMode = quality === 'low'
  const treeSegments = lowMode ? 8 : 16

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 9, 6]} intensity={1.15} color="#ffe9a8" />
      {!lowMode && <Environment preset="sunset" />}

      <mesh position={[0, -1.05, -68]}>
        <boxGeometry args={[24, 0.45, 170]} />
        <meshStandardMaterial color="#365d2f" />
      </mesh>

      <mesh position={[0, -0.82, -68]}>
        <boxGeometry args={[10, 0.45, 150]} />
        <meshStandardMaterial color="#5b3a29" />
      </mesh>

      <mesh position={[8.2, -0.95, -68]}>
        <boxGeometry args={[4.2, 0.12, 150]} />
        <meshStandardMaterial color="#2563eb" emissive="#1d4ed8" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[-8.2, -0.95, -68]}>
        <boxGeometry args={[4.2, 0.12, 150]} />
        <meshStandardMaterial color="#2563eb" emissive="#1d4ed8" emissiveIntensity={0.2} />
      </mesh>

      {/* jump assessment guide line */}
      {showJumpAssist && jumpAssistDistance >= 0 && (
        <mesh position={[0, -0.42, stageZ + 1.1]}>
          <boxGeometry args={[9.2, 0.03, 0.08]} />
          <meshStandardMaterial color={jumpAssistDistance < 2.2 ? '#22c55e' : '#f59e0b'} emissive={jumpAssistDistance < 2.2 ? '#16a34a' : '#b45309'} emissiveIntensity={0.45} />
        </mesh>
      )}

      {STAGE_Z.map((z, i) => (
        <mesh key={z} position={[0, -0.57, z + 3.5]}>
          <boxGeometry args={[9, 0.05, 0.12]} />
          <meshStandardMaterial color={i <= currentStage ? '#38bdf8' : '#475569'} />
        </mesh>
      ))}

      {stageQuestion &&
        LANES.map((laneX, idx) => {
          const cardW = 1.75 * uiScale
          const cardH = 0.26 * uiScale
          const cardD = 2.4 * uiScale
          const isCorrect = idx === stageQuestion.correctIndex
          const isChosen = chosenIndex === idx
          const isWrongResolve = phase === 'resolve' && !isCorrect
          const vanishOpacity = isWrongResolve ? resolveProgress : 1
          const dropY = isWrongResolve ? (1 - resolveProgress) * -0.8 : 0

          if (phase === 'resolve' && !isCorrect && vanishOpacity < 0.03) return null

          return (
            <group key={idx} position={[laneX, 0.08 + dropY, stageZ]}>
              <mesh>
                <boxGeometry args={[cardW, cardH, cardD]} />
                <meshStandardMaterial
                  color={
                    phase === 'resolve'
                      ? isCorrect
                        ? '#22c55e'
                        : isChosen
                          ? '#ef4444'
                          : '#64748b'
                      : '#6366f1'
                  }
                  emissive={phase === 'resolve' && isCorrect ? '#16a34a' : phase === 'resolve' && isChosen ? '#991b1b' : '#312e81'}
                  emissiveIntensity={phase === 'resolve' ? 0.45 : 0.15}
                  transparent
                  opacity={vanishOpacity}
                />
              </mesh>
              <mesh position={[0, 0.24 * uiScale, 0]}>
                <boxGeometry args={[1.45 * uiScale, 0.1 * uiScale, 2 * uiScale]} />
                <meshStandardMaterial color="#f8fafc" transparent opacity={vanishOpacity} />
              </mesh>
              <mesh position={[0, 0.7 * uiScale, 0]}>
                <boxGeometry args={[1.6 * uiScale, 0.35 * uiScale, 0.08]} />
                <meshStandardMaterial color={phase === 'resolve' && isCorrect ? '#166534' : '#1e3a8a'} emissive="#0f172a" emissiveIntensity={0.25} transparent opacity={vanishOpacity} />
              </mesh>
              <Text
                position={[0, 0.7 * uiScale, 0.07]}
                fontSize={(lowMode ? 0.28 : 0.38) * uiScale}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.015}
                outlineColor="#000000"
              >
                {String.fromCharCode(65 + idx)}: {stageQuestion.options[idx]}
              </Text>
            </group>
          )
        })}

      {[-12, -7, 7, 12].map((x, i) => (
        <group key={`tree-${x}`} position={[x, 0, -28 - i * 28]}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.22, 0.28, 1.5, 10]} />
            <meshStandardMaterial color="#6b3f22" />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <sphereGeometry args={[0.9, treeSegments, treeSegments]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        </group>
      ))}

      {!lowMode && (
        <>
          {/* temples */}
          {[-34, -92].map((z) => (
            <group key={`temple-${z}`} position={[-13.5, -0.25, z]}>
              <mesh position={[0, 0.45, 0]}>
                <boxGeometry args={[2.6, 0.9, 2]} />
                <meshStandardMaterial color="#c08457" />
              </mesh>
              <mesh position={[0, 1.1, 0]}>
                <coneGeometry args={[0.9, 1.2, 4]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
            </group>
          ))}

          {/* cows */}
          {[-18, -48, -78, -118].map((z, idx) => (
            <group key={`cow-${z}`} position={[12.3, -0.55, z]} rotation={[0, idx % 2 === 0 ? Math.PI * 0.18 : -Math.PI * 0.18, 0]}>
              <mesh position={[0, 0.22, 0]}>
                <boxGeometry args={[0.75, 0.38, 0.28]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
              <mesh position={[0.42, 0.28, 0]}>
                <boxGeometry args={[0.22, 0.22, 0.2]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
              {[-0.2, 0.05, 0.2, -0.05].map((xLeg) => (
                <mesh key={xLeg} position={[xLeg, -0.02, 0]}>
                  <boxGeometry args={[0.06, 0.22, 0.06]} />
                  <meshStandardMaterial color="#f8fafc" />
                </mesh>
              ))}
            </group>
          ))}

          {/* flying birds */}
          {[-20, -46, -72, -98, -124].map((z, idx) => (
            <group key={`bird-${z}`} position={[idx % 2 === 0 ? -5.5 : 5.5, 3.2 + (idx % 2) * 0.45, z]}>
              <mesh rotation={[0, 0, 0.45]}>
                <boxGeometry args={[0.35, 0.04, 0.1]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
              <mesh rotation={[0, 0, -0.45]}>
                <boxGeometry args={[0.35, 0.04, 0.1]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
            </group>
          ))}
        </>
      )}

      {[-14, -36, -58, -80, -102, -124].map((z) => (
        <group key={`diya-${z}`} position={[9.1, -0.73, z]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.26, 0.08, 16]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}

      {STAGE_Z.map((z, idx) => (
        <mesh key={`ring-${z}`} position={[0, 0.75, z + 3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.08, 16, 48]} />
          <meshStandardMaterial color={idx % 2 === 0 ? '#fbbf24' : '#f59e0b'} />
        </mesh>
      ))}

      {jumpFx && (
        <group position={[jumpFx.x, 0.46, jumpFx.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1 + (1 - jumpFx.t / 0.35) * 1.6, 1 + (1 - jumpFx.t / 0.35) * 1.6, 1]}>
            <ringGeometry args={[0.26, 0.34, 24]} />
            <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.9} transparent opacity={Math.max(0, jumpFx.t / 0.35)} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const ang = (Math.PI * 2 * i) / 6
            const dist = (1 - jumpFx.t / 0.35) * 0.9
            return (
              <mesh key={i} position={[Math.cos(ang) * dist, 0.05 + dist * 0.2, Math.sin(ang) * dist]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.8} transparent opacity={Math.max(0, jumpFx.t / 0.35)} />
              </mesh>
            )
          })}
        </group>
      )}

      <mesh position={[0, 1.5, STAGE_Z[STAGE_Z.length - 1] - 8]}>
        <boxGeometry args={[8, 3, 0.4]} />
        <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.25} />
      </mesh>

      <PlayerAvatar x={playerX} y={playerY} z={playerZ} anim={avatarAnim} onTap={onAvatarTap} />
    </>
  )
}

function buildStageQuestions(seedAccuracy: number): StageQuestion[] {
  return STAGE_Z.map(() => {
    const q = nextQuestion(seedAccuracy)
    return {
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.options.findIndex((n) => n === q.answer),
    }
  })
}

export default function MathObbyGame() {
  const [questions, setQuestions] = useState<StageQuestion[]>(() => buildStageQuestions(0.7))

  const [laneIndex, setLaneIndex] = useState(1)
  const [playerY, setPlayerY] = useState(0.45)
  const [playerZ, setPlayerZ] = useState(2)
  const [vy, setVy] = useState(0)

  const [phase, setPhase] = useState<Phase>('idle')
  const [paused, setPaused] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [stage, setStage] = useState(0)
  const [score, setScore] = useState(0)
  const [resolveTime, setResolveTime] = useState(0)
  const [chosenIndex, setChosenIndex] = useState<number | null>(null)
  const [jumpBufferMs, setJumpBufferMs] = useState(0)
  const [accuracy, setAccuracy] = useState(0.7)
  const [jumpFx, setJumpFx] = useState<{ t: number; x: number; z: number } | null>(null)
  const [streak, setStreak] = useState(0)
  const [audioOn, setAudioOn] = useState(false)
  const [volume, setVolume] = useState(70)
  const [hapticsOn, setHapticsOn] = useState(true)
  const [showJumpAssist, setShowJumpAssist] = useState(true)
  const [swipeSensitivity, setSwipeSensitivity] = useState(24)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [qualityMode, setQualityMode] = useState<QualityMode>('auto')

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const [viewportWidth, setViewportWidth] = useState(1280)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const ambientIntervalRef = useRef<number | null>(null)

  const currentQuestion = questions[stage] ?? null
  const playerX = LANES[laneIndex]
  const avatarAnim: AvatarAnim = playerY > 0.55 ? 'jump' : phase === 'run' || phase === 'choose' ? 'run' : 'idle'

  const vibrate = (pattern: number | number[]) => {
    if (!hapticsOn) return
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  }

  const playTone = (freq: number, duration = 0.12, type: OscillatorType = 'sine', gainAmount = 0.035) => {
    if (!audioOn) return
    const ctx = audioCtxRef.current
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.value = gainAmount * (volume / 100)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  }

  const startAmbient = async () => {
    try {
      const AudioCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtor) {
        setAudioOn(false)
        return
      }

      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtor()
      if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume()
      if (ambientIntervalRef.current) window.clearInterval(ambientIntervalRef.current)

      // immediate confirmation note so user knows sound is on
      playTone(659.25, 0.22, 'triangle', 0.08)

      const notes = [392, 440, 523.25, 587.33, 659.25]
      let i = 0
      ambientIntervalRef.current = window.setInterval(() => {
        playTone(notes[i % notes.length], 0.24, 'triangle', 0.06)
        i++
      }, 1500)

      setAudioOn(true)
    } catch {
      setAudioOn(false)
    }
  }

  useEffect(() => {
    const setSize = () => setViewportWidth(window.innerWidth)
    setSize()
    window.addEventListener('resize', setSize)

    return () => {
      window.removeEventListener('resize', setSize)
      if (ambientIntervalRef.current) window.clearInterval(ambientIntervalRef.current)
      audioCtxRef.current?.close()
    }
  }, [])

  const reset = () => {
    setQuestions(buildStageQuestions(0.7))
    setLaneIndex(1)
    setPlayerY(0.45)
    setPlayerZ(2)
    setVy(0)
    setPhase('idle')
    setCountdown(3)
    setPaused(false)
    setStage(0)
    setScore(0)
    setResolveTime(0)
    setChosenIndex(null)
    setJumpBufferMs(0)
    setAccuracy(0.7)
    setJumpFx(null)
    setStreak(0)
  }

  const step = (dt: number) => {
    if (phase === 'idle' || paused || phase === 'won' || phase === 'lost') return

    if (jumpFx) {
      const nt = jumpFx.t - dt
      setJumpFx(nt <= 0 ? null : { ...jumpFx, t: nt })
    }

    if (phase === 'countdown') {
      const c = countdown - dt
      setCountdown(c)
      if (c <= 0) {
        setPhase('run')
        setCountdown(0)
      }
      return
    }

    let nz = playerZ
    let nvy = vy - 20 * dt
    let ny = playerY + nvy * dt
    let nextJumpBuffer = Math.max(0, jumpBufferMs - dt)

    if (ny < 0.45) {
      ny = 0.45
      if (nvy < 0) nvy = 0

      // jump input buffer: if user tapped slightly early, jump as soon as grounded
      if (nextJumpBuffer > 0) {
        nvy = 8.8
        nextJumpBuffer = 0
      }
    }

    const stageZ = STAGE_Z[Math.min(stage, STAGE_Z.length - 1)]

    if (phase === 'run') {
      nz -= RUN_SPEED * dt
      if (nz <= stageZ + 7) {
        setPhase('choose')
      }
      setScore((s) => s + Math.floor(5 * dt))
    } else if (phase === 'choose') {
      nz -= CHOOSE_SPEED * dt

      if (nz <= stageZ + 0.8) {
        if (ny <= 0.8) {
          setStreak(0)
          setPhase('lost')
          playTone(180, 0.2, 'sawtooth', 0.03)
          vibrate([80, 30, 80])
        } else if (currentQuestion) {
          const pick = laneIndex
          setChosenIndex(pick)
          const correct = pick === currentQuestion.correctIndex

          if (correct) {
            setStreak((prev) => {
              const ns = prev + 1
              const bonus = ns >= 2 ? ns * 25 : 0
              setScore((s) => s + 150 + bonus)
              return ns
            })
            setAccuracy((a) => Math.min(0.95, a + 0.05))
            setPhase('resolve')
            setResolveTime(RESOLVE_TOTAL)
            playTone(784, 0.11, 'triangle', 0.045)
            playTone(988, 0.1, 'triangle', 0.04)
            vibrate([20, 25, 20])
          } else {
            setStreak(0)
            setAccuracy((a) => Math.max(0.35, a - 0.08))
            setPhase('resolve')
            setResolveTime(RESOLVE_TOTAL)
            playTone(220, 0.18, 'sawtooth', 0.03)
            vibrate([60, 30, 60])
          }
        }
      }
    } else if (phase === 'resolve') {
      const t = resolveTime - dt
      setResolveTime(t)
      if (t <= 0) {
        const correct = currentQuestion && chosenIndex === currentQuestion.correctIndex
        if (!correct) {
          setPhase('lost')
        } else {
          const nextStage = stage + 1
          if (nextStage >= STAGE_Z.length) {
            setPhase('won')
          } else {
            setStage(nextStage)
            setChosenIndex(null)
            setPhase('run')
          }
        }
      }
    }

    setPlayerZ(nz)
    setPlayerY(ny)
    setVy(nvy)
    setJumpBufferMs(nextJumpBuffer)
  }

  const jump = () => {
    if (phase === 'idle') {
      setPhase('countdown')
      setPaused(false)
      return
    }

    if (phase !== 'run' && phase !== 'choose') return
    if (playerY <= 0.46) {
      setVy(8.8)
      setJumpFx({ t: 0.35, x: playerX, z: playerZ })
      playTone(523.25, 0.06, 'triangle', 0.03)
      vibrate(18)
      return
    }

    // queue jump for a short time to improve touch responsiveness
    setJumpBufferMs(0.14)
  }

  const move = (dir: -1 | 1) => {
    if (phase !== 'run' && phase !== 'choose') return
    setLaneIndex((i) => Math.max(0, Math.min(3, i + dir)))
  }

  const chooseLane = (idx: number) => {
    if (phase !== 'run' && phase !== 'choose') return
    setLaneIndex(Math.max(0, Math.min(3, idx)))
  }

  const startRun = () => {
    setQuestions(buildStageQuestions(accuracy))
    setLaneIndex(1)
    setPlayerY(0.45)
    setPlayerZ(2)
    setVy(0)
    setStage(0)
    setScore(0)
    setResolveTime(0)
    setChosenIndex(null)
    setJumpBufferMs(0)
    setStreak(0)
    setCountdown(3)
    setPaused(false)
    setPhase('countdown')
  }

  const toggleStart = () => {
    if (phase === 'idle' || phase === 'won' || phase === 'lost') {
      startRun()
      return
    }

    if (phase === 'run' || phase === 'choose') {
      setPaused((p) => !p)
    }
  }

  const questionProgress = `${Math.min(stage + 1, STAGE_Z.length)}/${STAGE_Z.length}`
  const comboLabel = streak >= 2 ? `🔥 x${streak}` : '—'
  const currentStageZ = STAGE_Z[Math.min(stage, STAGE_Z.length - 1)]
  const jumpAssistDistance = Math.max(0, playerZ - (currentStageZ + 0.8))
  const jumpMeter = Math.max(0, Math.min(1, 1 - jumpAssistDistance / 7))
  const autoLow = (navigator.hardwareConcurrency ?? 4) <= 4
  const resolvedQuality: 'high' | 'low' = qualityMode === 'auto' ? (autoLow ? 'low' : 'high') : qualityMode
  const uiScale = viewportWidth < 520 ? 1.28 : viewportWidth < 860 ? 1.14 : 1

  return (
    <section className="game-wrap">
      <div className="hud premium">
        <span>🌸 Vrindavan Stage {questionProgress}</span>
        <span>⭐ {score}</span>
        <span>🪈 Krishna Avatar</span>
        <span>{comboLabel}</span>
        <span>🔉 {volume}%</span>
        <span>🎯 {Math.round(accuracy * 100)}% skill</span>
      </div>

      <div className="question-strip">
        <div>
          <small>Jump to the correct platform</small>
          <p>{currentQuestion?.prompt ?? 'Finalizing run...'}</p>
        </div>
        <div className="audio-row">
          <button className="sound-toggle" onClick={startAmbient} type="button">
            {audioOn ? '🔊 Flute On' : '🔈 Enable Flute'}
          </button>
          <label className="volume-control">
            Volume
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </label>
        </div>
        {showJumpAssist && (
          <div className="jump-meter" aria-label="jump timing meter">
            <span>Jump Timing</span>
            <div className="jump-meter-track">
              <div className="jump-meter-fill" style={{ width: `${Math.round(jumpMeter * 100)}%` }} />
            </div>
            <small>{jumpAssistDistance < 2.2 ? 'JUMP NOW' : `Distance ${jumpAssistDistance.toFixed(1)}m`}</small>
          </div>
        )}
        <small className="platform-note">Options are on the 4 platforms (A/B/C/D). Jump on the correct one.</small>
        <button className="settings-btn" type="button" onClick={() => setSettingsOpen((v) => !v)}>
          {settingsOpen ? 'Hide Settings' : 'Open Settings'}
        </button>
        {settingsOpen && (
          <div className="settings-drawer">
            <label className="setting-item">
              <span>Haptics</span>
              <input type="checkbox" checked={hapticsOn} onChange={(e) => setHapticsOn(e.target.checked)} />
            </label>
            <label className="setting-item">
              <span>Jump Assist</span>
              <input type="checkbox" checked={showJumpAssist} onChange={(e) => setShowJumpAssist(e.target.checked)} />
            </label>
            <label className="setting-item setting-range">
              <span>Swipe Sensitivity ({swipeSensitivity}px)</span>
              <input type="range" min={12} max={80} step={2} value={swipeSensitivity} onChange={(e) => setSwipeSensitivity(Number(e.target.value))} />
            </label>
            <label className="setting-item setting-range">
              <span>Graphics Quality ({qualityMode.toUpperCase()})</span>
              <select value={qualityMode} onChange={(e) => setQualityMode(e.target.value as QualityMode)}>
                <option value="auto">Auto</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>
        )}
      </div>

      <div
        className="canvas-shell"
        onClick={() => jump()}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null
          touchStartY.current = e.touches[0]?.clientY ?? null
        }}
        onTouchEnd={(e) => {
          const startX = touchStartX.current
          const startY = touchStartY.current
          const endX = e.changedTouches[0]?.clientX
          const endY = e.changedTouches[0]?.clientY
          if (startX == null || endX == null) return

          const dx = endX - startX
          const dy = (endY ?? startY ?? 0) - (startY ?? endY ?? 0)

          // short tap on obby area = jump
          if (Math.abs(dx) < swipeSensitivity && Math.abs(dy) < 18) {
            jump()
            return
          }

          // swipe = lane change
          if (Math.abs(dx) >= swipeSensitivity) {
            if (dx > 0) move(1)
            else move(-1)
          }
        }}
      >
        <Canvas>
          <World
            playerX={playerX}
            playerY={playerY}
            playerZ={playerZ}
            currentStage={stage}
            phase={phase}
            countdown={countdown}
            stageQuestion={currentQuestion}
            chosenIndex={chosenIndex}
            resolveTime={resolveTime}
            avatarAnim={avatarAnim}
            jumpFx={jumpFx}
            jumpAssistDistance={jumpAssistDistance}
            showJumpAssist={showJumpAssist}
            quality={resolvedQuality}
            uiScale={uiScale}
            onAvatarTap={jump}
            onTick={step}
          />
        </Canvas>

        <div className="question-float">
          <span>QUESTION</span>
          <strong>{currentQuestion?.prompt ?? 'Stay ready…'}</strong>
        </div>

        {currentQuestion && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 10,
              transform: 'translateX(-50%)',
              width: 'min(96%, 760px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 8,
              zIndex: 12,
            }}
          >
            {currentQuestion.options.map((opt, idx) => (
              <div
                key={`${opt}-${idx}`}
                onClick={(e) => {
                  e.stopPropagation()
                  chooseLane(idx)
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  chooseLane(idx)
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation()
                }}
                style={{
                  borderRadius: 10,
                  padding: viewportWidth < 520 ? '10px 8px' : '8px 10px',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: viewportWidth < 520 ? 16 : 14,
                  color: '#ffffff',
                  background: idx === laneIndex ? 'rgba(14,116,144,0.95)' : 'rgba(15,23,42,0.82)',
                  border: idx === laneIndex ? '2px solid #67e8f9' : '1px solid rgba(255,255,255,0.28)',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                }}
              >
                {String.fromCharCode(65 + idx)}: {opt}
              </div>
            ))}
          </div>
        )}

        {phase === 'idle' && (
          <div className="countdown-overlay" style={{ cursor: 'pointer' }} onClick={toggleStart}>
            <div className="countdown-badge" style={{ width: 110, height: 110, fontSize: '1.2rem' }}>START</div>
            <p>Tap START (or tap Jump) to begin</p>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="countdown-overlay">
            <div className="countdown-badge">{Math.max(1, Math.ceil(countdown))}</div>
            <p>Get Ready… Vrindavan run starts now</p>
          </div>
        )}
      </div>

      <div className="controls" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <button onClick={() => move(-1)} disabled={phase === 'countdown' || phase === 'idle' || paused}>
          ◀ Left
        </button>
        <button
          onClick={jump}
          onPointerDown={(e) => {
            e.preventDefault()
            jump()
          }}
          onTouchStart={(e) => {
            e.preventDefault()
            jump()
          }}
          disabled={phase === 'countdown' || phase === 'idle' || paused}
        >
          ⤒ Jump
        </button>
        <button onClick={() => move(1)} disabled={phase === 'countdown' || phase === 'idle' || paused}>
          Right ▶
        </button>
        <button onClick={toggleStart}>
          {phase === 'idle' ? 'Start' : paused ? 'Resume' : phase === 'run' || phase === 'choose' ? 'Pause' : 'Start'}
        </button>
      </div>

      <p className="hint">Tap Krishna or tap jump button to jump. Swipe left/right to change lane. Jump to the correct platform answer.</p>

      {(phase === 'won' || phase === 'lost') && (
        <div className="modal">
          <div className="card">
            <h3>{phase === 'won' ? 'Market-ready obby clear! 🚀' : 'Missed platform'}</h3>
            <p>
              {phase === 'won'
                ? 'Nice run. You cleared all stages with math decisions.'
                : 'Either wrong platform or no jump at checkpoint. Try again.'}
            </p>
            <button onClick={reset}>Play Again</button>
          </div>
        </div>
      )}
    </section>
  )
}
