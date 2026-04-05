import {useEffect, useMemo, useState} from "react"
import {Link} from "react-router-dom"
import {getAdminProducts, type AdminProductItem} from "../../api/adminProductApi"
import {getAdminCategories, type AdminCategoryItem} from "../../api/adminCategoryApi"
import {getAdminOrders} from "../../api/adminOrderApi"
import {getAllInventory, type InventoryItem} from "../../api/inventoryApi"
import type {Order} from "../../types/order"

function formatCurrency(value: number) {
    return value.toLocaleString("vi-VN") + "đ"
}

function orderStatusText(status?: string) {
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
            return status || "—"
    }
}

function isLowStock(item: InventoryItem) {
    return item.availableQuantity <= 5
}

export default function AdminDashboardPage() {
    const [products, setProducts] = useState<AdminProductItem[]>([])
    const [categories, setCategories] = useState<AdminCategoryItem[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)

                const [productData, categoryData, orderData, inventoryData] = await Promise.all([
                    getAdminProducts(),
                    getAdminCategories(),
                    getAdminOrders(),
                    getAllInventory({page: 0, size: 100}),
                ])

                setProducts(productData)
                setCategories(categoryData)
                setOrders(orderData)
                setInventoryItems(inventoryData.items ?? [])
            } catch (error) {
                console.error(error)
                setProducts([])
                setCategories([])
                setOrders([])
                setInventoryItems([])
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const totalRevenue = useMemo(() => {
        return orders
            .filter((item) => item.status !== "CANCELLED")
            .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
    }, [orders])

    const pendingOrders = useMemo(() => {
        return orders.filter((item) => item.status === "PENDING").length
    }, [orders])

    const lowStockItems = useMemo(() => {
        return inventoryItems.filter(isLowStock).slice(0, 6)
    }, [inventoryItems])

    const recentOrders = useMemo(() => {
        return orders.slice(0, 5)
    }, [orders])

    if (loading) {
        return (
            <div className="rounded-[28px] bg-white p-10 text-center shadow-sm">
                Đang tải dashboard admin...
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <section
                className="rounded-[30px] bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 p-6 text-white shadow-xl">
                <h1 className="text-3xl font-extrabold">Dashboard quản trị</h1>
                <p className="mt-3 text-sm text-white/85">
                    Theo dõi nhanh sản phẩm, đơn hàng, danh mục và cảnh báo tồn kho.
                </p>
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[24px] bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Sản phẩm</p>
                    <p className="mt-3 text-3xl font-extrabold">{products.length}</p>
                </div>

                <div className="rounded-[24px] bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Danh mục</p>
                    <p className="mt-3 text-3xl font-extrabold">{categories.length}</p>
                </div>

                <div className="rounded-[24px] bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Đơn chờ xử lý</p>
                    <p className="mt-3 text-3xl font-extrabold">{pendingOrders}</p>
                </div>

                <div className="rounded-[24px] bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Doanh thu tạm tính</p>
                    <p className="mt-3 text-3xl font-extrabold">{formatCurrency(totalRevenue)}</p>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[24px] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold">Lối tắt quản trị</h2>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <Link to="/admin/products" className="rounded-2xl border p-4 font-semibold">
                            Quản lý sản phẩm
                        </Link>
                        <Link to="/admin/categories" className="rounded-2xl border p-4 font-semibold">
                            Quản lý danh mục
                        </Link>
                        <Link to="/admin/orders" className="rounded-2xl border p-4 font-semibold">
                            Quản lý đơn hàng
                        </Link>
                        <Link to="/admin/inventory" className="rounded-2xl border p-4 font-semibold">
                            Quản lý tồn kho
                        </Link>
                    </div>
                </div>

                <div className="rounded-[24px] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold">Sắp hết hàng</h2>

                    <div className="mt-4 space-y-3">
                        {lowStockItems.length === 0 ? (
                            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                                Chưa có variant nào sắp hết hàng.
                            </div>
                        ) : (
                            lowStockItems.map((item) => (
                                <div key={item.id} className="rounded-2xl border p-4">
                                    <p className="font-semibold">{item.productName || "Sản phẩm"}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {item.sku || "—"} · {[item.color, item.ram, item.storage].filter(Boolean).join(" / ")}
                                    </p>
                                    <p className="mt-2 font-bold text-red-500">
                                        Khả dụng: {item.availableQuantity}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="rounded-[24px] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Đơn hàng gần đây</h2>
                    <Link to="/admin/orders" className="text-sm font-semibold text-indigo-600">
                        Xem tất cả
                    </Link>
                </div>

                <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                        <tr className="border-b text-left text-slate-500">
                            <th className="px-3 py-3">Mã đơn</th>
                            <th className="px-3 py-3">Khách hàng</th>
                            <th className="px-3 py-3">Tổng tiền</th>
                            <th className="px-3 py-3">Trạng thái</th>
                        </tr>
                        </thead>
                        <tbody>
                        {recentOrders.map((order) => (
                            <tr key={order.id} className="border-b border-slate-50">
                                <td className="px-3 py-4 font-semibold">
                                    {order.orderCode || `#${order.id}`}
                                </td>
                                <td className="px-3 py-4">{order.receiverName || "—"}</td>
                                <td className="px-3 py-4 font-semibold text-rose-500">
                                    {formatCurrency(order.totalAmount)}
                                </td>
                                <td className="px-3 py-4">
                                    {orderStatusText(order.status)}
                                </td>
                            </tr>
                        ))}

                        {recentOrders.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                                    Chưa có đơn hàng nào.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}