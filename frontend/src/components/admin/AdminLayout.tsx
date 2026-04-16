import {Link, Outlet, useLocation} from "react-router-dom"

type NavItem = {
    to: string
    label: string
}

export default function AdminLayout() {
    const location = useLocation()

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

    return (
        <div className="h-screen overflow-hidden bg-slate-100">
            <div className="grid h-full w-full gap-5 px-3 py-4 sm:px-4 lg:grid-cols-[260px_1fr] lg:px-5">
                <aside
                    className="h-full rounded-[28px] bg-gradient-to-b from-indigo-600 via-blue-600 to-indigo-700 p-5 text-white shadow-xl">
                    <div className="border-b border-white/15 pb-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/70">NovaGear</p>
                        <h2 className="mt-2 text-2xl font-bold">Admin Panel</h2>
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
                                <Link to="/admin/orders" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Quan ly don
                                </Link>
                                <Link to="/admin/products" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Quan ly san pham
                                </Link>
                                <Link to="/admin/users" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Quan ly user
                                </Link>
                            </div>
                        </div>
                    </header>
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}