import { useState } from "react"
import { useOrderNotifications } from "../hooks/useOrderNotifications"
import { Bell, X, Wifi, Loader } from "lucide-react"

/**
 * Component hiển thị real-time order notifications
 * Support WS + Polling
 */

export function OrderNotificationBell() {
  const {
    notifications,
    unreadCount,
    isConnected,
    usePolling,
    markAsRead,
    clearNotifications,
  } = useOrderNotifications()

  const [showPanel, setShowPanel] = useState(false)

  return (
    <div className="relative">
      {/* Bell icon */}
      <button
        onClick={() => {
          setShowPanel(!showPanel)
          markAsRead()
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {Math.min(unreadCount, 9)}+
          </span>
        )}
      </button>

      {/* Connection status indicator */}
      <div
        className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
          isConnected ? "bg-green-500" : usePolling ? "bg-yellow-500" : "bg-red-500"
        }`}
        title={
          isConnected
            ? "Real-time connected"
            : usePolling
              ? "Using polling fallback"
              : "Disconnected"
        }
      />

      {/* Notifications panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="font-bold text-lg">Thông báo</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {isConnected ? (
                  <>
                    <Wifi size={12} className="text-green-500" />
                    <span>WebSocket</span>
                  </>
                ) : usePolling ? (
                  <>
                    <Loader size={12} className="text-yellow-500 animate-spin" />
                    <span>Polling</span>
                  </>
                ) : (
                  <span>Offline</span>
                )}
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>Không có thông báo</p>
              </div>
            ) : (
              notifications.map((notif, idx) => (
                <div
                  key={idx}
                  className="p-4 hover:bg-gray-50 transition cursor-pointer border-l-4 border-brand-blue"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Đơn #{notif.orderId}
                      </p>
                      {notif.status && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {notif.status}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t p-3 text-center">
              <button
                onClick={clearNotifications}
                className="text-sm text-brand-blue hover:text-brand-blue-dark"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

