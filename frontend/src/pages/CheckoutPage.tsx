import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createOrderFromCart } from "../api/orderApi"
import { getToken } from "../utils/auth"

export default function CheckoutPage() {
    const navigate = useNavigate()
    const token = getToken()

    const [form, setForm] = useState({
        receiverName: "",
        receiverPhone: "",
        shippingAddress: "",
        note: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isValid = useMemo(() => {
        return (
            form.receiverName.trim() &&
            form.receiverPhone.trim() &&
            form.shippingAddress.trim()
        )
    }, [form])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            navigate("/login")
            return
        }

        try {
            setLoading(true)
            setError("")

            const order = await createOrderFromCart({
                receiverName: form.receiverName,
                receiverPhone: form.receiverPhone,
                shippingAddress: form.shippingAddress,
                note: form.note,
            })

            if (!order.id) {
                throw new Error("Không nhận được orderId từ checkout")
            }

            navigate(`/payment/${order.id}`)
        } catch (err) {
            console.error(err)
            setError("Tạo đơn hàng thất bại")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold">Thanh toán</h1>
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

    return (
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold">Thanh toán</h1>
            <p className="mt-2 text-sm text-brand-gray">
                Nhập thông tin nhận hàng để tạo đơn.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                    type="text"
                    placeholder="Người nhận"
                    className="w-full rounded-xl border px-4 py-3 outline-none"
                    value={form.receiverName}
                    onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
                />

                <input
                    type="text"
                    placeholder="Số điện thoại"
                    className="w-full rounded-xl border px-4 py-3 outline-none"
                    value={form.receiverPhone}
                    onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })}
                />

                <textarea
                    placeholder="Địa chỉ giao hàng"
                    className="min-h-[120px] w-full rounded-xl border px-4 py-3 outline-none"
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                />

                <textarea
                    placeholder="Ghi chú (không bắt buộc)"
                    className="min-h-[100px] w-full rounded-xl border px-4 py-3 outline-none"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={!isValid || loading}
                    className="w-full rounded-xl bg-brand-dark py-3 font-semibold text-white disabled:opacity-60"
                >
                    {loading ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}
                </button>
            </form>
        </div>
    )
}