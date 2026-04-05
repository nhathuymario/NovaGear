import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"

export default function Header() {
    const [keyword, setKeyword] = useState("")
    const navigate = useNavigate()
    const { isAuthenticated, user, logout } = useAuth()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        navigate(`/products?keyword=${encodeURIComponent(keyword)}`)
    }

    const handleLogout = () => {
        logout()
        navigate("/")
        window.location.reload()
    }

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
            <div className="border-b border-slate-100 bg-slate-50/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs text-slate-600">
                    <p>Gia tot moi ngay - Ho tro doi tra linh hoat</p>
                    <p className="hidden md:block">Hotline: 0123 456 789</p>
                </div>
            </div>

            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap">
                <Link to="/" className="flex items-center gap-2">
                    <span className="rounded-lg bg-brand-yellow px-2 py-1 text-sm font-black text-brand-dark">NG</span>
                    <span className="text-xl font-extrabold tracking-tight text-slate-900">NovaGear</span>
                </Link>

                <form onSubmit={handleSearch} className="order-3 w-full md:order-none md:flex-1">
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-brand-blue focus-within:bg-white">
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Ban tim gi hom nay?"
                            className="w-full bg-transparent text-sm outline-none"
                        />
                        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                            Tim
                        </button>
                    </div>
                </form>

                <nav className="flex items-center gap-2 md:gap-3">
                    <Link to="/products" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                        San pham
                    </Link>
                    <Link to="/cart" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                        Gio hang
                    </Link>
                    <Link to="/orders" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:inline-block">
                        Don hang
                    </Link>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/profile")}
                                className="max-w-[130px] truncate rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                {user?.fullName || user?.email || "Tai khoan"}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                            >
                                Dang xuat
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            Dang nhap
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}