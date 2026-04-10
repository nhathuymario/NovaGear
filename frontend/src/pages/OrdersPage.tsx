import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMyOrders } from "../api/orderApi"
import type { Order } from "../types/order"
import { getToken } from "../utils/auth"

type PaymentFilter = "ALL" | "PAID" | "UNPAID" | "PENDING" | "FAILED" | "REFUNDED"

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

function getPaymentStatusText(status: string | null | undefined) {
    const paymentStatus = String(status ?? "UNPAID").toUpperCase()
    switch (paymentStatus) {
        case "PAID":
            return "Đã thanh toán"
        case "UNPAID":
            return "Chưa thanh toán"
        case "PENDING":
            return "Đang xử lý"
        case "FAILED":
            return "Thanh toán thất bại"
        case "REFUNDED":
            return "Đã hoàn tiền"
        default:
            return paymentStatus
    }
}

function getPaymentStatusColor(status: string | null | undefined) {
    const paymentStatus = String(status ?? "UNPAID").toUpperCase()
    switch (paymentStatus) {
        case "PAID":
            return "bg-green-100 text-green-800 border-green-300"
        case "UNPAID":
            return "bg-yellow-100 text-yellow-800 border-yellow-300"
        case "PENDING":
            return "bg-blue-100 text-blue-800 border-blue-300"
        case "FAILED":
            return "bg-red-100 text-red-800 border-red-300"
        case "REFUNDED":
            return "bg-purple-100 text-purple-800 border-purple-300"
        default:
            return "bg-gray-100 text-gray-800 border-gray-300"
    }
}

function formatCurrency(value: number) {
    return value.toLocaleString("vi-VN") + "đ"
}

export default function OrdersPage() {
    const navigate = useNavigate()
    const token = getToken()
    const [items, setItems] = useState<Order[]>([])
    const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("ALL")
    const [loading, setLoading] = useState(Boolean(token))

    const filteredItems = useMemo(() => {
        if (paymentFilter === "ALL") return items
        return items.filter((item) => String(item.paymentStatus ?? "UNPAID").toUpperCase() === paymentFilter)
    }, [items, paymentFilter])

    useEffect(() => {
        if (!token) return

        let mounted = true

        getMyOrders()
            .then((data) => {
                if (mounted) {
                    setItems(data)
                }
            })
            .finally(() => {
                if (mounted) {
                    setLoading(false)
                }
            })

        return () => {
            mounted = false
        }
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
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-slate-600">Lọc theo thanh toán:</span>
                    {(["ALL", "PAID", "UNPAID", "PENDING", "FAILED", "REFUNDED"] as PaymentFilter[]).map((value) => {
                        const active = paymentFilter === value
                        const displayText = value === "ALL" ? "Tất cả" : getPaymentStatusText(value)
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setPaymentFilter(value)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                    active
                                        ? "border-slate-900 bg-slate-900 text-white"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                                }`}
                            >
                                {displayText}
                            </button>
                        )
                    })}
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {items.length === 0 ? "Bạn chưa có đơn hàng nào." : "Không có đơn hàng phù hợp với bộ lọc thanh toán."}
                </div>
            ) : (
                filteredItems.map((order) => (
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
                                <p className="text-sm text-brand-gray">Trạng thái đơn hàng</p>
                                <p className="font-semibold text-brand-dark">
                                    {getStatusText(order.status)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-brand-gray">Thanh toán</p>
                                <span className={`mt-1 inline-block rounded-full border px-3 py-1 text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                                    {getPaymentStatusText(order.paymentStatus)}
                                </span>
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