import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { TugEvent } from './types'

export function useTugRoom(roomId: string, playerId: string, name: string) {
  const [connected, setConnected] = useState(false)
  const [players, setPlayers] = useState<Record<string, { name: string; joinedAt: number }>>({})
  const [events, setEvents] = useState<TugEvent[]>([])
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!roomId) return
    if (!supabase) return

    const ch = supabase.channel(`tug:${roomId}`, {
      config: { broadcast: { self: true } },
    })

    channelRef.current = ch

    ch.on('broadcast', { event: 'game' }, ({ payload }) => {
      const event = payload as TugEvent
      setEvents((prev) => [...prev.slice(-80), event])

      if (event.type === 'hello') {
        setPlayers((p) => ({ ...p, [event.playerId]: { name: event.name, joinedAt: event.joinedAt } }))
      }
    })

    ch.subscribe((status) => {
      setConnected(status === 'SUBSCRIBED')
      if (status === 'SUBSCRIBED') {
        const hello: TugEvent = { type: 'hello', playerId, name, joinedAt: Date.now() }
        ch.send({ type: 'broadcast', event: 'game', payload: hello })
      }
    })

    return () => {
      ch.unsubscribe()
      setConnected(false)
      channelRef.current = null
    }
  }, [roomId, playerId, name])

  const send = (event: TugEvent) => {
    channelRef.current?.send({ type: 'broadcast', event: 'game', payload: event })
  }

  const orderedPlayers = useMemo(
    () =>
      Object.entries(players)
        .sort((a, b) => a[1].joinedAt - b[1].joinedAt)
        .map(([id, p]) => ({ id, ...p })),
    [players]
  )

  return { connected, players: orderedPlayers, events, send }
}
