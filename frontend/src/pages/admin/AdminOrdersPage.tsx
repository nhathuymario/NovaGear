import { useEffect, useState } from "react"
import { getAdminOrders, updateAdminOrderStatus } from "../../api/adminOrderApi"
import type { Order } from "../../types/order"

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
                prev.map((item) => (item.id === id ? { ...item, status } : item))
            )
            alert("Cập nhật trạng thái đơn thành công")
        } catch (error) {
            console.error(error)
            alert("Cập nhật trạng thái đơn thất bại")
        } finally {
            setSavingId(null)
        }
    }

    if (loading) return <div>Đang tải đơn hàng admin...</div>

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
                <p className="mt-1 text-sm text-brand-gray">
                    Theo dõi đơn hàng và cập nhật trạng thái từ order-service.
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="px-4 py-3">Mã đơn</th>
                            <th className="px-4 py-3">Khách hàng</th>
                            <th className="px-4 py-3">SĐT</th>
                            <th className="px-4 py-3">Địa chỉ</th>
                            <th className="px-4 py-3">Tổng tiền</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3">Ngày tạo</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-t align-top">
                                <td className="px-4 py-3 font-medium">
                                    {item.orderCode || `#${item.id}`}
                                </td>
                                <td className="px-4 py-3">{item.receiverName || "—"}</td>
                                <td className="px-4 py-3">{item.receiverPhone || "—"}</td>
                                <td className="px-4 py-3">{item.shippingAddress || "—"}</td>
                                <td className="px-4 py-3 font-semibold text-brand-red">
                                    {item.totalAmount.toLocaleString("vi-VN")}đ
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        disabled={savingId === item.id}
                                        value={item.status}
                                        onChange={(e) => handleChangeStatus(item.id, e.target.value as Order["status"])}
                                        className="rounded-lg border px-3 py-2 outline-none disabled:opacity-60"
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {getStatusLabel(status)}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">{item.createdAt || "—"}</td>
                            </tr>
                        ))}

                        {items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-brand-gray">
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