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
        <header className="sticky top-0 z-50 border-b bg-brand-yellow">
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
                <Link to="/" className="text-2xl font-extrabold text-brand-dark">
                    NovaGear
                </Link>

                <form onSubmit={handleSearch} className="flex-1">
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Bạn tìm gì hôm nay?"
                        className="w-full rounded-xl border border-yellow-300 bg-white px-4 py-2 outline-none"
                    />
                </form>

                <nav className="hidden items-center gap-5 md:flex">
                    <Link to="/products" className="font-medium">
                        Sản phẩm
                    </Link>
                    <Link to="/cart" className="font-medium">
                        Giỏ hàng
                    </Link>
                    <Link to="/orders" className="font-medium">
                        Đơn hàng
                    </Link>
                    {/* Kiểm tra trạng thái đăng nhập */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            {/* Click vào tên hoặc email để về trang cá nhân */}
                            <button
                                onClick={() => navigate("/profile")}
                                className="text-sm font-medium text-brand-dark transition-colors hover:underline"
                            >
                                {user?.fullName || user?.email || "Tài khoản"}
                            </button>

                            {/* Nút Đăng xuất */}
                            <button
                                onClick={handleLogout}
                                className="rounded-lg bg-brand-dark px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-opacity-90 active:scale-95"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        /* Nếu chưa đăng nhập thì hiện link Đăng nhập */
                        <Link
                            to="/login"
                            className="text-sm font-medium text-brand-dark hover:text-brand-gray transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}