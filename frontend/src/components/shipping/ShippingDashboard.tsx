import { useEffect, useState } from "react"
import { getAdminShipments } from "../../api/shippingApi"
import type { Shipment, ShipmentStatus } from "../../types/shipping"

interface DashboardStats {
    totalShipments: number
    readyToShip: number
    shipped: number
    inTransit: number
    outForDelivery: number
    delivered: number
    cancelled: number
    returned: number
    deliveredToday: number
}

export default function ShippingDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalShipments: 0,
        readyToShip: 0,
        shipped: 0,
        inTransit: 0,
        outForDelivery: 0,
        delivered: 0,
        cancelled: 0,
        returned: 0,
        deliveredToday: 0,
    })
    const [loading, setLoading] = useState(true)

    const calculateStats = (shipments: Shipment[]): DashboardStats => {
        const today = new Date().toDateString()
        const stats: DashboardStats = {
            totalShipments: shipments.length,
            readyToShip: 0,
            shipped: 0,
            inTransit: 0,
            outForDelivery: 0,
            delivered: 0,
            cancelled: 0,
            returned: 0,
            deliveredToday: 0,
        }

        shipments.forEach((shipment) => {
            const status = shipment.status as ShipmentStatus
            const statusMap: Record<ShipmentStatus, keyof DashboardStats> = {
                READY_TO_SHIP: "readyToShip",
                SHIPPED: "shipped",
                IN_TRANSIT: "inTransit",
                OUT_FOR_DELIVERY: "outForDelivery",
                DELIVERED: "delivered",
                CANCELLED: "cancelled",
                RETURNED: "returned",
            }
            const statKey = statusMap[status]
            if (statKey && statKey !== "totalShipments") {
                stats[statKey]++
            }

            if (
                status === "DELIVERED" &&
                shipment.deliveredAt &&
                new Date(shipment.deliveredAt).toDateString() === today
            ) {
                stats.deliveredToday++
            }
        })

        return stats
    }

    const loadDashboard = async () => {
        try {
            setLoading(true)
            const shipments = await getAdminShipments()
            setStats(calculateStats(shipments))
        } catch (error) {
            console.error("Failed to load shipping dashboard:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboard()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-accent border-t-transparent" />
            </div>
        )
    }

    const statCards = [
        {
            label: "Tổng vận chuyển",
            value: stats.totalShipments,
            color: "bg-blue-50 text-blue-700 ring-blue-100",
            icon: "📦",
        },
        {
            label: "Chờ gửi",
            value: stats.readyToShip,
            color: "bg-yellow-50 text-yellow-700 ring-yellow-100",
            icon: "⏳",
        },
        {
            label: "Đã gửi",
            value: stats.shipped,
            color: "bg-orange-50 text-orange-700 ring-orange-100",
            icon: "📬",
        },
        {
            label: "Đang vận chuyển",
            value: stats.inTransit,
            color: "bg-indigo-50 text-indigo-700 ring-indigo-100",
            icon: "🚚",
        },
        {
            label: "Đang giao",
            value: stats.outForDelivery,
            color: "bg-purple-50 text-purple-700 ring-purple-100",
            icon: "🚗",
        },
        {
            label: "Đã giao",
            value: stats.delivered,
            color: "bg-emerald-50 text-emerald-700 ring-emerald-100",
            icon: "✅",
        },
        {
            label: "Đã giao hôm nay",
            value: stats.deliveredToday,
            color: "bg-green-50 text-green-700 ring-green-100",
            icon: "🎉",
        },
        {
            label: "Hoàn trả",
            value: stats.returned,
            color: "bg-red-50 text-red-700 ring-red-100",
            icon: "↩️",
        },
        {
            label: "Hủy",
            value: stats.cancelled,
            color: "bg-slate-50 text-slate-700 ring-slate-100",
            icon: "❌",
        },
    ]

    const successRate = stats.totalShipments > 0
        ? Math.round((stats.delivered / stats.totalShipments) * 100)
        : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Vận Chuyển</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Tổng quan thực tế về tình trạng vận chuyển hôm nay
                    </p>
                </div>
                <button
                    onClick={loadDashboard}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    🔄 Làm mới
                </button>
            </div>

            {/* Success Rate Card */}
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-admin-accent/10 to-admin-accent/5 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600">Tỉ lệ giao thành công</p>
                        <p className="mt-2 text-4xl font-bold text-admin-accent">{successRate}%</p>
                    </div>
                    <div className="text-5xl">📊</div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className={`rounded-lg border border-slate-200 p-4 shadow-sm ring-1 ring-inset ${card.color}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider opacity-75">
                                    {card.label}
                                </p>
                                <p className="mt-2 text-3xl font-bold">{card.value}</p>
                            </div>
                            <div className="text-4xl">{card.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900">Hành động nhanh</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <a
                        href="/admin/shipping/list"
                        className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        📋 Xem danh sách
                    </a>
                    <a
                        href="/admin/shipping/create"
                        className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        ➕ Tạo vận chuyển
                    </a>
                    <a
                        href="/admin/shipping/carriers"
                        className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        🚚 Quản lý carrier
                    </a>
                    <a
                        href="/admin/shipping/reports"
                        className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        📈 Báo cáo
                    </a>
                </div>
            </div>
        </div>
    )
}

