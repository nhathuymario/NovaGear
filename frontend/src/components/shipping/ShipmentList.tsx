import { useEffect, useState } from "react"
import { getAdminShipments } from "../../api/shippingApi"
import type { Shipment, ShipmentStatus } from "../../types/shipping"

interface FilterState {
    status: ShipmentStatus | "ALL"
    searchKeyword: string
    carrierName: string
}

function getStatusBadge(status: ShipmentStatus): { label: string; color: string } {
    const statusMap: Record<ShipmentStatus, { label: string; color: string }> = {
        READY_TO_SHIP: { label: "Chờ gửi", color: "bg-yellow-50 text-yellow-700 ring-yellow-100" },
        SHIPPED: { label: "Đã gửi", color: "bg-orange-50 text-orange-700 ring-orange-100" },
        IN_TRANSIT: { label: "Vận chuyển", color: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
        OUT_FOR_DELIVERY: { label: "Đang giao", color: "bg-purple-50 text-purple-700 ring-purple-100" },
        DELIVERED: { label: "Đã giao", color: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
        CANCELLED: { label: "Hủy", color: "bg-slate-50 text-slate-700 ring-slate-100" },
        RETURNED: { label: "Hoàn trả", color: "bg-red-50 text-red-700 ring-red-100" },
    }
    return statusMap[status] || { label: status, color: "bg-slate-50 text-slate-700 ring-slate-100" }
}

export default function ShipmentList() {
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<FilterState>({
        status: "ALL",
        searchKeyword: "",
        carrierName: "",
    })

    const loadShipments = async () => {
        try {
            setLoading(true)
            const data = await getAdminShipments()
            setShipments(data)
        } catch (error) {
            console.error("Failed to load shipments:", error)
            setShipments([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadShipments()
    }, [])

    useEffect(() => {
        let result = shipments

        // Filter by status
        if (filters.status !== "ALL") {
            result = result.filter((s) => s.status === filters.status)
        }

        // Filter by carrier
        if (filters.carrierName) {
            result = result.filter((s) =>
                s.carrierName?.toLowerCase().includes(filters.carrierName.toLowerCase())
            )
        }

        // Search by keyword
        if (filters.searchKeyword) {
            const keyword = filters.searchKeyword.toLowerCase()
            result = result.filter(
                (s) =>
                    s.orderCode?.toLowerCase().includes(keyword) ||
                    s.trackingNumber?.toLowerCase().includes(keyword) ||
                    s.receiverName?.toLowerCase().includes(keyword) ||
                    s.receiverPhone?.includes(keyword) ||
                    s.shippingAddress?.toLowerCase().includes(keyword)
            )
        }

        setFilteredShipments(result)
    }, [shipments, filters])

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const getCarriers = (): string[] => {
        const carriers = new Set<string>()
        shipments.forEach((s) => {
            if (s.carrierName) carriers.add(s.carrierName)
        })
        return Array.from(carriers).sort()
    }

    if (loading) {
        return (
            <div className="flex h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-accent border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Danh sách vận chuyển</h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                        {filteredShipments.length} / {shipments.length} vận chuyển
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadShipments}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        🔄 Làm mới
                    </button>
                    <a
                        href="/admin/shipping/create"
                        className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-admin-accent/90"
                    >
                        ➕ Tạo mới
                    </a>
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Search */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700">
                            Tìm kiếm
                        </label>
                        <input
                            type="text"
                            placeholder="Mã đơn, tracking, tên, SDT, địa chỉ..."
                            value={filters.searchKeyword}
                            onChange={(e) => handleFilterChange("searchKeyword", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-admin-accent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700">
                            Trạng thái
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) =>
                                handleFilterChange("status", e.target.value)
                            }
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-admin-accent"
                        >
                            <option value="ALL">Tất cả</option>
                            <option value="READY_TO_SHIP">Chờ gửi</option>
                            <option value="SHIPPED">Đã gửi</option>
                            <option value="IN_TRANSIT">Vận chuyển</option>
                            <option value="OUT_FOR_DELIVERY">Đang giao</option>
                            <option value="DELIVERED">Đã giao</option>
                            <option value="RETURNED">Hoàn trả</option>
                            <option value="CANCELLED">Hủy</option>
                        </select>
                    </div>

                    {/* Carrier Filter */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700">
                            Hãng vận chuyển
                        </label>
                        <select
                            value={filters.carrierName}
                            onChange={(e) => handleFilterChange("carrierName", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-admin-accent"
                        >
                            <option value="">Tất cả</option>
                            {getCarriers().map((carrier) => (
                                <option key={carrier} value={carrier}>
                                    {carrier}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <button
                            onClick={() =>
                                setFilters({
                                    status: "ALL",
                                    searchKeyword: "",
                                    carrierName: "",
                                })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Mã đơn
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Tracking
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Người nhận
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Hãng vận chuyển
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Phí
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Dự kiến giao
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Trạng thái
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredShipments.map((shipment) => {
                                const statusBadge = getStatusBadge(shipment.status)
                                return (
                                    <tr key={shipment.id} className="transition hover:bg-slate-50/80">
                                        <td className="px-4 py-3 font-medium">
                                            {shipment.orderCode || `#${shipment.id}`}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-600">
                                            {shipment.trackingNumber || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium">{shipment.receiverName}</p>
                                                <p className="text-xs text-slate-500">
                                                    {shipment.receiverPhone}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {shipment.carrierName || "-"}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-admin-accent">
                                            {Number(shipment.shippingFee).toLocaleString("vi-VN")}đ
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {shipment.estimatedDeliveryAt
                                                ? new Date(
                                                    shipment.estimatedDeliveryAt
                                                ).toLocaleDateString("vi-VN")
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusBadge.color}`}
                                            >
                                                {statusBadge.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <a
                                                href={`/admin/shipping/${shipment.id}`}
                                                className="text-admin-accent hover:underline"
                                            >
                                                Xem chi tiết
                                            </a>
                                        </td>
                                    </tr>
                                )
                            })}

                            {filteredShipments.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-8 text-center text-slate-500"
                                    >
                                        Không có vận chuyển nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

