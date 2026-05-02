import {useCallback, useEffect, useMemo, useState} from "react"
import {Link} from "react-router-dom"
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    CircleDollarSign,
    Clock3,
    Package,
    RefreshCw,
    ShoppingCart,
    TrendingUp,
    Users,
    Warehouse,
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from "recharts"
import {type AdminProductItem, getAdminProducts} from "../../api/adminProductApi"
import {type AdminCategoryItem, getAdminCategories} from "../../api/adminCategoryApi"
import {getAdminOrders} from "../../api/adminOrderApi"
import {getAllInventory, type InventoryItem} from "../../api/inventoryApi"
import type {Order} from "../../types/order"

function formatCurrency(value: number) {
    return value.toLocaleString("vi-VN") + "₫"
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

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    SHIPPING: "bg-violet-100 text-violet-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-red-100 text-red-800",
}

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
    PAID: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-violet-100 text-violet-700",
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
    PAID: "Đã thanh toán",
    PENDING: "Chờ thanh toán",
    FAILED: "Thất bại",
    REFUNDED: "Đã hoàn tiền",
}

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#64748b"]

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
        } catch (err) {
            console.error(err)
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

    const totalRevenue = useMemo(() =>
        orders.filter(o => o.status !== "CANCELLED").reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
    , [orders])

    const pendingOrders = useMemo(() => orders.filter(o => o.status === "PENDING").length, [orders])
    const completedOrders = useMemo(() => orders.filter(o => o.status === "COMPLETED").length, [orders])

    const activeInventoryCount = useMemo(() =>
        inventoryItems.filter(i => i.status !== "OUT_OF_STOCK").length
    , [inventoryItems])

    const stockCoverage = useMemo(() => {
        if (!inventoryItems.length) return 0
        return Math.round((activeInventoryCount / inventoryItems.length) * 100)
    }, [activeInventoryCount, inventoryItems.length])

    const lowStockItems = useMemo(() =>
        inventoryItems.filter(i => i.availableQuantity <= 5).slice(0, 5)
    , [inventoryItems])

    const recentOrders = useMemo(() =>
        [...orders].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 7)
    , [orders])

    const revenueByRecentDays = useMemo(() => {
        const days = 7
        const map = new Map<string, number>()
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date()
            d.setHours(0, 0, 0, 0)
            d.setDate(d.getDate() - i)
            map.set(d.toISOString().slice(0, 10), 0)
        }
        orders.forEach(o => {
            if (o.status === "CANCELLED" || !o.createdAt) return
            const key = new Date(o.createdAt).toISOString().slice(0, 10)
            if (map.has(key)) map.set(key, (map.get(key) ?? 0) + Number(o.totalAmount ?? 0))
        })
        return Array.from(map.entries()).map(([iso, value]) => ({
            name: shortLabel(iso),
            revenue: value,
        }))
    }, [orders])

    // ===== Real trend calculations: this week vs last week =====
    const trends = useMemo(() => {
        const now = new Date()
        const thisWeekStart = new Date(now)
        thisWeekStart.setDate(now.getDate() - 7)
        thisWeekStart.setHours(0, 0, 0, 0)
        const lastWeekStart = new Date(thisWeekStart)
        lastWeekStart.setDate(thisWeekStart.getDate() - 7)

        const inRange = (dateStr: string | undefined, start: Date, end: Date) => {
            if (!dateStr) return false
            const d = new Date(dateStr)
            return d >= start && d < end
        }

        const thisWeekOrders = orders.filter(o => inRange(o.createdAt, thisWeekStart, now))
        const lastWeekOrders = orders.filter(o => inRange(o.createdAt, lastWeekStart, thisWeekStart))

        const thisWeekRevenue = thisWeekOrders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + Number(o.totalAmount || 0), 0)
        const lastWeekRevenue = lastWeekOrders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + Number(o.totalAmount || 0), 0)

        const thisWeekPending = thisWeekOrders.filter(o => o.status === "PENDING").length
        const lastWeekPending = lastWeekOrders.filter(o => o.status === "PENDING").length

        const calcPercent = (current: number, previous: number): number | undefined => {
            if (previous === 0 && current === 0) return undefined
            if (previous === 0) return 100
            return Math.round(((current - previous) / previous) * 100)
        }

        return {
            revenue: calcPercent(thisWeekRevenue, lastWeekRevenue),
            pending: calcPercent(thisWeekPending, lastWeekPending),
        }
    }, [orders])

    const paymentDonutData = useMemo(() => {
        const paid = orders.filter(o => o.paymentStatus === "PAID").length
        const pending = orders.filter(o => o.paymentStatus === "PENDING").length
        const failed = orders.filter(o => o.paymentStatus === "FAILED").length
        const other = Math.max(0, orders.length - paid - pending - failed)
        return [
            {name: "Đã TT", value: paid},
            {name: "Chờ TT", value: pending},
            {name: "Thất bại", value: failed},
            {name: "Khác", value: other},
        ]
    }, [orders])

    const orderStatusBarData = useMemo(() => {
        return ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"].map(status => ({
            name: STATUS_LABELS[status] || status,
            count: orders.filter(o => o.status === status).length,
        }))
    }, [orders])

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-admin-accent border-t-transparent" />
                    <p className="text-sm font-medium text-slate-500">Đang tải dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Xin chào! 👋</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Tổng quan hoạt động kinh doanh NovaGear hôm nay
                    </p>
                </div>
                <button
                    onClick={() => void loadData()}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    <RefreshCw className="h-4 w-4" />
                    Làm mới
                </button>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <div>{error}</div>
                </div>
            )}

            {/* Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    title="Tổng doanh thu"
                    value={formatCurrency(totalRevenue)}
                    icon={CircleDollarSign}
                    color="bg-emerald-500"
                    trend={trends.revenue}
                />
                <MetricCard
                    title="Đơn chờ xử lý"
                    value={`${pendingOrders}`}
                    icon={Clock3}
                    color="bg-amber-500"
                    trend={trends.pending}
                />
                <MetricCard
                    title="Tổng sản phẩm"
                    value={`${products.length}`}
                    icon={Package}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="Tồn kho khả dụng"
                    value={`${stockCoverage}%`}
                    subtitle={`${activeInventoryCount}/${inventoryItems.length} SKU`}
                    icon={Warehouse}
                    color="bg-violet-500"
                />
            </div>

            {/* Charts row */}
            <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
                {/* Revenue chart */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Doanh thu 7 ngày</h3>
                            <p className="text-xs text-slate-500">Tổng giá trị đơn hàng không hủy</p>
                        </div>
                        <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            trends.revenue !== undefined && trends.revenue >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                            {trends.revenue !== undefined && trends.revenue >= 0
                                ? <TrendingUp className="h-3 w-3" />
                                : <ArrowDown className="h-3 w-3" />
                            }
                            {trends.revenue !== undefined ? `${trends.revenue >= 0 ? '+' : ''}${trends.revenue}%` : '--'}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={revenueByRecentDays}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false}
                                   tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                            <Tooltip
                                formatter={(value) => [formatCurrency(Number(value)), "Doanh thu"]}
                                contentStyle={{borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13}}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5}
                                  fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment donut */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900">Trạng thái thanh toán</h3>
                    <p className="mb-2 text-xs text-slate-500">Phân bố theo tổng đơn hàng</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={paymentDonutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                 dataKey="value" stroke="none">
                                {paymentDonutData.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13}} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex flex-wrap justify-center gap-3">
                        {paymentDonutData.map((item, i) => (
                            <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                                <span className="h-2.5 w-2.5 rounded-full" style={{background: PIE_COLORS[i]}} />
                                {item.name}: {item.value}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Order status bar + Low stock */}
            <div className="grid gap-5 xl:grid-cols-2">
                {/* Order status bar chart */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-1 text-base font-bold text-slate-900">Trạng thái đơn hàng</h3>
                    <p className="mb-4 text-xs text-slate-500">Phân bố đơn hàng theo trạng thái</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={orderStatusBarData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{fontSize: 11, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13}} />
                            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Low stock alerts */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Cảnh báo tồn kho</h3>
                            <p className="text-xs text-slate-500">{lowStockItems.length} SKU cần theo dõi</p>
                        </div>
                        <Link to="/admin/inventory" className="text-xs font-semibold text-admin-accent hover:underline">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {lowStockItems.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                Chưa có SKU nào sắp hết hàng 🎉
                            </div>
                        ) : (
                            lowStockItems.map((item) => {
                                const variantInfo = [item.color, item.ram, item.storage].filter(Boolean).join(" / ")
                                const barWidth = Math.max(5, Math.min(100, item.availableQuantity * 10))
                                return (
                                    <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-900">{item.productName || "Sản phẩm"}</p>
                                                <p className="truncate text-[11px] text-slate-500">
                                                    {item.sku || "--"}{variantInfo ? ` · ${variantInfo}` : ""}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                                                item.availableQuantity <= 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                            }`}>
                                                {item.availableQuantity}
                                            </span>
                                        </div>
                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                            <div className={`h-1.5 rounded-full ${
                                                item.availableQuantity <= 0 ? "bg-red-500" : "bg-amber-500"
                                            }`} style={{width: `${barWidth}%`}} />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Quick stats row */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
                    <ShoppingCart className="mx-auto h-8 w-8 text-blue-500" />
                    <p className="mt-2 text-2xl font-bold text-slate-900">{orders.length}</p>
                    <p className="text-xs text-slate-500">Tổng đơn hàng</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
                    <Users className="mx-auto h-8 w-8 text-violet-500" />
                    <p className="mt-2 text-2xl font-bold text-slate-900">{categories.length}</p>
                    <p className="text-xs text-slate-500">Danh mục</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
                    <Package className="mx-auto h-8 w-8 text-emerald-500" />
                    <p className="mt-2 text-2xl font-bold text-slate-900">{completedOrders}</p>
                    <p className="text-xs text-slate-500">Đơn hoàn thành</p>
                </div>
            </div>

            {/* Recent orders table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Đơn hàng gần đây</h3>
                        <p className="text-xs text-slate-500">Theo dõi nhanh trạng thái và thanh toán</p>
                    </div>
                    <Link to="/admin/orders" className="text-xs font-semibold text-admin-accent hover:underline">
                        Xem tất cả
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Mã đơn</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Khách hàng</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng tiền</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Ngày tạo</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Thanh toán</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="transition hover:bg-slate-50/80">
                                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                                        {order.orderCode || `#${order.id}`}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-700">{order.receiverName || "--"}</td>
                                    <td className="px-5 py-3.5 font-semibold text-admin-accent">
                                        {formatCurrency(order.totalAmount)}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500">{formatDate(order.createdAt)}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${
                                            STATUS_COLORS[order.status] || "bg-slate-100 text-slate-700"
                                        }`}>
                                            {STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${
                                            PAYMENT_STATUS_COLORS[order.paymentStatus || ""] || "bg-slate-100 text-slate-700"
                                        }`}>
                                            {PAYMENT_STATUS_LABELS[order.paymentStatus || ""] || order.paymentStatus || "Chưa cập nhật"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-8">
                                        <div className="text-center text-sm text-slate-500">Chưa có đơn hàng nào.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ===== MetricCard sub-component =====
interface MetricCardProps {
    title: string
    value: string
    subtitle?: string
    icon: typeof Package
    color: string
    trend?: number
}

function MetricCard({title, value, subtitle, icon: Icon, color, trend}: MetricCardProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}>
                        {trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{subtitle || title}</p>
        </div>
    )
}