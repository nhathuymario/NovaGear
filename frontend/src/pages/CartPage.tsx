import {useEffect, useMemo, useState} from "react"
import {Link, useNavigate} from "react-router-dom"
import {motion} from "framer-motion"
import {ChevronRight, Minus, Plus, ShieldCheck, ShoppingCart, Trash2, Truck} from "lucide-react"
import type {CartItem} from "../types/cart"
import {getMyCart, removeCartItem, updateCartItem} from "../api/cartApi"
import {getToken} from "../utils/auth"
import {getFallbackImageSrc, handleImageError} from "../utils/image"
import {CartSkeleton} from "../components/ui/Skeletons"

function formatCurrency(value: number) {
    return value.toLocaleString("vi-VN") + "₫"
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
        if (!token) { setLoading(false); return }
        loadCart()
    }, [token])

    const updateQuantity = async (id: number | string, quantity: number) => {
        if (quantity < 1) return
        try {
            await updateCartItem(id, quantity)
            setItems((prev) => prev.map((item) => (item.id === id ? {...item, quantity} : item)))
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
            <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
                <h1 className="mt-4 text-xl font-bold text-slate-900">Giỏ hàng</h1>
                <p className="mt-2 text-sm text-slate-500">Bạn cần đăng nhập để xem giỏ hàng.</p>
                <Link
                    to="/login"
                    className="mt-5 inline-flex rounded-lg bg-brand-yellow px-6 py-3 font-semibold text-brand-dark transition hover:brightness-95"
                >
                    Đăng nhập ngay
                </Link>
            </div>
        )
    }

    if (loading) return <CartSkeleton />

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Link to="/" className="hover:text-brand-blue">Trang chủ</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-slate-700">Giỏ hàng ({items.length})</span>
            </div>

            <motion.div
                initial={{opacity: 0, y: 12}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.25}}
                className="grid gap-4 lg:grid-cols-[1fr_340px]"
            >
                {/* Cart items */}
                <section className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                            <ShoppingCart className="h-5 w-5" />
                            Giỏ hàng của bạn
                        </h1>
                    </div>

                    {items.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                            <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" />
                            <p className="mt-3 text-sm font-medium text-slate-500">Giỏ hàng trống</p>
                            <Link to="/products" className="mt-4 inline-flex rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
                                Mua sắm ngay
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item) => {
                                const price = item.salePrice ?? item.price ?? item.product?.salePrice ?? item.product?.price ?? 0
                                const imageSrc = item.thumbnail || item.product?.imageUrl || getFallbackImageSrc("NovaGear")
                                const productName = item.productName || item.product?.name || "Sản phẩm"

                                return (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                                    >
                                        <img
                                            src={imageSrc}
                                            alt={productName}
                                            className="h-20 w-20 shrink-0 rounded-lg border border-slate-100 object-contain p-1"
                                            data-fallback={getFallbackImageSrc("NovaGear")}
                                            onError={handleImageError}
                                        />

                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-sm font-semibold text-slate-900">{productName}</h3>
                                            {(item.variantLabel || item.variantSku) && (
                                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                                    {item.variantLabel || item.variantSku}
                                                </p>
                                            )}
                                            <p className="mt-1.5 text-base font-bold text-brand-red">{formatCurrency(price)}</p>

                                            <div className="mt-2 flex items-center gap-1">
                                                <button
                                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="min-w-[28px] text-center text-sm font-semibold">{item.quantity}</span>
                                                <button
                                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                                aria-label="Xóa sản phẩm"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <p className="text-sm font-bold text-slate-900">
                                                {formatCurrency(price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>

                {/* Order summary */}
                <aside className="h-fit space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-base font-bold text-slate-900">Tóm tắt đơn hàng</h2>

                        <div className="mt-4 space-y-2.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tạm tính ({items.length} sản phẩm)</span>
                                <span className="font-medium">{formatCurrency(total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1 text-slate-500">
                                    <Truck className="h-3.5 w-3.5" /> Phí vận chuyển
                                </span>
                                <span className="font-medium text-brand-green">Miễn phí</span>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-base font-bold text-slate-900">Tổng cộng</span>
                                <span className="text-xl font-extrabold text-brand-red">{formatCurrency(total)}</span>
                            </div>
                            <p className="mt-1 text-[10px] text-slate-400">(Đã bao gồm VAT nếu có)</p>
                        </div>

                        <button
                            disabled={items.length === 0}
                            onClick={() => navigate("/checkout")}
                            className="mt-4 w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-50"
                        >
                            Tiến hành thanh toán
                        </button>

                        <Link
                            to="/products"
                            className="mt-2 block text-center text-xs font-medium text-brand-blue hover:underline"
                        >
                            ← Tiếp tục mua sắm
                        </Link>
                    </div>

                    {/* Trust */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="space-y-3 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-brand-green" />
                                <span>Bảo hành chính hãng</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-brand-blue" />
                                <span>Giao hàng miễn phí toàn quốc</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </motion.div>
        </div>
    )
}