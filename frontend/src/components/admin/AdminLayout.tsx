import {Link, Outlet, useLocation, useNavigate} from "react-router-dom"
import {LogOut, ShieldUser} from "lucide-react"
import {useAuth} from "../../hooks/useAuth"

type NavItem = {
    to: string
    label: string
}

export default function AdminLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const {user, logout} = useAuth()

    const items: NavItem[] = [
        {to: "/admin", label: "Dashboard"},
        {to: "/admin/products", label: "Sản phẩm"},
        {to: "/admin/categories", label: "Danh mục"},
        {to: "/admin/orders", label: "Đơn hàng"},
        {to: "/admin/inventory", label: "Tồn kho"},
        {to: "/admin/users", label: "Nguoi dung"},
        {to: "/admin/policies", label: "Chinh sach"},
    ]

    const pageTitleMap: Record<string, string> = {
        "/admin": "Dashboard",
        "/admin/products": "Quan ly san pham",
        "/admin/categories": "Quan ly danh muc",
        "/admin/orders": "Quan ly don hang",
        "/admin/inventory": "Quan ly ton kho",
        "/admin/users": "Quan ly nguoi dung",
        "/admin/policies": "Quan ly chinh sach",
    }

    const activeTitle = pageTitleMap[location.pathname] ?? "Admin"

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <div className="h-screen overflow-hidden bg-slate-100">
            <div className="grid h-full w-full gap-5 px-3 py-4 sm:px-4 lg:grid-cols-[260px_1fr] lg:px-5">
                <aside
                    className="h-full rounded-[28px] bg-gradient-to-b from-indigo-600 via-blue-600 to-indigo-700 p-5 text-white shadow-xl">
                    <div className="border-b border-white/15 pb-5">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-sm font-extrabold">NG</span>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-white/70">NovaGear</p>
                                <h2 className="text-xl font-bold">Admin Panel</h2>
                            </div>
                        </div>
                    </div>

                    <nav className="mt-6 space-y-2">
                        {items.map((item) => {
                            const active =
                                item.to === "/admin"
                                    ? location.pathname === "/admin"
                                    : location.pathname.startsWith(item.to)

                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                                        active
                                            ? "bg-white/15 text-white"
                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                <main className="min-w-0 space-y-4 overflow-y-auto pr-1">
                    <header className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin dashboard</p>
                                <h1 className="mt-1 text-xl font-extrabold text-slate-900">{activeTitle}</h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                    <ShieldUser className="h-4 w-4 text-blue-600"/>
                                    <span className="max-w-[180px] truncate font-semibold">{user?.fullName || user?.email || "Admin"}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                >
                                    <LogOut className="h-4 w-4"/>
                                    Dang xuat
                                </button>
                            </div>
                        </div>
                    </header>
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}