import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMyOrders } from "../api/orderApi"
import type { Order } from "../types/order"
import { getToken } from "../utils/auth"

function getStatusText(status: Order["status"]) {
    switch (status) {
        case "PENDING":
            return "Chờ xác nhận"
        case "CONFIRMED":
            return "Đã xác nhận"
        case "PROCESSING":
            return "Đang xử lý"
        case "SHIPPING":
            return "Đang giao"
        case "DELIVERED":
            return "Đã giao"
        case "CANCELLED":
            return "Đã hủy"
        default:
            return status
    }
}

function formatCurrency(value: number) {
    return value.toLocaleString("vi-VN") + "đ"
}

export default function OrdersPage() {
    const navigate = useNavigate()
    const token = getToken()
    const [items, setItems] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }

        getMyOrders()
            .then(setItems)
            .finally(() => setLoading(false))
    }, [token])

    if (!token) {
        return (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
                <p className="mt-3 text-brand-gray">
                    Bạn cần đăng nhập để xem đơn hàng.
                </p>
                <button
                    onClick={() => navigate("/login")}
                    className="mt-5 rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white"
                >
                    Đi tới đăng nhập
                </button>
            </div>
        )
    }

    if (loading) return <div>Đang tải đơn hàng...</div>

    return (
        <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
            </div>

            {items.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    Bạn chưa có đơn hàng nào.
                </div>
            ) : (
                items.map((order) => (
                    <Link
                        key={order.id}
                        to={`/orders/${order.id}`}
                        className="block rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm text-brand-gray">Mã đơn</p>
                                <h3 className="font-bold">
                                    {order.orderCode || `#${order.id}`}
                                </h3>
                                <p className="mt-1 text-xs text-brand-gray">
                                    {order.createdAt || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-brand-gray">Trạng thái</p>
                                <p className="font-semibold text-brand-dark">
                                    {getStatusText(order.status)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-brand-gray">Tổng tiền</p>
                                <p className="font-bold text-brand-red">
                                    {formatCurrency(order.totalAmount)}
                                </p>
                            </div>
                        </div>

                        {order.items.length > 0 && (
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                {order.items.slice(0, 2).map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-xl border p-3"
                                    >
                                        <p className="font-medium">
                                            {item.productName || "Sản phẩm"}
                                        </p>

                                        {item.variantLabel && (
                                            <p className="mt-1 text-sm text-brand-gray">
                                                Phiên bản: {item.variantLabel}
                                            </p>
                                        )}

                                        {item.variantSku && (
                                            <p className="mt-1 text-xs text-brand-gray">
                                                SKU: {item.variantSku}
                                            </p>
                                        )}

                                        <p className="mt-2 text-sm text-brand-gray">
                                            SL: {item.quantity}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Link>
                ))
            )}
        </div>
    )
}