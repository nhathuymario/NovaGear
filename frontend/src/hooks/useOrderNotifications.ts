import { useEffect, useState, useCallback } from "react"
import { useRealtimeConnection } from "./useRealtimeConnection"

/**
 * Hook để track order updates realtime
 * Sử dụng WS + Polling fallback
 */

export interface OrderNotification {
  eventType: string
  orderId: number
  userId: number
  status?: string
  message?: string
  timestamp: number
}

export function useOrderNotifications() {
  const [notifications, setNotifications] = useState<OrderNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const { isConnected, usePolling, lastMessage, subscribe } =
    useRealtimeConnection({
      wsUrl: "ws://localhost:8088/api/ws",
      pollInterval: 5000,
      autoConnect: true,
    })

  // Subscribe to order channel
  useEffect(() => {
    subscribe("orders")
  }, [subscribe])

  // Listen to WebSocket/Polling messages
  useEffect(() => {
    if (!lastMessage) return

    // Handle realtime message
    if (lastMessage.type === "ws") {
      const event = lastMessage.data
      if (event.eventType?.startsWith("ORDER_")) {
        addNotification({
          eventType: event.eventType,
          orderId: event.entityId,
          userId: event.userId,
          status: event.data?.newStatus,
          message: getMessageForEvent(event.eventType, event.data),
          timestamp: Date.now(),
        })
      }
    }
    // Handle polling message
    else if (lastMessage.type === "poll" && Array.isArray(lastMessage.data)) {
      lastMessage.data.forEach((item: any) => {
        if (item.eventType?.startsWith("ORDER_")) {
          addNotification({
            eventType: item.eventType,
            orderId: item.orderId || item.id,
            userId: item.userId,
            status: item.status,
            message: getMessageForEvent(item.eventType, item),
            timestamp: Date.now(),
          })
        }
      })
    }
  }, [lastMessage])

  const addNotification = useCallback((notif: OrderNotification) => {
    setNotifications((prev) => {
      // Avoid duplicates
      const isDuplicate = prev.some(
        (n) =>
          n.eventType === notif.eventType &&
          n.orderId === notif.orderId &&
          Date.now() - n.timestamp < 1000
      )
      if (isDuplicate) return prev
      return [notif, ...prev].slice(0, 50) // Keep last 50
    })
    setUnreadCount((prev) => prev + 1)
  }, [])

  const markAsRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    isConnected,
    usePolling,
    markAsRead,
    clearNotifications,
  }
}

function getMessageForEvent(
  eventType: string,
  data: any
): string {
  const messages: Record<string, string> = {
    ORDER_CREATED: "✅ Đơn hàng của bạn đã được tạo",
    ORDER_CONFIRMED: "✅ Đơn hàng đã được xác nhận",
    ORDER_SHIPPING: "🚚 Đơn hàng đang được vận chuyển",
    ORDER_COMPLETED: "🎉 Đơn hàng đã hoàn thành",
    ORDER_CANCELLED: "❌ Đơn hàng đã bị hủy",
    ORDER_STATUS_CHANGED: `📝 Trạng thái thay đổi: ${data?.newStatus}`,
  }
  return messages[eventType] || `📦 Cập nhật đơn hàng: ${eventType}`
}

