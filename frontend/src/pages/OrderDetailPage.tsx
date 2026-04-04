import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { getOrderDetail } from "../api/orderApi"
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

export default function OrderDetailPage() {
    const { id = "" } = useParams()
    const navigate = useNavigate()
    const token = getToken()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token || !id) {
            setLoading(false)
            return
        }

        getOrderDetail(id)
            .then(setOrder)
            .finally(() => setLoading(false))
    }, [id, token])

    if (!token) {
        return (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
                <p className="mt-3 text-brand-gray">
                    Bạn cần đăng nhập để xem chi tiết đơn.
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

    if (loading) return <div>Đang tải chi tiết đơn...</div>
    if (!order) return <div>Không tìm thấy đơn hàng</div>

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm text-brand-gray">Mã đơn</p>
                        <h1 className="text-2xl font-bold">
                            {order.orderCode || `#${order.id}`}
                        </h1>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-brand-gray">Trạng thái</p>
                        <p className="font-semibold text-brand-dark">
                            {getStatusText(order.status)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_320px]">
                <section className="space-y-4">
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-bold">Sản phẩm</h2>

                        <div className="mt-4 space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                    <img
                                        src={item.imageUrl || "https://via.placeholder.com/120"}
                                        alt={item.productName}
                                        className="h-20 w-20 rounded-xl object-cover"
                                    />

                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.productName}</h3>

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

                                        <p className="mt-1 text-sm text-brand-gray">
                                            Số lượng: {item.quantity}
                                        </p>
                                        <p className="mt-1 font-bold text-brand-red">
                                            {formatCurrency(item.salePrice ?? item.price)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-bold">Thông tin nhận hàng</h2>
                        <div className="mt-4 space-y-2 text-sm text-brand-gray">
                            <p>Người nhận: {order.receiverName || "Đang cập nhật"}</p>
                            <p>Số điện thoại: {order.receiverPhone || "Đang cập nhật"}</p>
                            <p>Địa chỉ: {order.shippingAddress || "Đang cập nhật"}</p>
                            <p>Ghi chú: {order.note || "Không có"}</p>
                        </div>
                    </div>
                </section>

                <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold">Thanh toán</h2>

                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-brand-gray">Tổng cộng</span>
                        <span className="text-xl font-extrabold text-brand-red">
                            {formatCurrency(order.totalAmount)}
                        </span>
                    </div>

                    {order.status === "PENDING" && (
                        <div className="mt-6 flex flex-col gap-3">
                            <Link
                                to={`/payment/${order.id}`}
                                className="block w-full rounded-xl bg-brand-dark py-3 text-center font-semibold text-white transition-all hover:bg-opacity-90 active:scale-[0.98]"
                            >
                                Thanh toán ngay
                            </Link>

                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                                Backend hiện chưa thấy endpoint hủy đơn của user, nên FE tạm ẩn nút hủy.
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    )
}