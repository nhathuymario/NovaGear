import type { SyntheticEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosClient from "../api/axiosClient"
import { getMyCart } from "../api/cartApi"
import { createOrderFromCart } from "../api/orderApi"
import { getStoredUser, getToken } from "../utils/auth"
import {
    loadSavedAddresses,
    type SavedAddress,
} from "../utils/addressBook"

type ApiErrorLike = {
    response?: {
        data?: {
            message?: string
            error?: string
        }
    }
}

export default function CheckoutPage() {
    const navigate = useNavigate()
    const token = getToken()
    const currentUser = getStoredUser()
    const userStorageKey = String(currentUser?.id ?? currentUser?.username ?? "guest")

    const [note, setNote] = useState("")
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [cartItemCount, setCartItemCount] = useState(0)

    const selectedAddress = useMemo(
        () => savedAddresses.find((item) => item.id === selectedAddressId) ?? null,
        [savedAddresses, selectedAddressId]
    )

    const isValid = Boolean(
        selectedAddress?.receiverName &&
        selectedAddress?.receiverPhone &&
        selectedAddress?.shippingAddress
    )

    useEffect(() => {
        const stored = loadSavedAddresses(userStorageKey)
        setSavedAddresses(stored)

        if (stored.length === 0) {
            setSelectedAddressId("")
            return
        }

        const defaultAddress = stored.find((item) => item.isDefault) ?? stored[0]
        setSelectedAddressId(defaultAddress.id)
    }, [userStorageKey])

    useEffect(() => {
        if (!token) {
            setCartItemCount(0)
            return
        }

        const loadCart = async () => {
            try {
                const items = await getMyCart()
                setCartItemCount(items.length)
            } catch {
                setCartItemCount(0)
            }
        }

        loadCart()
    }, [token])

    const handleApplySavedAddress = (addressId: string) => {
        const target = savedAddresses.find((item) => item.id === addressId)
        if (!target) return
        setSelectedAddressId(target.id)
        setError("")
    }

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!token) {
            navigate("/login")
            return
        }

        if (cartItemCount <= 0) {
            setError("Giỏ hàng đang trống. Bạn có thể lưu địa chỉ trước, sau đó thêm sản phẩm để thanh toán.")
            return
        }

        if (!selectedAddress) {
            setError("Vui lòng chọn một địa chỉ đã lưu trước khi xác nhận đặt hàng.")
            return
        }

        try {
            setLoading(true)
            setError("")

            const order = await createOrderFromCart({
                customerName: selectedAddress.receiverName,
                phone: selectedAddress.receiverPhone,
                address: selectedAddress.shippingAddress,
                note: note.trim() || selectedAddress.note,
            })

            if (!order.id) {
                setError("Không nhận được orderId từ checkout")
                return
            }

            await axiosClient.delete("/cart/clear")

            navigate(`/payment/${order.id}`)
        } catch (err: unknown) {
            console.error(err)
            const serverMessage =
                (err as ApiErrorLike).response?.data?.message ||
                (err as ApiErrorLike).response?.data?.error
            setError(serverMessage || "Tạo đơn hàng thất bại")
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
                Chọn một địa chỉ đã lưu để tạo đơn. Thêm hoặc xóa địa chỉ được thực hiện trong trang tài khoản.
            </p>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">Địa chỉ đã lưu</p>
                    <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                        Quản lý địa chỉ trong tài khoản
                    </button>
                </div>

                {savedAddresses.length === 0 ? (
                    <div
                        className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                        <p>Chưa có địa chỉ nào được lưu.</p>
                        <p className="mt-1">Vào <span className="font-semibold text-slate-700">Tài khoản của tôi</span> để thêm địa chỉ mới rồi quay lại thanh toán.</p>
                    </div>
                ) : (
                    <div className="mt-3 grid gap-2">
                        {savedAddresses.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleApplySavedAddress(item.id)}
                                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                                    item.id === selectedAddressId
                                        ? "border-brand-dark bg-white"
                                        : "border-slate-200 bg-white"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            {item.label} {item.isDefault ? "(Mặc định)" : ""}
                                        </p>
                                        <p className="text-slate-600">
                                            {item.receiverName} - {item.receiverPhone}
                                        </p>
                                        <p className="text-slate-600">{item.shippingAddress}</p>
                                    </div>
                                    <span
                                        className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                                        Chọn
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                {selectedAddress ? (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                        <p className="font-semibold text-slate-800">Địa chỉ đã chọn</p>
                        <p className="mt-1">{selectedAddress.receiverName} - {selectedAddress.receiverPhone}</p>
                        <p>{selectedAddress.shippingAddress}</p>
                    </div>
                ) : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <textarea
                    placeholder="Ghi chú (không bắt buộc)"
                    className="min-h-[100px] w-full rounded-xl border px-4 py-3 outline-none"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                {cartItemCount <= 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                        Giỏ hàng đang trống. Bạn vẫn có thể lưu/chọn địa chỉ, nhưng cần thêm sản phẩm trước khi xác nhận
                        đặt hàng.
                    </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={!isValid || loading || cartItemCount <= 0}
                    className="w-full rounded-xl bg-brand-dark py-3 font-semibold text-white disabled:opacity-60"
                >
                    {loading ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}
                </button>
            </form>
        </div>
    )
}