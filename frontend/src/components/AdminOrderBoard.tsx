import { useEffect, useState, useCallback } from "react"
import { useRealtimeConnection } from "../hooks/useRealtimeConnection"

/**
 * Admin Order Board: realtime order tracking
 * Dùng WS để get live updates instead of polling mỗi 30s
 */

interface AdminOrder {
  id: number
  orderCode: string
  customerName: string
  totalAmount: number
  status: "PENDING" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED"
  paymentStatus: string
  createdAt: string
}

export function AdminOrderBoard() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
  })

  const { isConnected, usePolling, lastMessage, subscribe } =
    useRealtimeConnection({
      wsUrl: "ws://localhost:8083/api/ws",
      pollInterval: 10000, // 10s default
      autoConnect: true,
    })

  // Load initial orders
  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : data.content || [])
        updateStats(data)
      }
    } catch (error) {
      console.error("Failed to load orders", error)
    } finally {
      setLoading(false)
    }
  }, [])

    useEffect(() => {
        loadOrders()
        subscribe("admin/orders")
    }, [loadOrders, subscribe])

  // Listen to realtime updates
  useEffect(() => {
    if (!lastMessage?.data) return

    const event = lastMessage.data
    if (
      event.eventType?.startsWith("ORDER_") ||
      event.eventType?.startsWith("PAYMENT_")
    ) {
      handleOrderUpdate(event)
    }
  }, [lastMessage])

  const handleOrderUpdate = (event: any) => {
    const orderId = event.entityId || event.orderId
    if (!orderId) return

    setOrders((prev) => {
      const updated = prev.map((order) =>
        order.id.toString() === orderId.toString()
          ? {
              ...order,
              status: event.data?.newStatus || order.status,
              paymentStatus: event.data?.paymentStatus || order.paymentStatus,
            }
          : order
      )
      updateStats(updated)
      return updated
    })

    console.log(`Order ${orderId} updated via ${lastMessage?.type}`)
  }

  const updateStats = (orderList: AdminOrder[]) => {
    setStats({
      pending: orderList.filter((o) => o.status === "PENDING").length,
      confirmed: orderList.filter((o) => o.status === "CONFIRMED").length,
      shipping: orderList.filter((o) => o.status === "SHIPPING").length,
      completed: orderList.filter((o) => o.status === "COMPLETED").length,
    })
  }

  if (loading) return <div className="p-4">Đang tải đơn hàng...</div>

  return (
    <div className="space-y-4">
      {/* Connection status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : usePolling ? "bg-yellow-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {isConnected
              ? "🟢 Real-time Connected"
              : usePolling
                ? "🟡 Polling (WS down)"
                : "🔴 Offline"}
          </span>
        </div>
        <button
          onClick={loadOrders}
          className="text-sm px-3 py-1 bg-white border rounded hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Chờ xác nhận", count: stats.pending, color: "bg-yellow-100" },
          { label: "Đã xác nhận", count: stats.confirmed, color: "bg-blue-100" },
          { label: "Đang giao", count: stats.shipping, color: "bg-purple-100" },
          { label: "Đã hoàn thành", count: stats.completed, color: "bg-green-100" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-lg p-4`}>
            <div className="text-3xl font-bold">{stat.count}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg overflow-hidden shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Mã đơn</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Khách hàng</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tổng tiền</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Thanh toán</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">{order.orderCode}</td>
                <td className="px-4 py-3 text-sm">{order.customerName}</td>
                <td className="px-4 py-3 text-sm font-semibold text-brand-red">
                  {order.totalAmount.toLocaleString("vi-VN")}đ
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "CONFIRMED"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "SHIPPING"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Cập nhật tự động qua {isConnected ? "WebSocket" : usePolling ? "Polling" : "kết nối"}
      </p>
    </div>
  )
}

