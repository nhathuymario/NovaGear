import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import type { CartItem } from "../types/cart"
import { getMyCart, removeCartItem, updateCartItem } from "../api/cartApi"
import { getToken } from "../utils/auth"

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)

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
                prev.map((item) => (item.id === id ? { ...item, quantity } : item))
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
            const price = item.product?.salePrice ?? item.product?.price ?? 0
            return sum + price * item.quantity
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
                <h1 className="text-2xl font-bold">Giỏ hàng</h1>

                {items.length === 0 ? (
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        Giỏ hàng của bạn đang trống
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"
                        >
                            <img
                                src={item.product?.imageUrl || "https://via.placeholder.com/120"}
                                alt={item.product?.name}
                                className="h-24 w-24 rounded-xl object-cover"
                            />

                            <div className="flex-1">
                                <h3 className="font-semibold">{item.product?.name}</h3>
                                <p className="mt-1 font-bold text-brand-red">
                                    {(item.product?.salePrice ?? item.product?.price ?? 0).toLocaleString("vi-VN")}đ
                                </p>

                                <div className="mt-3 flex items-center gap-2">
                                    <button
                                        className="rounded-lg border px-3 py-1"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                        -
                                    </button>
                                    <span className="min-w-[32px] text-center">{item.quantity}</span>
                                    <button
                                        className="rounded-lg border px-3 py-1"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                className="text-sm font-semibold text-red-500"
                                onClick={() => removeItem(item.id)}
                            >
                                Xóa
                            </button>
                        </div>
                    ))
                )}
            </section>

            <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">Tóm tắt đơn hàng</h2>
                <div className="mt-4 flex items-center justify-between text-sm">
                    <span>Tạm tính</span>
                    <span>{total.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                    <span>Phí vận chuyển</span>
                    <span>0đ</span>
                </div>
                <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Tổng cộng</span>
                        <span className="text-xl font-extrabold text-brand-red">
              {total.toLocaleString("vi-VN")}đ
            </span>
                    </div>
                </div>

                <button
                    disabled={items.length === 0}
                    className="mt-5 w-full rounded-xl bg-brand-dark py-3 font-semibold text-white disabled:opacity-60"
                >
                    Tiến hành thanh toán
                </button>
            </aside>
        </div>
    )
}