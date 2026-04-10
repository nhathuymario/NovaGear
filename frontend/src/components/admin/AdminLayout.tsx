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
        {to: "/admin/policies", label: "Chinh sach"},
    ]

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
                <aside
                    className="rounded-[28px] bg-gradient-to-b from-indigo-600 via-blue-600 to-indigo-700 p-5 text-white shadow-xl">
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

                <main>
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}