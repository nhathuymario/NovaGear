import {useEffect, useState} from "react"
import {getAdminOrders, updateAdminOrderStatus} from "../../api/adminOrderApi"
import type {Order} from "../../types/order"

const statusOptions: Order["status"][] = [
    "PENDING",
    "CONFIRMED",
    "SHIPPING",
    "COMPLETED",
    "CANCELLED",
]

function getStatusLabel(status: Order["status"]) {
    switch (status) {
        case "PENDING":
            return "PENDING"
        case "CONFIRMED":
            return "CONFIRMED"
        case "SHIPPING":
            return "SHIPPING"
        case "COMPLETED":
            return "COMPLETED"
        case "CANCELLED":
            return "CANCELLED"
        default:
            return status
    }
}

function getPaymentStatusLabel(paymentStatus?: string) {
    const value = String(paymentStatus ?? "UNPAID").toUpperCase()
    switch (value) {
        case "PAID":
            return "Đã thanh toán"
        case "PENDING":
            return "Chờ thanh toán"
        case "FAILED":
            return "Thất bại"
        case "REFUNDED":
            return "Đã hoàn tiền"
        case "UNPAID":
            return "Chưa thanh toán"
        default:
            return value
    }
}

function getPaymentStatusClass(paymentStatus?: string) {
    const value = String(paymentStatus ?? "UNPAID").toUpperCase()
    switch (value) {
        case "PAID":
            return "bg-emerald-50 text-emerald-700 ring-emerald-100"
        case "PENDING":
            return "bg-amber-50 text-amber-700 ring-amber-100"
        case "FAILED":
            return "bg-rose-50 text-rose-700 ring-rose-100"
        case "REFUNDED":
            return "bg-violet-50 text-violet-700 ring-violet-100"
        default:
            return "bg-slate-100 text-slate-700 ring-slate-200"
    }
}

export default function AdminOrdersPage() {
    const [items, setItems] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<number | string | null>(null)

    const loadOrders = async () => {
        try {
            setLoading(true)
            const data = await getAdminOrders()
            setItems(data)
        } catch (error) {
            console.error(error)
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadOrders()
    }, [])

    const handleChangeStatus = async (id: number | string, status: Order["status"]) => {
        try {
            setSavingId(id)
            await updateAdminOrderStatus(id, status)
            setItems((prev) =>
                prev.map((item) => (item.id === id ? {...item, status} : item))
            )
            alert("Cập nhật trạng thái đơn thành công")
        } catch (error) {
            console.error(error)
            alert("Cập nhật trạng thái đơn thất bại")
        } finally {
            setSavingId(null)
        }
    }

    if (loading) return (
        <div className="flex h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-accent border-t-transparent" />
        </div>
    )

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Quản lí đơn hàng</h1>
                    <p className="mt-0.5 text-sm text-slate-500">Theo dõi đơn hàng và cập nhật trạng thái.</p>
                </div>
                <span className="rounded-full bg-admin-accent/10 px-3 py-1 text-xs font-semibold text-admin-accent">{items.length} đơn hàng</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead>
                        <tr className="bg-slate-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Mã đơn</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Khách hàng</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">SDT</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Địa chỉ</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng tiền</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Thanh toán</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Ngày tạo</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {items.map((item) => (
                            <tr key={item.id} className="transition hover:bg-slate-50/80">
                                <td className="px-4 py-3 font-medium">
                                    {item.orderCode || `#${item.id}`}
                                </td>
                                <td className="px-4 py-3">{item.receiverName || "-"}</td>
                                <td className="px-4 py-3">{item.receiverPhone || "-"}</td>
                                <td className="px-4 py-3">{item.shippingAddress || "-"}</td>
                                <td className="px-4 py-3 font-semibold text-admin-accent">
                                    {item.totalAmount.toLocaleString("vi-VN")}d
                                </td>
                                <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getPaymentStatusClass(item.paymentStatus)}`}>
                                            {getPaymentStatusLabel(item.paymentStatus)}
                                        </span>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        disabled={savingId === item.id}
                                        value={item.status}
                                        onChange={(e) => handleChangeStatus(item.id, e.target.value as Order["status"])}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-none disabled:opacity-60"
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {getStatusLabel(status)}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">{item.createdAt || "-"}</td>
                            </tr>
                        ))}

                        {items.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-brand-gray">
                                    Không có đơn hàng nào
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
