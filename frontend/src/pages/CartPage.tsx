import { useMemo, useState } from "react"
import type { CartItem } from "../types/cart"

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([
        {
            id: 1,
            productId: 101,
            quantity: 1,
            product: {
                id: 101,
                name: "Laptop Gaming Nova X15",
                price: 24990000,
                imageUrl: "https://via.placeholder.com/300x300?text=Laptop",
            },
        },
        {
            id: 2,
            productId: 102,
            quantity: 2,
            product: {
                id: 102,
                name: "Chuột Gaming RGB",
                price: 590000,
                imageUrl: "https://via.placeholder.com/300x300?text=Mouse",
            },
        },
    ])

    const updateQuantity = (id: number | string, quantity: number) => {
        if (quantity < 1) return
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        )
    }

    const removeItem = (id: number | string) => {
        setItems((prev) => prev.filter((item) => item.id !== id))
    }

    const total = useMemo(() => {
        return items.reduce((sum, item) => {
            const price = item.product?.salePrice ?? item.product?.price ?? 0
            return sum + price * item.quantity
        }, 0)
    }, [items])

    return (
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            <section className="space-y-4">
                <h1 className="text-2xl font-bold">Giỏ hàng</h1>

                {items.map((item) => (
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
                            <p className="mt-1 text-brand-red font-bold">
                                {(item.product?.price ?? 0).toLocaleString("vi-VN")}đ
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
                ))}
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

                <button className="mt-5 w-full rounded-xl bg-brand-dark py-3 font-semibold text-white">
                    Tiến hành thanh toán
                </button>
            </aside>
        </div>
    )
}