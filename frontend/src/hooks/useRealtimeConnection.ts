import { useEffect, useRef, useCallback, useState } from "react"
import axiosClient from "../api/axiosClient"
import { getToken } from "../utils/auth"

interface UseRealtimeOptions {
  wsUrl?: string
  pollInterval?: number
  autoConnect?: boolean
  pollEndpoints?: string[]
}

interface RealtimeMessage {
  type: "ws" | "poll"
  channel: string
  data: any
  timestamp: number
}

export function useRealtimeConnection(options: UseRealtimeOptions = {}) {
  const {
    wsUrl = "",
    pollInterval = 5000,
    autoConnect = true,
    pollEndpoints = [
      "/notifications/orders/me?limit=5",
      "/notifications/payments/me?limit=5",
    ],
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [usePolling, setUsePolling] = useState(false)
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollFailureCountRef = useRef(0)
  const pollPausedUntilRef = useRef(0)

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
    pollFailureCountRef.current = 0
    pollPausedUntilRef.current = 0
    setIsConnected(false)
    setUsePolling(false)
  }, [])

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) {
      return
    }

    setUsePolling(true)
    console.log("[Polling] Started, interval:", pollInterval)

    pollTimerRef.current = setInterval(async () => {
      if (Date.now() < pollPausedUntilRef.current) {
        return
      }

      try {
        const responses = await Promise.all(
          pollEndpoints.map((endpoint) =>
            axiosClient.get(endpoint).then((response) => response.data).catch(() => null)
          )
        )
        const failedResponses = responses.filter((data) => data === null).length
        if (failedResponses === responses.length) {
          pollFailureCountRef.current += 1
          if (pollFailureCountRef.current >= 3) {
            pollPausedUntilRef.current = Date.now() + 30000
            pollFailureCountRef.current = 0
          }
          return
        }

        pollFailureCountRef.current = 0

        for (const data of responses) {
          if (Array.isArray(data) && data.length > 0) {
            setLastMessage({
              type: "poll",
              channel: "polling",
              data,
              timestamp: Date.now(),
            })
          }
        }
      } catch (error) {
        pollFailureCountRef.current += 1
        if (pollFailureCountRef.current >= 3) {
          pollPausedUntilRef.current = Date.now() + 30000
          pollFailureCountRef.current = 0
        }
        console.warn("[Polling] Error fetching updates", error)
      }
    }, pollInterval)
  }, [pollEndpoints, pollInterval])

  const connectWebSocket = useCallback(() => {
    if (!wsUrl) {
      startPolling()
      return
    }

    try {
      const token = getToken()
      const socketUrl = buildWebSocketUrl(wsUrl, token)
      const socket = new WebSocket(socketUrl)

      socket.onopen = () => {
        console.log("[WS] Connected")
        setIsConnected(true)
        setUsePolling(false)
        socket.send(JSON.stringify({ type: "ping" }))
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage({
            type: "ws",
            channel: data.channel || "unknown",
            data,
            timestamp: Date.now(),
          })
        } catch (error) {
          console.warn("[WS] Failed to parse message", error)
        }
      }

      socket.onerror = (error) => {
        console.error("[WS] Connection error", error)
        socket.close()
      }

      socket.onclose = () => {
        console.log("[WS] Connection closed, trying polling fallback...")
        setIsConnected(false)
        wsRef.current = null
        startPolling()
      }

      wsRef.current = socket
    } catch (error) {
      console.error("[WS] Connection failed", error)
      startPolling()
    }
  }, [startPolling, wsUrl])

  useEffect(() => {
    if (!autoConnect) return

    connectWebSocket()

    return () => {
      cleanup()
    }
  }, [autoConnect, cleanup, connectWebSocket])

  const subscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "subscribe",
          channel,
        })
      )
    }
  }, [])

  return {
    isConnected,
    usePolling,
    lastMessage,
    subscribe,
    reconnect: connectWebSocket,
    disconnect: cleanup,
  }
}

function buildWebSocketUrl(wsUrl: string, token: string | null) {
  if (!token) return wsUrl

  try {
    const url = new URL(wsUrl, window.location.origin)
    url.searchParams.set("token", token)
    return url.toString()
  } catch {
    const separator = wsUrl.includes("?") ? "&" : "?"
    return `${wsUrl}${separator}token=${encodeURIComponent(token)}`
  }
}
