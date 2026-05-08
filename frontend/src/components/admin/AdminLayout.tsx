import {useState, useEffect} from "react"
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom"
import {
    BarChart3,
    ChevronLeft,
    FileText,
    LayoutDashboard,
    LogOut,
    Package,
    Truck,
    Palette,
    ShoppingCart,
    Tags,
    Users,
    Warehouse,
    Search,
    Menu,
    Sun,
    Moon,
} from "lucide-react"
import {useAuth} from "../../hooks/useAuth"
import {OrderNotificationBell} from "../OrderNotificationBell"

type NavItem = {
    to: string
    label: string
    icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
    {to: "/admin", label: "Dashboard", icon: LayoutDashboard},
    {to: "/admin/products", label: "Sản phẩm", icon: Package},
    {to: "/admin/categories", label: "Danh mục", icon: Tags},
    {to: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart},
    {to: "/admin/shipping", label: "Vận chuyển", icon: Truck},
    {to: "/admin/inventory", label: "Tồn kho", icon: Warehouse},
    {to: "/admin/users", label: "Người dùng", icon: Users},
    {to: "/admin/policies", label: "Chính sách", icon: FileText},
    {to: "/admin/storefront", label: "Giao diện", icon: Palette},
]

const PAGE_TITLES: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/products": "Quản lý sản phẩm",
    "/admin/categories": "Quản lý danh mục",
    "/admin/orders": "Quản lý đơn hàng",
    "/admin/inventory": "Quản lý tồn kho",
    "/admin/users": "Quản lý người dùng",
    "/admin/policies": "Quản lý chính sách",
    "/admin/storefront": "Quản lý giao diện",
    "/admin/shipping": "Quản lý vận chuyển",
}

export default function AdminLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const {user, logout} = useAuth()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("novagear-admin-theme") === "dark")

    useEffect(() => {
        localStorage.setItem("novagear-admin-theme", darkMode ? "dark" : "light")
    }, [darkMode])

    const activeTitle = PAGE_TITLES[location.pathname] ?? "Admin"

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const isActive = (path: string) =>
        path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path)

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className={`border-b border-white/10 p-4 ${collapsed ? "text-center" : ""}`}>
                <Link to="/admin" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-admin-accent text-sm font-black text-white shadow-lg shadow-admin-accent/25">
                        NG
                    </div>
                    {!collapsed && (
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">NovaGear</p>
                            <h2 className="text-base font-bold text-white">Admin Panel</h2>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3">
                <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30 ${collapsed ? "text-center" : ""}`}>
                    {collapsed ? "•••" : "Menu chính"}
                </p>
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.to)
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileOpen(false)}
                            className={`admin-sidebar-item ${active ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon className="h-[18px] w-[18px] shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    )
                })}

                <div className="my-4 border-t border-white/10" />

                <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30 ${collapsed ? "text-center" : ""}`}>
                    {collapsed ? "•••" : "Khác"}
                </p>
                <Link
                    to="/"
                    className={`admin-sidebar-item ${collapsed ? "justify-center px-2" : ""}`}
                    title={collapsed ? "Về trang chủ" : undefined}
                >
                    <BarChart3 className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span>Về trang chủ</span>}
                </Link>
            </nav>

            {/* User section */}
            {!collapsed && (
                <div className="border-t border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-accent/30 text-xs font-bold text-white">
                            {(user?.fullName || user?.email || "A").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                                {user?.fullName || user?.email || "Admin"}
                            </p>
                            <p className="text-[10px] text-white/40">Administrator</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )

    return (
        <div className={`h-screen overflow-hidden ${darkMode ? 'admin-dark' : ''}`} style={{background: darkMode ? '#0f172a' : undefined}}>
            <div className="flex h-full">
                {/* Desktop sidebar */}
                <aside
                    className={`hidden h-full flex-col bg-admin-sidebar transition-all duration-300 lg:flex ${
                        collapsed ? "w-[72px]" : "w-[260px]"
                    }`}
                >
                    {sidebarContent}
                </aside>

                {/* Mobile sidebar overlay */}
                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                        <aside className="relative z-10 flex h-full w-[260px] flex-col bg-admin-sidebar">
                            {sidebarContent}
                        </aside>
                    </div>
                )}

                {/* Main content */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Top header */}
                    <header className={`flex h-16 shrink-0 items-center justify-between border-b px-4 lg:px-6 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (window.innerWidth >= 1024) setCollapsed(!collapsed)
                                    else setMobileOpen(!mobileOpen)
                                }}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                            >
                                {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                            </button>
                            <div>
                                <p className={`text-[10px] font-semibold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Admin</p>
                                <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{activeTitle}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className={`hidden items-center rounded-lg border px-3 py-2 md:flex ${darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-slate-50'}`}>
                                <Search className={`mr-2 h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className={`w-48 bg-transparent text-sm outline-none ${darkMode ? 'text-white placeholder:text-slate-500' : 'placeholder:text-slate-400'}`}
                                />
                            </div>

                            {/* Notifications - Real Bell */}
                            <OrderNotificationBell />

                            {/* Dark/Light Mode Toggle */}
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`rounded-lg p-2 transition ${darkMode ? 'text-amber-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
                                title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                            >
                                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>

                            {/* User */}
                            <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 md:flex">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-admin-accent text-xs font-bold text-white">
                                    {(user?.fullName || user?.email || "A").slice(0, 1).toUpperCase()}
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-sm font-semibold text-slate-900">
                                        {user?.fullName || user?.email || "Admin"}
                                    </p>
                                </div>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">Đăng xuất</span>
                            </button>
                        </div>
                    </header>

                    {/* Content area */}
                    <main className={`flex-1 overflow-y-auto p-4 lg:p-6 ${darkMode ? 'bg-slate-900' : 'bg-admin-bg'}`}>
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    )
}