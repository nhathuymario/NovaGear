import {type SyntheticEvent, useEffect, useState} from "react"
import {Link, useNavigate} from "react-router-dom"
import {LayoutGrid, Package, ShoppingCart, UserRound} from "lucide-react"
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
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
            <div className="border-b border-slate-100 bg-slate-50/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs text-slate-600">
                    <p>{headerTopText}</p>
                    <p className="hidden md:block">{headerHotlineText}</p>
                </div>
            </div>

            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap">
                <Link to="/" className="flex items-center gap-2">
                    <span className="rounded-lg bg-brand-yellow px-2 py-1 text-sm font-black text-brand-dark">NG</span>
                    <span className="text-xl font-extrabold tracking-tight text-slate-900">NovaGear</span>
                </Link>

                <form onSubmit={handleSearch} className="order-3 w-full md:order-none md:flex-1">
                    <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-brand-blue focus-within:bg-white">
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
                            placeholder="Ban tim gi hom nay?"
                            className="w-full bg-transparent text-sm outline-none"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                            Tim
                        </button>

                        {showSuggestions && (loadingSuggestions || aiSuggestions.length > 0) && (
                            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
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
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        <LayoutGrid className="h-4 w-4"/>
                        San pham
                    </Link>
                    <Link
                        to="/cart"
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        <ShoppingCart className="h-4 w-4"/>
                        Gio hang
                    </Link>
                    <Link
                        to="/orders"
                        className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:inline-flex"
                    >
                        <Package className="h-4 w-4"/>
                        Don hang
                    </Link>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/profile")}
                                className="inline-flex max-w-[160px] items-center gap-1 truncate rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <UserRound className="h-4 w-4 shrink-0"/>
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
                            className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-500"
                        >
                            Dang nhap
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}
