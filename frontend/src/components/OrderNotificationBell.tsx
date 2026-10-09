import { useState } from "react";
import { useOrderNotifications } from "../hooks/useOrderNotifications";
import { Bell, X, Wifi, Loader, CreditCard, Package } from "lucide-react";

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
  } = useOrderNotifications();

  const [showPanel, setShowPanel] = useState(false);

  const getCategoryLabel = (category?: string) => {
    if (category === "payment") return "Thanh toán";
    if (category === "order") return "Đơn hàng";
    return "Thông báo";
  };

  const getCategoryIcon = (category?: string) => {
    if (category === "payment") {
      return <CreditCard size={14} className="text-emerald-500" />;
    }
    return <Package size={14} className="text-blue-500" />;
  };

  let connectionDotClass = "bg-red-500";
  let connectionTitle = "Disconnected";
  let connectionLabel = <span>Offline</span>;

  if (isConnected) {
    connectionDotClass = "bg-green-500";
    connectionTitle = "Real-time connected";
    connectionLabel = (
      <>
        <Wifi size={12} className="text-green-500" />
        <span>WebSocket</span>
      </>
    );
  } else if (usePolling) {
    connectionDotClass = "bg-yellow-500";
    connectionTitle = "Using polling fallback";
    connectionLabel = (
      <>
        <Loader size={12} className="text-yellow-500 animate-spin" />
        <span>Polling</span>
      </>
    );
  }

  return (
    <div className="relative">
      {/* Bell icon */}
      <button
        onClick={() => {
          setShowPanel(!showPanel);
          markAsRead();
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
        className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${connectionDotClass}`}
        title={connectionTitle}
      />

      {/* Notifications panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="font-bold text-lg">
              Thông báo đơn hàng & thanh toán
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {connectionLabel}
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
              notifications.map((notif) => (
                <div
                  key={
                    notif.id
                      ? String(notif.id)
                      : `${notif.eventType}-${notif.orderId}-${notif.timestamp}`
                  }
                  className="p-4 hover:bg-gray-50 transition cursor-pointer border-l-4 border-brand-blue"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        {getCategoryIcon(notif.category)}
                        <span>{getCategoryLabel(notif.category)}</span>
                        {notif.source && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5">
                            {notif.source}
                          </span>
                        )}
                      </div>
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
  );
}
