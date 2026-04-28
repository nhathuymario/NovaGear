import { useEffect, useRef, useCallback, useState } from "react"

/**
 * Hook để connect WebSocket với fallback polling
 * 
 * Sử dụng: 
 * const { isConnected, lastMessage } = useRealtimeConnection()
 */

interface UseRealtimeOptions {
  wsUrl?: string
  pollUrl?: string
  pollInterval?: number // milliseconds
  autoConnect?: boolean
}

interface RealtimeMessage {
  type: "ws" | "poll"
  channel: string
  data: any
  timestamp: number
}

export function useRealtimeConnection(options: UseRealtimeOptions = {}) {
  const {
    wsUrl = "ws://localhost:8088/api/ws",
    pollInterval = 5000, // 5 seconds default
    autoConnect = true,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [usePolling, setUsePolling] = useState(false)
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
    setIsConnected(false)
    setUsePolling(false)
  }, [])

  // Try WebSocket connection first
  const connectWebSocket = useCallback(() => {
    try {
      // Format: ws://host/api/ws -> /api/ws
      const socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        console.log("[WS] Connected")
        setIsConnected(true)
        setUsePolling(false)

        // Send ping to verify connection
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
        } catch (e) {
          console.warn("[WS] Failed to parse message", e)
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
        // Fallback to polling
        startPolling()
      }

      wsRef.current = socket
    } catch (error) {
      console.error("[WS] Connection failed", error)
      startPolling()
    }
  }, [wsUrl])

  // Polling fallback
  const startPolling = useCallback(() => {
    setUsePolling(true)
    console.log("[Polling] Started, interval:", pollInterval)

    pollTimerRef.current = setInterval(async () => {
      try {
        // Poll từ các endpoints
        const responses = await Promise.all([
          fetch("/api/notifications/orders/me?limit=5").catch(() => null),
          fetch("/api/notifications/payments/me?limit=5").catch(() => null),
        ])

        for (const response of responses) {
          if (response?.ok) {
            const data = await response.json()
            if (Array.isArray(data) && data.length > 0) {
              setLastMessage({
                type: "poll",
                channel: "polling",
                data,
                timestamp: Date.now(),
              })
            }
          }
        }
      } catch (error) {
        console.warn("[Polling] Error fetching updates", error)
      }
    }, pollInterval)
  }, [pollInterval])

  // Initialize connection
  useEffect(() => {
    if (!autoConnect) return

    connectWebSocket()

    return () => {
      cleanup()
    }
  }, [autoConnect, connectWebSocket, cleanup])

  // Subscribe to a channel
  const subscribe = useCallback(
    (channel: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "subscribe",
            channel,
          })
        )
      }
      // Polling fallback handled by main component
    },
    []
  )

  return {
    isConnected,
    usePolling,
    lastMessage,
    subscribe,
    reconnect: connectWebSocket,
    disconnect: cleanup,
  }
}

