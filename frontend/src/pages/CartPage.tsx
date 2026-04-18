import {useEffect, useMemo, useState} from "react"
import {Link, useNavigate} from "react-router-dom"
import {Minus, Plus, ShoppingCart, TicketPercent, Trash2, Truck} from "lucide-react"
import type {CartItem} from "../types/cart"
import {getMyCart, removeCartItem, updateCartItem} from "../api/cartApi"
import {getToken} from "../utils/auth"
import {getFallbackImageSrc, handleImageError} from "../utils/image"

function formatCurrency(value: number) {
    return value.toLocaleString("vi-VN") + "đ"
}

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const token = getToken()

    const loadCart = async () => {
        try {
            setLoading(true)
            const data = await getMyCart()
            setItems(data)
        } catch (error) {
            console.error(error)
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }
        loadCart()
    }, [token])

    const updateQuantity = async (id: number | string, quantity: number) => {
        if (quantity < 1) return

        try {
            await updateCartItem(id, quantity)
            setItems((prev) =>
                prev.map((item) => (item.id === id ? {...item, quantity} : item))
            )
        } catch (error) {
            console.error(error)
            alert("Cập nhật số lượng thất bại")
        }
    }

    const removeItem = async (id: number | string) => {
        try {
            await removeCartItem(id)
            setItems((prev) => prev.filter((item) => item.id !== id))
        } catch (error) {
            console.error(error)
            alert("Xóa sản phẩm thất bại")
        }
    }

    const total = useMemo(() => {
        return items.reduce((sum, item) => {
            const price = item.salePrice ?? item.price ?? item.product?.salePrice ?? item.product?.price ?? 0
            return sum + (item.lineTotal ?? price * item.quantity)
        }, 0)
    }, [items])

    if (!token) {
        return (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold">Giỏ hàng</h1>
                <p className="mt-3 text-brand-gray">
                    Bạn cần đăng nhập để xem giỏ hàng.
                </p>
                <Link
                    to="/login"
                    className="mt-5 inline-block rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white"
                >
                    Đi tới đăng nhập
                </Link>
            </div>
        )
    }

    if (loading) {
        return <div>Đang tải giỏ hàng...</div>
    }

    return (
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            <section className="space-y-4">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <ShoppingCart className="h-6 w-6"/>
                    Gio hang
                </h1>

                {items.length === 0 ? (
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        Giỏ hàng của bạn đang trống
                    </div>
                ) : (
                    items.map((item) => {
                        const price = item.salePrice ?? item.price ?? item.product?.salePrice ?? item.product?.price ?? 0
                        const imageSrc = item.thumbnail || item.product?.imageUrl || getFallbackImageSrc("NovaGear")
                        const productName = item.productName || item.product?.name || "Sản phẩm"

                        return (
                            <div
                                key={item.id}
                                className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"
                            >
                                <img
                                    src={imageSrc}
                                    alt={productName}
                                    className="h-24 w-24 rounded-xl object-cover"
                                    data-fallback={getFallbackImageSrc("NovaGear")}
                                    onError={handleImageError}
                                />

                                <div className="flex-1">
                                    <h3 className="font-semibold">{productName}</h3>

                                    {(item.variantLabel || item.variantSku) && (
                                        <div className="mt-1 space-y-1">
                                            {item.variantLabel && (
                                                <p className="text-sm text-brand-gray">
                                                    Phiên bản: {item.variantLabel}
                                                </p>
                                            )}
                                            {item.variantSku && (
                                                <p className="text-xs text-brand-gray">
                                                    SKU: {item.variantSku}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <p className="mt-2 font-bold text-brand-red">
                                        {formatCurrency(price)}
                                    </p>

                                    <div className="mt-3 flex items-center gap-2">
                                        <button
                                            className="rounded-lg border px-2.5 py-1 text-slate-700"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            aria-label="Giam so luong"
                                        >
                                            <Minus className="h-4 w-4"/>
                                        </button>
                                        <span className="min-w-[32px] text-center">{item.quantity}</span>
                                        <button
                                            className="rounded-lg border px-2.5 py-1 text-slate-700"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            aria-label="Tang so luong"
                                        >
                                            <Plus className="h-4 w-4"/>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                                    onClick={() => removeItem(item.id)}
                                    aria-label="Xóa sản phẩm"
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </button>
                            </div>
                        )
                    })
                )}
            </section>

            <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">Tóm tắt đơn hàng</h2>
                <div className="mt-4 flex items-center justify-between text-sm">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(total)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1">
                        <Truck className="h-4 w-4"/>
                         Phí vận chuyển
                    </span>
                    <span>0đ</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1">
                        <TicketPercent className="h-4 w-4"/>
                        Ưu đãi
                    </span>
                    <span>0đ</span>
                </div>
                <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Tổng cộng</span>
                        <span className="text-xl font-extrabold text-brand-red">
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>

                <button
                    disabled={items.length === 0}
                    onClick={() => navigate("/checkout")}
                    className="mt-5 w-full rounded-xl bg-brand-dark py-3 font-semibold text-white disabled:opacity-60"
                >
                    Tiến hành thanh toán
                </button>
            </aside>
        </div>
    )
}