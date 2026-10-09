import { useEffect, useState, useCallback } from "react";
import { useRealtimeConnection } from "./useRealtimeConnection";

/**
 * Hook để track order updates realtime
 * Sử dụng WS + Polling fallback
 */

export interface OrderNotification {
  id?: number | string;
  eventType: string;
  source?: string;
  orderId: number;
  userId: number;
  status?: string;
  message?: string;
  timestamp: number;
  readFlag?: boolean;
  category?: "order" | "payment" | "other";
}

export function useOrderNotifications() {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isConnected, usePolling, lastMessage, subscribe } =
    useRealtimeConnection({
      wsUrl: "",
      pollInterval: 5000,
      autoConnect: true,
    });

  // Subscribe to order channel
  useEffect(() => {
    subscribe("orders");
  }, [subscribe]);

  // Listen to WebSocket/Polling messages
  useEffect(() => {
    if (!lastMessage) return;

    // Handle realtime message
    if (lastMessage.type === "ws") {
      const event = lastMessage.data;
      const normalized = normalizeIncomingNotification(event);
      if (normalized) {
        addNotification(normalized);
      }
    }
    // Handle polling message
    else if (lastMessage.type === "poll" && Array.isArray(lastMessage.data)) {
      lastMessage.data.forEach((item: any) => {
        const normalized = normalizeIncomingNotification(item);
        if (normalized) {
          addNotification(normalized);
        }
      });
    }
  }, [lastMessage]);

  function normalizeIncomingNotification(item: any): OrderNotification | null {
    if (!item?.eventType) {
      return null;
    }

    if (
      !item.eventType.startsWith("ORDER_") &&
      !item.eventType.startsWith("PAYMENT_")
    ) {
      return null;
    }

    const payload = item.payload || item.data || {};
    const category = item.eventType.startsWith("PAYMENT_")
      ? "payment"
      : "order";

    return {
      id: item.id,
      eventType: item.eventType,
      source: item.source || category.toUpperCase(),
      orderId: Number(item.orderId || item.entityId || payload.orderId || 0),
      userId: Number(item.userId || payload.userId || 0),
      status: item.status || payload.status || payload.newStatus,
      message: getMessageForEvent(item.eventType, payload),
      timestamp: Date.now(),
      readFlag: Boolean(item.readFlag),
      category,
    };
  }

  const addNotification = useCallback((notif: OrderNotification) => {
    setNotifications((prev) => {
      // Avoid duplicates
      const isDuplicate = prev.some(
        (n) =>
          n.eventType === notif.eventType &&
          n.orderId === notif.orderId &&
          Date.now() - n.timestamp < 1000,
      );
      if (isDuplicate) return prev;
      return [notif, ...prev].slice(0, 50); // Keep last 50
    });
    setUnreadCount((prev) => prev + 1);
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    usePolling,
    markAsRead,
    clearNotifications,
  };
}

function getMessageForEvent(eventType: string, data: any): string {
  const messages: Record<string, string> = {
    ORDER_CREATED: "✅ Đơn hàng của bạn đã được tạo",
    ORDER_CONFIRMED: "✅ Đơn hàng đã được xác nhận",
    ORDER_SHIPPING: "🚚 Đơn hàng đang được vận chuyển",
    ORDER_COMPLETED: "🎉 Đơn hàng đã hoàn thành",
    ORDER_CANCELLED: "❌ Đơn hàng đã bị hủy",
    ORDER_STATUS_CHANGED: `📝 Trạng thái thay đổi: ${data?.newStatus}`,
    PAYMENT_CREATED: "💳 Thanh toán đã được tạo",
    PAYMENT_UPDATED: "💳 Thanh toán đã được cập nhật",
    PAYMENT_CHECKOUT_REFRESHED: "🔄 Link thanh toán đã được làm mới",
    PAYMENT_STATUS_CHANGED: `💰 Trạng thái thanh toán: ${data?.status || data?.newStatus || "đã thay đổi"}`,
  };
  return messages[eventType] || `📩 Có cập nhật mới: ${eventType}`;
}
