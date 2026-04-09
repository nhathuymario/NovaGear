import {Link, useNavigate} from "react-router-dom"
import {type SyntheticEvent, useState} from "react"
import {LayoutGrid, Package, ShoppingCart, UserRound} from "lucide-react"
import {useAuth} from "../../hooks/useAuth"

export default function Header() {
    const [keyword, setKeyword] = useState("")
    const navigate = useNavigate()
    const {isAuthenticated, user, logout} = useAuth()

    const handleSearch = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        navigate(`/products?keyword=${encodeURIComponent(keyword)}`)
    }

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
            <div className="border-b border-slate-100 bg-slate-50/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs text-slate-600">
                    <p>Giá tốt mỗi ngày - Hỗ trợ đổi trả linh hoạt</p>
                    <p className="hidden md:block">Hotline: 0123 456 789</p>
                </div>
            </div>

            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap">
                <Link to="/" className="flex items-center gap-2">
                    <span className="rounded-lg bg-brand-yellow px-2 py-1 text-sm font-black text-brand-dark">NG</span>
                    <span className="text-xl font-extrabold tracking-tight text-slate-900">NovaGear</span>
                </Link>

                <form onSubmit={handleSearch} className="order-3 w-full md:order-none md:flex-1">
                    <div
                        className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-brand-blue focus-within:bg-white">
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Bạn tìm gì hôm nay?"
                            className="w-full bg-transparent text-sm outline-none"
                        />
                        <button type="submit"
                                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                            Tìm
                        </button>
                    </div>
                </form>

                <nav className="flex items-center gap-2 md:gap-3">
                    <Link to="/products"
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                        <LayoutGrid className="h-4 w-4"/>
                        Sản phẩm
                    </Link>
                    <Link to="/cart"
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                        <ShoppingCart className="h-4 w-4"/>
                        Giỏ hàng
                    </Link>
                    <Link to="/orders"
                          className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:inline-flex">
                        <Package className="h-4 w-4"/>
                        Đơn hàng
                    </Link>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/profile")}
                                className="inline-flex max-w-[160px] items-center gap-1 truncate rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <UserRound className="h-4 w-4 shrink-0"/>
                                {user?.fullName || user?.email || "Tài khoản"}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            Đăng nhập
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}