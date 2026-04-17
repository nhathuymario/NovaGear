import {useCallback, useEffect, useMemo, useState} from "react"
import {Link} from "react-router-dom"
import {AlertTriangle, CircleDollarSign, Clock3, FileText, Package, ShoppingCart, Tags, Warehouse,} from "lucide-react"
import {type AdminProductItem, getAdminProducts} from "../../api/adminProductApi"
import {type AdminCategoryItem, getAdminCategories} from "../../api/adminCategoryApi"
import {getAdminOrders} from "../../api/adminOrderApi"
import {getAllInventory, type InventoryItem} from "../../api/inventoryApi"
import type {Order} from "../../types/order"
import MetricCard from "../../components/admin/dashboard/MetricCard"
import QuickActionTile from "../../components/admin/dashboard/QuickActionTile"
import SectionCard from "../../components/admin/dashboard/SectionCard"
import OrderStatusBadge from "../../components/admin/dashboard/OrderStatusBadge"
import SimpleAreaChart from "../../components/admin/dashboard/SimpleAreaChart"
import SimpleDonutChart from "../../components/admin/dashboard/SimpleDonutChart"

function formatCurrency(value: number) {
    return value.toLocaleString("vi-VN") + "đ"
}

function isLowStock(item: InventoryItem) {
    return item.availableQuantity <= 5
}

function paymentStatusClass(paymentStatus?: string) {
    if (paymentStatus === "PAID") return "bg-emerald-50 text-emerald-700 ring-emerald-100"
    if (paymentStatus === "FAILED") return "bg-rose-50 text-rose-700 ring-rose-100"
    if (paymentStatus === "REFUNDED") return "bg-violet-50 text-violet-700 ring-violet-100"
    if (paymentStatus === "PENDING") return "bg-amber-50 text-amber-700 ring-amber-100"
    return "bg-slate-100 text-slate-700 ring-slate-200"
}

function paymentStatusText(paymentStatus?: string) {
    if (!paymentStatus) return "Chua cap nhat"
    if (paymentStatus === "PAID") return "Da thanh toan"
    if (paymentStatus === "FAILED") return "That bai"
    if (paymentStatus === "REFUNDED") return "Da hoan tien"
    if (paymentStatus === "PENDING") return "Cho thanh toan"
    return paymentStatus
}

function formatDate(value?: string) {
    if (!value) return "--"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "--"
    return date.toLocaleDateString("vi-VN")
}

function shortLabel(value?: string) {
    if (!value) return "--"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "--"
    return `${date.getDate()}/${date.getMonth() + 1}`
}

export default function AdminDashboardPage() {
    const [products, setProducts] = useState<AdminProductItem[]>([])
    const [categories, setCategories] = useState<AdminCategoryItem[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

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
        } catch (loadError) {
            console.error(loadError)
            setProducts([])
            setCategories([])
            setOrders([])
            setInventoryItems([])
            setError("Không tải được dashboard. Hãy thử tải lại.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadData()
    }, [loadData])

    const totalRevenue = useMemo(() => {
        return orders
            .filter((item) => item.status !== "CANCELLED")
            .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
    }, [orders])

    const pendingOrders = useMemo(() => {
        return orders.filter((item) => item.status === "PENDING").length
    }, [orders])

    const paidOrders = useMemo(() => {
        return orders.filter((item) => item.paymentStatus === "PAID").length
    }, [orders])

    const lowStockItems = useMemo(() => {
        return inventoryItems.filter(isLowStock).slice(0, 6)
    }, [inventoryItems])

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 6)
    }, [orders])

    const activeInventoryCount = useMemo(() => {
        return inventoryItems.filter((item) => item.status !== "OUT_OF_STOCK").length
    }, [inventoryItems])

    const stockCoverage = useMemo(() => {
        if (!inventoryItems.length) return 0
        return Math.round((activeInventoryCount / inventoryItems.length) * 100)
    }, [activeInventoryCount, inventoryItems.length])

    const orderStatusDistribution = useMemo(() => {
        const total = orders.length || 1
        const stages = ["PENDING", "PROCESSING", "SHIPPING", "DELIVERED"]
        return stages.map((stage) => {
            const count = orders.filter((item) => item.status === stage).length
            return {
                stage,
                count,
                width: Math.max(6, Math.round((count / total) * 100)),
            }
        })
    }, [orders])

    const revenueByRecentDays = useMemo(() => {
        const days = 7
        const map = new Map<string, number>()

        for (let i = days - 1; i >= 0; i -= 1) {
            const current = new Date()
            current.setHours(0, 0, 0, 0)
            current.setDate(current.getDate() - i)
            map.set(current.toISOString().slice(0, 10), 0)
        }

        orders.forEach((order) => {
            if (order.status === "CANCELLED" || !order.createdAt) return
            const key = new Date(order.createdAt).toISOString().slice(0, 10)
            if (!map.has(key)) return
            map.set(key, (map.get(key) ?? 0) + Number(order.totalAmount ?? 0))
        })

        return Array.from(map.entries()).map(([iso, value]) => ({
            label: shortLabel(iso),
            value,
        }))
    }, [orders])

    const paymentDonutData = useMemo(() => {
        const paid = orders.filter((item) => item.paymentStatus === "PAID").length
        const pending = orders.filter((item) => item.paymentStatus === "PENDING").length
        const failed = orders.filter((item) => item.paymentStatus === "FAILED").length
        const other = Math.max(0, orders.length - paid - pending - failed)

        return [
            {label: "Đã thanh toán", value: paid, color: "#10b981"},
            {label: "Chờ thanh toán", value: pending, color: "#f59e0b"},
            {label: "Thất bại", value: failed, color: "#f43f5e"},
            {label: "Khác", value: other, color: "#64748b"},
        ]
    }, [orders])

    const inventoryDonutData = useMemo(() => {
        const outOfStockCount = inventoryItems.filter((item) => item.availableQuantity <= 0).length
        const lowStockCount = inventoryItems.filter((item) => item.availableQuantity > 0 && item.availableQuantity <= 5).length
        const healthyCount = inventoryItems.filter((item) => item.availableQuantity > 5).length

        return [
            {label: "Ổn định", value: healthyCount, color: "#2563eb"},
            {label: "Sắp hết", value: lowStockCount, color: "#f97316"},
            {label: "Hết hàng", value: outOfStockCount, color: "#ef4444"},
        ]
    }, [inventoryItems])

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                    Đang tải dashboard admin...
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-slate-900 via-blue-800 to-blue-600 p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Admin overview</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight">Dashboard quản trị NovaGear</h1>
                        </div>
                        <button
                            onClick={() => void loadData()}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 p-4">
                    <span
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{products.length} Sản phẩm</span>
                    <span
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{categories.length} Danh mục</span>
                    <span
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{orders.length} Đơn hàng</span>
                    <span
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{inventoryItems.length} SKU tồn kho</span>
                </div>
            </section>

            {error ? (
                <div
                    className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0"/>
                    <div>{error}</div>
                </div>
            ) : null}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Sản phẩm" value={`${products.length}`} hint="Tổng số sản phẩm đang hoạt động"
                            icon={Package}/>
                <MetricCard title="Đơn chờ xử lý" value={`${pendingOrders}`} hint="Cần xác nhận trong ngày"
                            icon={Clock3}/>
                <MetricCard title="Doanh thu" value={formatCurrency(totalRevenue)} hint="Tổng giá trị đơn hàng"
                            icon={CircleDollarSign}/>
                <MetricCard title="Tồn kho khả dụng" value={`${stockCoverage}%`}
                            hint={`${activeInventoryCount}/${inventoryItems.length} SKU còn hàng`} icon={Warehouse}/>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <SectionCard
                    title="Lối tắt quản trị"
                    description="Di chuyển nhanh đến các module chính"
                    action={<Link to="/admin/orders"
                                  className="text-sm font-semibold text-blue-700 hover:text-blue-800">Mở đơn
                        hàng</Link>}
                >
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <QuickActionTile to="/admin/products" label="Catalog" title="Quản lí sản phẩm" icon={Package}/>
                        <QuickActionTile to="/admin/categories" label="Catalog" title="Quản lí danh mục" icon={Tags}/>
                        <QuickActionTile to="/admin/orders" label="Sales" title="Quản lí đơn hàng" icon={ShoppingCart}/>
                        <QuickActionTile to="/admin/inventory" label="Stock" title="Quản lí tồn kho" icon={Warehouse}/>
                        <QuickActionTile to="/admin/policies" label="Content" title="Quản lí chính sách"
                                         icon={FileText}/>
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-700">Trạng thái xử lí đơn hàng</span>
                            <span className="font-medium text-slate-500">Đã thanh toán: {paidOrders}</span>
                        </div>
                        <div className="mt-3 space-y-2">
                            {orderStatusDistribution.map((stage) => (
                                <div key={stage.stage} className="flex items-center gap-3">
                                    <div className="w-24 text-xs font-semibold text-slate-500">{stage.stage}</div>
                                    <div className="h-2 flex-1 rounded-full bg-slate-200">
                                        <div className="h-2 rounded-full bg-blue-600"
                                             style={{width: `${stage.width}%`}}/>
                                    </div>
                                    <div
                                        className="w-8 text-right text-xs font-semibold text-slate-700">{stage.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard
                    title="Cảnh báo tồn kho"
                    description={`${lowStockItems.length} SKU cần theo dõi`}
                    action={<Link to="/admin/inventory"
                                  className="text-sm font-semibold text-blue-700 hover:text-blue-800">Mở tồn kho</Link>}
                >
                    <div className="space-y-3">
                        {lowStockItems.length === 0 ? (
                            <div
                                className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                                Chưa có variant nào sắp hết hàng.
                            </div>
                        ) : (
                            lowStockItems.map((item) => {
                                const value = Math.max(0, Math.min(100, item.availableQuantity * 10))
                                const variantInfo = [item.color, item.ram, item.storage].filter(Boolean).join(" / ")
                                return (
                                    <article key={item.id}
                                             className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-900">{item.productName || "Sản phẩm"}</p>
                                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                                    {item.sku || "--"}{variantInfo ? ` · ${variantInfo}` : ""}
                                                </p>
                                            </div>
                                            <span
                                                className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                                                {item.availableQuantity}
                                            </span>
                                        </div>
                                        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200">
                                            <div className="h-2 rounded-full bg-rose-500" style={{width: `${value}%`}}/>
                                        </div>
                                    </article>
                                )
                            })
                        )}
                    </div>
                </SectionCard>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <SectionCard
                    title="Biểu đồ doanh thu 7 ngày"
                    description="Tổng giá trị đơn hàng không hủy theo ngày"
                >
                    <SimpleAreaChart
                        data={revenueByRecentDays}
                        valueFormatter={(value) => `${Math.round(value / 1000)}k`}
                    />
                </SectionCard>

                <SectionCard
                    title="Biểu đồ thanh toán"
                    description="Phân bố trạng thái thanh toán"
                >
                    <SimpleDonutChart data={paymentDonutData}/>
                </SectionCard>
            </section>

            <SectionCard
                title="Biểu đồ tồn kho"
                description="Tỷ lệ SKU ổn định / sắp hết / hết hàng"
            >
                <SimpleDonutChart data={inventoryDonutData}/>
            </SectionCard>

            <SectionCard
                title="Đơn hàng gần đây"
                description="Theo dõi nhanh trạng thái và thanh toán"
                action={<Link to="/admin/orders" className="text-sm font-semibold text-blue-700 hover:text-blue-800">Xem
                    tất cả</Link>}
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Mã
                                đơn
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Khách
                                hàng
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tổng
                                tiền
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Ngày
                                tạo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Trạng
                                thái
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Thanh
                                toán
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3 font-semibold text-slate-900">{order.orderCode || `#${order.id}`}</td>
                                <td className="px-4 py-3 text-slate-700">{order.receiverName || "--"}</td>
                                <td className="px-4 py-3 font-semibold text-blue-700">{formatCurrency(order.totalAmount)}</td>
                                <td className="px-4 py-3 text-slate-600">{formatDate(order.createdAt)}</td>
                                <td className="px-4 py-3"><OrderStatusBadge status={order.status}/></td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${paymentStatusClass(order.paymentStatus)}`}>
                                        {paymentStatusText(order.paymentStatus)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {recentOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6">
                                    <div
                                        className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                                        Chưa có đơn hàng nào.
                                    </div>
                                </td>
                            </tr>
                        ) : null}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    )
}