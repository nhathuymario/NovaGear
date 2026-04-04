import { Link, Outlet } from "react-router-dom"

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-brand-light">
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
                <aside className="h-fit rounded-2xl bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-bold">Admin</h2>

                    <nav className="mt-4 space-y-2">
                        <Link to="/admin" className="block rounded-xl px-4 py-3 hover:bg-gray-50">
                            Dashboard
                        </Link>
                        <Link to="/admin/products" className="block rounded-xl px-4 py-3 hover:bg-gray-50">
                            Sản phẩm
                        </Link>
                        <Link to="/admin/categories" className="block rounded-xl px-4 py-3 hover:bg-gray-50">
                            Danh mục
                        </Link>
                        <Link to="/admin/orders" className="block rounded-xl px-4 py-3 hover:bg-gray-50">
                            Đơn hàng
                        </Link>
                        <Link to="/admin/inventory" className="block rounded-xl px-4 py-3 hover:bg-gray-50">
                            Tồn kho
                        </Link>
                    </nav>
                </aside>

                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}