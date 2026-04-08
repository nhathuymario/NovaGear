import {useCallback, useEffect, useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import {createPayment, getPaymentByOrderId} from "../api/paymentApi"
import {getOrderDetail} from "../api/orderApi"
import type {Order} from "../types/order"
import type {Payment} from "../types/payment"
import {getToken} from "../utils/auth"

export default function PaymentPage() {
    const {orderId = ""} = useParams()
    const navigate = useNavigate()
    const token = getToken()

    const [order, setOrder] = useState<Order | null>(null)
    const [payment, setPayment] = useState<Payment | null>(null)
    const [method, setMethod] = useState("COD")
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [message, setMessage] = useState("")

    const loadData = useCallback(async () => {
        if (!orderId) return

        try {
            const [orderData, paymentData] = await Promise.all([
                getOrderDetail(orderId),
                getPaymentByOrderId(orderId).catch(() => null),
            ])
            setOrder(orderData)
            setPayment(paymentData)
        } finally {
            setLoading(false)
        }
    }, [orderId])

    useEffect(() => {
        if (!token || !orderId) {
            setLoading(false)
            return
        }

        loadData().catch(console.error)
    }, [loadData, orderId, token])

    const handleCreatePayment = async () => {
        if (!order) return

        try {
            setMessage("")
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
            const status = (err as any)?.response?.status
            const serverMessage = String((err as any)?.response?.data?.message || "")
            if (status === 409 && order?.id) {
                const isExistingPaymentConflict = serverMessage.toLowerCase().includes("da co payment")
                        || serverMessage.toLowerCase().includes("ton tai")

                if (!isExistingPaymentConflict) {
                    setMessage(serverMessage || "Khong the tao thanh toan luc nay. Vui long thu lai.")
                    return
                }

                try {
                    const existing = await getPaymentByOrderId(order.id)
                    if (existing) {
                        setPayment(existing)
                        if (existing.paymentUrl) {
                            window.location.href = existing.paymentUrl
                            return
                        }
                        setMessage("Đơn đã có thanh toán trước đó. Bạn có thể tiếp tục theo trạng thái hiện tại.")
                        navigate(`/payment/result?orderId=${order.id}&status=${String(existing.status || "pending").toLowerCase()}`)
                        return
                    }
                } catch (retryErr) {
                    console.error(retryErr)
                }
            }
            if (status === 502) {
                setMessage(serverMessage || "Cong thanh toan tam thoi loi ket noi. Vui long thu lai sau.")
                return
            }

            setMessage(serverMessage || "Khong the tao thanh toan luc nay. Vui long thu lai.")
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
                            <p className="font-semibold">Thanh toán online (PayOS)</p>
                            <p className="text-sm text-brand-gray">Chuyển khoản, ví điện tử, QR code - an toàn và nhanh
                                chóng</p>
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

                {payment?.paymentUrl && payment.status === "PENDING" && (
                    <button
                        onClick={() => {
                            window.location.href = String(payment.paymentUrl)
                        }}
                        className="ml-3 mt-6 rounded-xl border border-brand-dark px-6 py-3 font-semibold text-brand-dark"
                    >
                        Tiếp tục thanh toán online
                    </button>
                )}

                {message && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                        {message}
                    </div>
                )}

                {/*<div className="mt-6 rounded-2xl border bg-gray-50 p-4">*/}
                {/*    <h3 className="font-semibold">Test mock callback</h3>*/}
                {/*    <p className="mt-1 text-sm text-brand-gray">*/}
                {/*        Backend hiện có endpoint mock callback qua query params.*/}
                {/*    </p>*/}

                {/*    <div className="mt-4 flex gap-3">*/}
                {/*        <button*/}
                {/*            onClick={() => handleMock("success")}*/}
                {/*            disabled={mocking}*/}
                {/*            className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-60"*/}
                {/*        >*/}
                {/*            Mock success*/}
                {/*        </button>*/}
                {/*        <button*/}
                {/*            onClick={() => handleMock("failed")}*/}
                {/*            disabled={mocking}*/}
                {/*            className="rounded-xl border border-red-500 px-4 py-2 font-semibold text-red-500 disabled:opacity-60"*/}
                {/*        >*/}
                {/*            Mock failed*/}
                {/*        </button>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {payment && (
                    <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-brand-gray">
                        <p>Mã thanh toán: {payment.id}</p>
                        <p>Trạng thái: {payment.status}</p>
                        <p>Phương thức: {payment.method}</p>
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