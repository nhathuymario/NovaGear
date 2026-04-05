import {useEffect, useMemo, useState} from "react"
import {Link} from "react-router-dom"
import {getAdminProducts, type AdminProductItem} from "../../api/adminProductApi"
import {getAdminCategories, type AdminCategoryItem} from "../../api/adminCategoryApi"
import {getAdminOrders} from "../../api/adminOrderApi"
import {getAllInventory, type InventoryItem} from "../../api/inventoryApi"
import type {Order} from "../../types/order"
import "../../assets/admin-dashboard.css"

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

function statusClass(status?: string) {
    switch (status) {
        case "PENDING":
            return "admin-status-pill admin-status-pill--pending"
        case "CONFIRMED":
            return "admin-status-pill admin-status-pill--confirmed"
        case "PROCESSING":
            return "admin-status-pill admin-status-pill--processing"
        case "SHIPPING":
            return "admin-status-pill admin-status-pill--shipping"
        case "DELIVERED":
        case "COMPLETED":
            return "admin-status-pill admin-status-pill--delivered"
        case "CANCELLED":
            return "admin-status-pill admin-status-pill--cancelled"
        default:
            return "admin-status-pill admin-status-pill--pending"
    }
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

    const activeInventoryCount = useMemo(() => {
        return inventoryItems.filter((item) => item.status !== "OUT_OF_STOCK").length
    }, [inventoryItems])

    const stockCoverage = useMemo(() => {
        if (!inventoryItems.length) return 0
        return Math.round((activeInventoryCount / inventoryItems.length) * 100)
    }, [activeInventoryCount, inventoryItems.length])

    if (loading) {
        return (
            <div className="admin-panel p-8 text-center">
                <div className="admin-empty">Đang tải dashboard admin...</div>
            </div>
        )
    }

    return (
        <div className="admin-dashboard-shell">
            <section className="admin-hero">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Admin overview</p>
                <h1 className="admin-hero__title mt-2">Dashboard quản trị NovaGear</h1>
                <p className="admin-hero__subtitle">
                    Theo dõi nhanh danh mục, đơn hàng, tồn kho và các khu vực cần chú ý trong một màn hình riêng cho admin.
                </p>

                <div className="admin-chip-row">
                    <span className="admin-chip">{products.length} sản phẩm</span>
                    <span className="admin-chip">{categories.length} danh mục</span>
                    <span className="admin-chip">{orders.length} đơn hàng</span>
                    <span className="admin-chip">{inventoryItems.length} bản ghi tồn kho</span>
                </div>
            </section>

            <section className="admin-metric-grid">
                <div className="admin-metric-card">
                    <div className="admin-metric-label">Sản phẩm</div>
                    <div className="admin-metric-value">{products.length}</div>
                </div>
                <div className="admin-metric-card">
                    <div className="admin-metric-label">Đơn chờ xử lý</div>
                    <div className="admin-metric-value">{pendingOrders}</div>
                </div>
                <div className="admin-metric-card">
                    <div className="admin-metric-label">Doanh thu</div>
                    <div className="admin-metric-value">{formatCurrency(totalRevenue)}</div>
                </div>
                <div className="admin-metric-card">
                    <div className="admin-metric-label">Tỷ lệ có hàng</div>
                    <div className="admin-metric-value">{stockCoverage}%</div>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="admin-panel p-6">
                    <div className="admin-panel__header">
                        <h2 className="admin-panel__title">Lối tắt quản trị</h2>
                        <Link to="/admin/orders" className="text-sm font-semibold text-brand-blue">Mở đơn hàng</Link>
                    </div>

                    <div className="admin-action-grid">
                        <Link to="/admin/products" className="admin-action-card">
                            <div className="admin-action-card__label">Catalog</div>
                            <div className="admin-action-card__title">Quản lý sản phẩm</div>
                        </Link>
                        <Link to="/admin/categories" className="admin-action-card">
                            <div className="admin-action-card__label">Catalog</div>
                            <div className="admin-action-card__title">Quản lý danh mục</div>
                        </Link>
                        <Link to="/admin/orders" className="admin-action-card">
                            <div className="admin-action-card__label">Sales</div>
                            <div className="admin-action-card__title">Quản lý đơn hàng</div>
                        </Link>
                        <Link to="/admin/inventory" className="admin-action-card">
                            <div className="admin-action-card__label">Stock</div>
                            <div className="admin-action-card__title">Quản lý tồn kho</div>
                        </Link>
                    </div>
                </div>

                <div className="admin-panel p-6">
                    <div className="admin-panel__header">
                        <h2 className="admin-panel__title">Cảnh báo tồn kho</h2>
                        <span className="text-sm text-slate-500">{lowStockItems.length} SKU cần chú ý</span>
                    </div>

                    <div className="admin-stat-list">
                        {lowStockItems.length === 0 ? (
                            <div className="admin-empty">Chưa có variant nào sắp hết hàng.</div>
                        ) : (
                            lowStockItems.map((item) => {
                                const value = Math.max(0, Math.min(100, item.availableQuantity * 4))
                                return (
                                    <div key={item.id} className="admin-stat-item">
                                        <div className="admin-stat-item__meta">
                                            <div className="admin-stat-item__title">{item.productName || "Sản phẩm"}</div>
                                            <div className="admin-stat-item__sub">
                                                {item.sku || "—"} · {[item.color, item.ram, item.storage].filter(Boolean).join(" / ")}
                                            </div>
                                            <div className="admin-bar"><span style={{width: `${value}%`}} /></div>
                                        </div>
                                        <div className="admin-stat-item__value">{item.availableQuantity}</div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </section>

            <section className="admin-panel p-6">
                <div className="admin-panel__header">
                    <h2 className="admin-panel__title">Đơn hàng gần đây</h2>
                    <Link to="/admin/orders" className="text-sm font-semibold text-brand-blue">Xem tất cả</Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                        </tr>
                        </thead>
                        <tbody>
                        {recentOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="font-semibold text-slate-900">{order.orderCode || `#${order.id}`}</td>
                                <td>{order.receiverName || "—"}</td>
                                <td className="font-semibold text-rose-500">{formatCurrency(order.totalAmount)}</td>
                                <td><span className={statusClass(order.status)}>{orderStatusText(order.status)}</span></td>
                            </tr>
                        ))}

                        {recentOrders.length === 0 && (
                            <tr>
                                <td colSpan={4}>
                                    <div className="admin-empty">Chưa có đơn hàng nào.</div>
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