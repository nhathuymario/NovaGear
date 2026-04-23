import {type SyntheticEvent, useEffect, useState} from "react"
import {Link, useNavigate} from "react-router-dom"
import {ChevronDown, LayoutGrid, Package, Search, ShoppingCart} from "lucide-react"
import {getAiSearchSuggestions, type AiSearchResult} from "../../api/aiApi"
import {useAuth} from "../../hooks/useAuth"
import {getSiteContent} from "../../utils/siteContent"

export default function Header() {
    const [keyword, setKeyword] = useState("")
    const [aiSuggestions, setAiSuggestions] = useState<AiSearchResult[]>([])
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const navigate = useNavigate()
    const {isAuthenticated, user, logout} = useAuth()

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

    const headerTopText = getSiteContent("headerTopText")
    const headerHotlineText = getSiteContent("headerHotlineText")

    return (
        <header className="sticky top-0 z-50 border-b border-white/70 bg-white/85 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="border-b border-slate-100/80 bg-gradient-to-r from-slate-50 via-white to-blue-50/50">
                <div className="mx-auto flex max-w-[1320px] items-center justify-between px-4 py-2 text-xs text-slate-600 md:px-5">
                    <p>{headerTopText}</p>
                    <p className="hidden md:block">{headerHotlineText}</p>
                </div>
            </div>

            <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap md:px-5">
                <Link to="/" className="flex items-center gap-2">
                    <span className="rounded-2xl bg-brand-yellow px-2.5 py-1.5 text-sm font-black text-brand-dark shadow-sm">NG</span>
                    <span className="text-xl font-black tracking-tight text-slate-900">NovaGear</span>
                </Link>

                <form onSubmit={handleSearch} className="order-3 w-full md:order-none md:flex-1">
                    <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-sm transition focus-within:border-brand-blue focus-within:bg-white focus-within:shadow-md">
                        <Search className="h-4 w-4 shrink-0 text-slate-400" />
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onFocus={() => {
                                if (aiSuggestions.length > 0) {
                                    setShowSuggestions(true)
                                }
                            }}
                            onBlur={() => {
                                window.setTimeout(() => setShowSuggestions(false), 150)
                            }}
                            placeholder="Bạn tìm gì hôm nay?"
                            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700"
                        >
                            <Search className="h-3.5 w-3.5" />
                            Tìm
                        </button>

                        {showSuggestions && (loadingSuggestions || aiSuggestions.length > 0) && (
                            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl">
                                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Goi y AI
                                </div>

                                {loadingSuggestions ? (
                                    <div className="px-4 py-3 text-sm text-slate-500">
                                        Dang lay goi y...
                                    </div>
                                ) : (
                                    <div className="max-h-80 overflow-y-auto">
                                        {aiSuggestions.map((suggestion) => (
                                            <button
                                                key={`${suggestion.title}-${suggestion.reason}`}
                                                type="button"
                                                onClick={() => handleSuggestionSelect(suggestion)}
                                                    className="block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 last:border-b-0"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {suggestion.title}
                                                        </p>
                                                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                                            {suggestion.excerpt}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                        {(suggestion.score * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </form>

                <nav className="flex items-center gap-2 md:gap-3">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100"
                    >
                        <LayoutGrid className="h-4 w-4"/>
                        Sản phẩm
                    </Link>
                    <Link
                        to="/cart"
                        className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100"
                    >
                        <ShoppingCart className="h-4 w-4"/>
                        Giỏ hàng
                    </Link>
                    <Link
                        to="/orders"
                        className="hidden items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 md:inline-flex"
                    >
                        <Package className="h-4 w-4"/>
                        Đơn hàng
                    </Link>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/profile")}
                                className="group inline-flex max-w-[220px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-yellow to-amber-400 text-xs font-black text-brand-dark">
                                    {(user?.fullName || user?.email || "T").slice(0, 1).toUpperCase()}
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate font-semibold text-slate-900">
                                        {user?.fullName || user?.email || "Tài khoản"}
                                    </span>
                                    <span className="block text-[11px] text-slate-500">
                                        {user?.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                                    </span>
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-slate-600"/>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-2xl bg-brand-yellow px-3 py-2 text-sm font-bold text-brand-dark transition hover:-translate-y-0.5 hover:brightness-95"
                        >
                            Đăng nhập
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}
