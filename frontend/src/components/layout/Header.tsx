import {type SyntheticEvent, useCallback, useEffect, useState} from "react"
import {Link, useNavigate} from "react-router-dom"
import {ChevronDown, Menu, Package, Search, ShoppingCart, User, X} from "lucide-react"
import {getAiSearchSuggestions, type AiSearchResult} from "../../api/aiApi"
import {OrderNotificationBell} from "../OrderNotificationBell"
import {useAuth} from "../../hooks/useAuth"
import {normalizeRole} from "../../utils/auth"
import TopBar from "./TopBar"
import MegaMenu from "./MegaMenu"

export default function Header() {
    const [keyword, setKeyword] = useState("")
    const [aiSuggestions, setAiSuggestions] = useState<AiSearchResult[]>([])
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [megaMenuOpen, setMegaMenuOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const navigate = useNavigate()
    const {isAuthenticated, user, logout} = useAuth()
    const normalizedRole = normalizeRole(user?.role)
    const logoUrl = ""

    useEffect(() => {
        const trimmedKeyword = keyword.trim()

        if (trimmedKeyword.length < 2) {
            setAiSuggestions([])
            setLoadingSuggestions(false)
            return
        }

        let isCancelled = false
        setLoadingSuggestions(true)

        const timeoutId = window.setTimeout(async () => {
            try {
                const results = await getAiSearchSuggestions(trimmedKeyword, 5)
                if (!isCancelled) {
                    setAiSuggestions(results)
                    setShowSuggestions(true)
                }
            } catch {
                if (!isCancelled) {
                    setAiSuggestions([])
                }
            } finally {
                if (!isCancelled) {
                    setLoadingSuggestions(false)
                }
            }
        }, 250)

        return () => {
            isCancelled = true
            window.clearTimeout(timeoutId)
        }
    }, [keyword])

    const handleSearch = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setShowSuggestions(false)
        navigate(`/products?keyword=${encodeURIComponent(keyword)}`)
    }

    const handleSuggestionSelect = (suggestion: AiSearchResult) => {
        setKeyword(suggestion.title)
        setShowSuggestions(false)
    }

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    const closeMegaMenu = useCallback(() => setMegaMenuOpen(false), [])

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <TopBar />

            {/* Main header bar */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-brand-yellow via-brand-yellow to-yellow-300">
                <div className="mx-auto flex max-w-[1320px] items-center gap-4 px-4 py-3">
                    {/* Logo */}
                    <Link to="/" className="flex shrink-0 items-center gap-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt="NovaGear" className="h-10 w-10 rounded-xl object-contain" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark text-sm font-black text-brand-yellow shadow-md">
                                NG
                            </div>
                        )}
                        <div className="hidden sm:block">
                            <span className="block text-lg font-black leading-tight text-brand-dark">NovaGear</span>
                            <span className="block text-[10px] font-semibold leading-tight text-brand-dark/60">Premium Tech Store</span>
                        </div>
                    </Link>

                    {/* Category button */}
                    <button
                        type="button"
                        onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                        className="hidden items-center gap-1.5 rounded-lg bg-brand-dark/90 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark md:flex"
                    >
                        <Menu className="h-4 w-4" />
                        Danh mục
                        <ChevronDown className={`h-3 w-3 transition ${megaMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <div className="relative flex items-center rounded-lg bg-white shadow-sm">
                            <input
                                id="search-input"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onFocus={() => {
                                    if (aiSuggestions.length > 0) setShowSuggestions(true)
                                }}
                                onBlur={() => {
                                    window.setTimeout(() => setShowSuggestions(false), 150)
                                }}
                                placeholder="Bạn tìm gì hôm nay?"
                                className="w-full rounded-l-lg border-none bg-transparent px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                className="flex h-full items-center gap-1.5 rounded-r-lg bg-brand-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <Search className="h-4 w-4" />
                                <span className="hidden sm:inline">Tìm kiếm</span>
                            </button>
                        </div>

                        {/* AI Search suggestions */}
                        {showSuggestions && (loadingSuggestions || aiSuggestions.length > 0) && (
                            <div className="animate-slide-down absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    🤖 Gợi ý AI
                                </div>
                                {loadingSuggestions ? (
                                    <div className="px-4 py-3 text-sm text-slate-500">Đang lấy gợi ý...</div>
                                ) : (
                                    <div className="max-h-80 overflow-y-auto">
                                        {aiSuggestions.map((suggestion) => (
                                            <button
                                                key={`${suggestion.title}-${suggestion.reason}`}
                                                type="button"
                                                onClick={() => handleSuggestionSelect(suggestion)}
                                                className="block w-full border-b border-slate-50 px-4 py-3 text-left transition hover:bg-brand-yellow/5 last:border-b-0"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{suggestion.title}</p>
                                                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{suggestion.excerpt}</p>
                                                    </div>
                                                    <span className="shrink-0 rounded-full bg-brand-blue/10 px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
                                                        {(suggestion.score * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </form>

                    {/* Right actions */}
                    <nav className="flex items-center gap-1 md:gap-2">
                        <Link
                            to="/cart"
                            id="cart-button"
                            className="relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-brand-dark transition hover:bg-brand-dark/10"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span className="text-[10px] font-semibold">Giỏ hàng</span>
                        </Link>

                        <Link
                            to="/orders"
                            className="hidden flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-brand-dark transition hover:bg-brand-dark/10 md:flex"
                        >
                            <Package className="h-5 w-5" />
                            <span className="text-[10px] font-semibold">Đơn hàng</span>
                        </Link>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-1">
                                {normalizedRole !== "ADMIN" ? <OrderNotificationBell /> : null}
                                <button
                                    onClick={() => navigate("/profile")}
                                    id="profile-button"
                                    className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-brand-dark transition hover:bg-brand-dark/10"
                                >
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-dark text-[10px] font-bold text-brand-yellow">
                                        {(user?.fullName || user?.email || "T").slice(0, 1).toUpperCase()}
                                    </div>
                                    <span className="max-w-[60px] truncate text-[10px] font-semibold">
                                        {user?.fullName || "Tài khoản"}
                                    </span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="hidden rounded-lg bg-brand-dark px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 md:block"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                id="login-button"
                                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-brand-dark transition hover:bg-brand-dark/10"
                            >
                                <User className="h-5 w-5" />
                                <span className="text-[10px] font-semibold">Đăng nhập</span>
                            </Link>
                        )}

                        {/* Mobile menu toggle */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-lg p-2 text-brand-dark transition hover:bg-brand-dark/10 md:hidden"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </nav>
                </div>

                {/* Mega menu dropdown */}
                <MegaMenu isOpen={megaMenuOpen} onClose={closeMegaMenu} />
            </div>

            {/* Quick category nav bar */}
            <div className="hidden border-b border-slate-100 bg-white md:block">
                <div className="mx-auto flex max-w-[1320px] items-center gap-1 px-4 py-1 text-xs">
                    {["Laptop", "PC", "Màn hình", "Bàn phím", "Tai nghe", "Chuột", "Phụ kiện"].map((name) => (
                        <Link
                            key={name}
                            to={`/products?category=${encodeURIComponent(name.toLowerCase().replace(/\s/g, '-'))}`}
                            className="rounded-md px-3 py-1.5 font-medium text-slate-600 transition hover:bg-brand-yellow/10 hover:text-brand-dark"
                        >
                            {name}
                        </Link>
                    ))}
                    {isAuthenticated && normalizedRole === "ADMIN" && (
                        <Link
                            to="/admin"
                            className="ml-auto rounded-md bg-brand-blue/10 px-3 py-1.5 font-semibold text-brand-blue transition hover:bg-brand-blue/20"
                        >
                            Admin Panel
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="animate-slide-down border-b border-slate-200 bg-white p-4 md:hidden">
                    <nav className="space-y-2">
                        <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                            Sản phẩm
                        </Link>
                        <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                            Đơn hàng
                        </Link>
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                                    Tài khoản
                                </Link>
                                {normalizedRole === "ADMIN" && (
                                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg bg-brand-blue/10 px-4 py-3 text-sm font-semibold text-brand-blue">
                                        Admin Panel
                                    </Link>
                                )}
                                <button
                                    onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                                    className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                                >
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg bg-brand-yellow px-4 py-3 text-center text-sm font-bold text-brand-dark">
                                Đăng nhập
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}
