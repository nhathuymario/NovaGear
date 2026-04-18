import { useEffect, useMemo, useState } from "react"
import type { SyntheticEvent } from "react"
import { useNavigate } from "react-router-dom"
import axiosClient from "../api/axiosClient"
import { createOrderFromCart } from "../api/orderApi"
import { getStoredUser, getToken } from "../utils/auth"

type ApiErrorLike = {
    response?: {
        data?: {
            message?: string
            error?: string
        }
    }
}

type CheckoutFormState = {
    receiverName: string
    receiverPhone: string
    shippingAddress: string
    note: string
}

type SavedAddress = {
    id: string
    label: string
    receiverName: string
    receiverPhone: string
    shippingAddress: string
    note: string
    isDefault?: boolean
    updatedAt: string
}

const DEFAULT_ADDRESS_LABEL = "Địa chỉ giao hàng"

function normalizePhone(value: string) {
    return value.replace(/\s+/g, "").trim()
}

function buildAddressStorageKey(userKey: string) {
    return `novagear_saved_addresses_${userKey}`
}

function parseSavedAddresses(raw: string | null): SavedAddress[] {
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw) as SavedAddress[]
        if (!Array.isArray(parsed)) return []
        return parsed.filter((item) => item && item.id && item.shippingAddress)
    } catch {
        return []
    }
}

function mapAddressToForm(address: SavedAddress): CheckoutFormState {
    return {
        receiverName: address.receiverName,
        receiverPhone: address.receiverPhone,
        shippingAddress: address.shippingAddress,
        note: address.note,
    }
}

export default function CheckoutPage() {
    const navigate = useNavigate()
    const token = getToken()
    const currentUser = getStoredUser()
    const userStorageKey = String(currentUser?.id ?? currentUser?.username ?? "guest")

    const [form, setForm] = useState<CheckoutFormState>({
        receiverName: "",
        receiverPhone: "",
        shippingAddress: "",
        note: "",
    })
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState("")
    const [addressLabel, setAddressLabel] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [addressMessage, setAddressMessage] = useState("")

    const isValid = useMemo(() => {
        return (
            form.receiverName.trim() &&
            normalizePhone(form.receiverPhone) &&
            form.shippingAddress.trim()
        )
    }, [form])

    const selectedAddress = useMemo(
        () => savedAddresses.find((item) => item.id === selectedAddressId) ?? null,
        [savedAddresses, selectedAddressId]
    )

    useEffect(() => {
        const stored = parseSavedAddresses(localStorage.getItem(buildAddressStorageKey(userStorageKey)))
        setSavedAddresses(stored)

        if (stored.length === 0) {
            setSelectedAddressId("")
            return
        }

        const defaultAddress = stored.find((item) => item.isDefault) ?? stored[0]
        setSelectedAddressId(defaultAddress.id)
        setForm((prev) => {
            if (prev.receiverName || prev.receiverPhone || prev.shippingAddress || prev.note) {
                return prev
            }
            return mapAddressToForm(defaultAddress)
        })
    }, [userStorageKey])

    const persistAddresses = (next: SavedAddress[]) => {
        setSavedAddresses(next)
        localStorage.setItem(buildAddressStorageKey(userStorageKey), JSON.stringify(next))
    }

    const handleApplySavedAddress = (addressId: string) => {
        const target = savedAddresses.find((item) => item.id === addressId)
        if (!target) return
        setSelectedAddressId(target.id)
        setForm(mapAddressToForm(target))
        setAddressMessage(`Đã áp dụng: ${target.label}`)
        setError("")
    }

    const handleCreateNewAddress = () => {
        setSelectedAddressId("")
        setAddressLabel("")
        setForm({
            receiverName: "",
            receiverPhone: "",
            shippingAddress: "",
            note: "",
        })
        setAddressMessage("Đang tạo địa chỉ mới")
        setError("")
    }

    const handleSaveCurrentAddress = () => {
        setAddressMessage("")

        if (!form.receiverName.trim() || !normalizePhone(form.receiverPhone) || !form.shippingAddress.trim()) {
            setError("Điền người nhận, số điện thoại và địa chỉ trước khi lưu")
            return
        }

        const now = new Date().toISOString()
        const finalLabel = addressLabel.trim() || DEFAULT_ADDRESS_LABEL

        const next = selectedAddress
            ? savedAddresses.map((item) =>
                  item.id === selectedAddress.id
                      ? {
                            ...item,
                            label: finalLabel,
                            receiverName: form.receiverName.trim(),
                            receiverPhone: normalizePhone(form.receiverPhone),
                            shippingAddress: form.shippingAddress.trim(),
                            note: form.note.trim(),
                            isDefault: true,
                            updatedAt: now,
                        }
                      : { ...item, isDefault: false }
              )
            : [
                  {
                      id: `${Date.now()}`,
                      label: finalLabel,
                      receiverName: form.receiverName.trim(),
                      receiverPhone: normalizePhone(form.receiverPhone),
                      shippingAddress: form.shippingAddress.trim(),
                      note: form.note.trim(),
                      isDefault: true,
                      updatedAt: now,
                  },
                  ...savedAddresses.map((item) => ({ ...item, isDefault: false })),
              ]

        const nextDefault = next.find((item) => item.isDefault) ?? next[0]
        persistAddresses(next)
        setSelectedAddressId(nextDefault?.id ?? "")
        setAddressLabel("")
        setAddressMessage(selectedAddress ? "Đã cập nhật địa chỉ" : "Đã lưu địa chỉ mới")
        setError("")
    }

    const handleDeleteSelectedAddress = () => {
        if (!selectedAddress) return
        const next = savedAddresses.filter((item) => item.id !== selectedAddress.id)
        const nextWithDefault = next.map((item, index) => ({
            ...item,
            isDefault: index === 0,
        }))

        persistAddresses(nextWithDefault)

        if (nextWithDefault.length > 0) {
            const first = nextWithDefault[0]
            setSelectedAddressId(first.id)
            setForm(mapAddressToForm(first))
        } else {
            setSelectedAddressId("")
        }

        setAddressMessage("Đã xoá địa chỉ đã chọn")
        setError("")
    }

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!token) {
            navigate("/login")
            return
        }

        try {
            setLoading(true)
            setError("")

            const order = await createOrderFromCart({
                customerName: form.receiverName.trim(),
                phone: normalizePhone(form.receiverPhone),
                address: form.shippingAddress.trim(),
                note: form.note.trim(),
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
                Chọn nhanh địa chỉ đã lưu hoặc nhập thông tin mới để tạo đơn.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-800">Địa chỉ đã lưu</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handleCreateNewAddress}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            >
                                Thêm địa chỉ mới
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteSelectedAddress}
                                disabled={!selectedAddress}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
                            >
                                Xóa địa chỉ đang chọn
                            </button>
                        </div>
                    </div>

                    {savedAddresses.length === 0 ? (
                        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                            <p>Chưa có địa chỉ nào được lưu.</p>
                            <p className="mt-1">Bấm <span className="font-semibold text-slate-700">Thêm địa chỉ mới</span> để nhập nhanh, sau đó lưu lại để dùng cho lần sau.</p>
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
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                                            Chọn
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                        <input
                            type="text"
                            placeholder="Nhãn địa chỉ (nhà riêng, công ty...)"
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                            value={addressLabel}
                            onChange={(e) => setAddressLabel(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleSaveCurrentAddress}
                            className="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white"
                        >
                            Lưu địa chỉ
                        </button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                        {selectedAddress ? (
                            <span>Đang dùng địa chỉ đã lưu: <span className="font-semibold text-slate-700">{selectedAddress.label}</span></span>
                        ) : (
                            <span>Đang tạo địa chỉ mới, bấm <span className="font-semibold text-slate-700">Lưu địa chỉ</span> để đưa vào danh sách.</span>
                        )}
                    </div>
                    {addressMessage && (
                        <p className="mt-2 text-xs font-medium text-green-600">{addressMessage}</p>
                    )}
                </div>

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