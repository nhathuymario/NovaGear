import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createPayment } from "../api/paymentApi"
import { getOrderDetail } from "../api/orderApi"
import type { Order } from "../types/order"
import type { Payment } from "../types/payment"
import { getToken } from "../utils/auth"

export default function PaymentPage() {
    const { orderId = "" } = useParams()
    const navigate = useNavigate()
    const token = getToken()

    const [order, setOrder] = useState<Order | null>(null)
    const [payment, setPayment] = useState<Payment | null>(null)
    const [method, setMethod] = useState("COD")
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        if (!token || !orderId) {
            setLoading(false)
            return
        }

        getOrderDetail(orderId)
            .then(setOrder)
            .finally(() => setLoading(false))
    }, [orderId, token])

    const handleCreatePayment = async () => {
        if (!order) return

        try {
            setCreating(true)
            const data = await createPayment(order.id, method)
            setPayment(data)

            if (data.paymentUrl) {
                window.location.href = data.paymentUrl
                return
            }

            navigate(`/payment/result?orderId=${order.id}&status=pending`)
        } catch (err) {
            console.error(err)
            alert("Tạo thanh toán thất bại")
        } finally {
            setCreating(false)
        }
    }

    if (!token) {
        return (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold">Thanh toán đơn hàng</h1>
                <p className="mt-3 text-brand-gray">Bạn cần đăng nhập để thanh toán.</p>
                <button
                    onClick={() => navigate("/login")}
                    className="mt-5 rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white"
                >
                    Đi tới đăng nhập
                </button>
            </div>
        )
    }

    if (loading) return <div>Đang tải thông tin thanh toán...</div>
    if (!order) return <div>Không tìm thấy đơn hàng</div>

    return (
        <div className="grid gap-6 md:grid-cols-[1fr_360px]">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold">Thanh toán đơn hàng</h1>
                <p className="mt-2 text-sm text-brand-gray">
                    Đơn {order.orderCode || `#${order.id}`}
                </p>

                <div className="mt-6 space-y-4">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="COD"
                            checked={method === "COD"}
                            onChange={(e) => setMethod(e.target.value)}
                        />
                        <div>
                            <p className="font-semibold">Thanh toán khi nhận hàng</p>
                            <p className="text-sm text-brand-gray">Phù hợp khi bạn muốn xác nhận hàng trước.</p>
                        </div>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="ONLINE"
                            checked={method === "ONLINE"}
                            onChange={(e) => setMethod(e.target.value)}
                        />
                        <div>
                            <p className="font-semibold">Thanh toán online</p>
                            <p className="text-sm text-brand-gray">Chuyển sang cổng thanh toán nếu backend hỗ trợ.</p>
                        </div>
                    </label>
                </div>

                <button
                    onClick={handleCreatePayment}
                    disabled={creating}
                    className="mt-6 rounded-xl bg-brand-dark px-6 py-3 font-semibold text-white disabled:opacity-60"
                >
                    {creating ? "Đang tạo thanh toán..." : "Xác nhận thanh toán"}
                </button>

                {payment && (
                    <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-brand-gray">
                        <p>Mã thanh toán: {payment.id}</p>
                        <p>Trạng thái: {payment.status}</p>
                    </div>
                )}
            </section>

            <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">Tóm tắt đơn hàng</h2>

                <div className="mt-4 flex items-center justify-between text-sm">
                    <span>Mã đơn</span>
                    <span>{order.orderCode || `#${order.id}`}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                    <span>Trạng thái</span>
                    <span>{order.status}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                    <span>Người nhận</span>
                    <span>{order.receiverName || "—"}</span>
                </div>

                <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Tổng cộng</span>
                        <span className="text-xl font-extrabold text-brand-red">
              {order.totalAmount.toLocaleString("vi-VN")}đ
            </span>
                    </div>
                </div>
            </aside>
        </div>
    )
}