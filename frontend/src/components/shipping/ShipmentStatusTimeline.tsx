import type { Shipment } from "../../types/shipping"

interface ShipmentStatusTimelineProps {
    shipment: Shipment
}

function getStatusIcon(toStatus: string): string {
    const iconMap: Record<string, string> = {
        READY_TO_SHIP: "📦",
        SHIPPED: "📬",
        IN_TRANSIT: "🚚",
        OUT_FOR_DELIVERY: "🚗",
        DELIVERED: "✅",
        CANCELLED: "❌",
        RETURNED: "↩️",
    }
    return iconMap[toStatus] || "📍"
}

function getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
        READY_TO_SHIP: "Chờ gửi",
        SHIPPED: "Đã gửi",
        IN_TRANSIT: "Vận chuyển",
        OUT_FOR_DELIVERY: "Đang giao",
        DELIVERED: "Đã giao",
        CANCELLED: "Hủy",
        RETURNED: "Hoàn trả",
    }
    return labelMap[status] || status
}

export default function ShipmentStatusTimeline({ shipment }: ShipmentStatusTimelineProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Lịch sử vận chuyển</h3>

            {shipment.events && shipment.events.length > 0 ? (
                <div className="mt-6 space-y-4">
                    {shipment.events.map((event, index) => (
                        <div key={event.id} className="flex gap-4">
                            {/* Timeline line and dot */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                                        index === 0
                                            ? "bg-admin-accent/20 text-admin-accent"
                                            : "bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    {getStatusIcon(event.toStatus)}
                                </div>
                                {index < shipment.events.length - 1 && (
                                    <div className="h-12 w-0.5 bg-slate-200" />
                                )}
                            </div>

                            {/* Event info */}
                            <div className="flex-1 pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {getStatusLabel(event.toStatus)}
                                        </p>
                                        {event.note && (
                                            <p className="mt-1 text-sm text-slate-600">
                                                {event.note}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-slate-500">
                                            Người: {event.changedBy || "System"} • Lúc:{" "}
                                            {new Date(event.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-6 rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
                    Chưa có sự kiện nào
                </div>
            )}

            {/* Current status summary */}
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Trạng thái hiện tại
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                    {getStatusLabel(shipment.status)}
                </p>
                {shipment.statusNote && (
                    <p className="mt-1 text-sm text-slate-600">{shipment.statusNote}</p>
                )}
                {shipment.estimatedDeliveryAt && (
                    <p className="mt-2 text-sm text-slate-700">
                        <span className="font-medium">Dự kiến giao:</span>{" "}
                        {new Date(shipment.estimatedDeliveryAt).toLocaleString("vi-VN")}
                    </p>
                )}
            </div>
        </div>
    )
}

