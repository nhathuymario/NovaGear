import {useCallback, useEffect, useMemo, useState} from "react"
import {Link} from "react-router-dom"
import {motion} from "framer-motion"
import {
    ArrowRight,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Cpu,
    Layers,
    Monitor,
    Newspaper,
    Search,
    Smartphone,
    Sparkles,
    Tag,
    User,
    Zap,
} from "lucide-react"
import {getArticles, type ArticleItem} from "../api/articleApi"

const CATEGORIES = [
    {key: "", label: "Tất cả", icon: Layers},
    {key: "Công nghệ", label: "Công nghệ", icon: Cpu},
    {key: "Laptop", label: "Laptop", icon: Monitor},
    {key: "Smartphone", label: "Smartphone", icon: Smartphone},
    {key: "Review", label: "Review", icon: Sparkles},
    {key: "Mẹo vặt", label: "Mẹo vặt", icon: Zap},
]

const COVER_GRADIENTS = [
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-cyan-500 via-blue-500 to-indigo-500",
    "from-emerald-500 via-teal-500 to-cyan-500",
    "from-amber-500 via-orange-500 to-red-500",
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-rose-500 via-pink-500 to-purple-500",
]

function formatDate(dateStr: string): string {
    try {
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date(dateStr))
    } catch {
        return dateStr
    }
}

function readingTime(content: string): number {
    const words = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
}

function ArticleCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-[16/9] animate-shimmer" />
            <div className="space-y-3 p-5">
                <div className="h-3 w-20 rounded-full animate-shimmer" />
                <div className="h-5 w-4/5 rounded animate-shimmer" />
                <div className="h-3 w-full rounded animate-shimmer" />
                <div className="h-3 w-3/4 rounded animate-shimmer" />
                <div className="flex gap-3">
                    <div className="h-3 w-16 rounded animate-shimmer" />
                    <div className="h-3 w-20 rounded animate-shimmer" />
                </div>
            </div>
        </div>
    )
}

export default function TechArticlesPage() {
    const [articles, setArticles] = useState<ArticleItem[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const limit = 9

    const fetchArticles = useCallback(() => {
        setLoading(true)
        getArticles(page, limit, category || undefined, "PUBLISHED")
            .then((res) => {
                setArticles(res.items)
                setTotal(res.total)
            })
            .catch(() => {
                setArticles([])
                setTotal(0)
            })
            .finally(() => setLoading(false))
    }, [page, category])

    useEffect(() => {
        fetchArticles()
    }, [fetchArticles])

    const filteredArticles = useMemo(() => {
        if (!searchQuery.trim()) return articles
        const q = searchQuery.toLowerCase()
        return articles.filter(
            (a) =>
                a.title.toLowerCase().includes(q) ||
                a.summary.toLowerCase().includes(q) ||
                a.tags.some((t) => t.toLowerCase().includes(q))
        )
    }, [articles, searchQuery])

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="space-y-6">
            {/* ── Hero Section ───────────────────────────────────────── */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 py-12 text-white md:px-12 md:py-16">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-500/15 blur-3xl" />

                <div className="relative z-10 mx-auto max-w-3xl text-center">
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5}}
                    >
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur">
                            <Newspaper className="h-3.5 w-3.5" />
                            NovaGear Blog
                        </div>
                        <h1 className="text-3xl font-black leading-tight md:text-5xl">
                            Tin Công Nghệ
                        </h1>
                        <p className="mt-3 text-sm text-white/60 md:text-base">
                            Cập nhật xu hướng, đánh giá sản phẩm và mẹo công nghệ mới nhất
                        </p>
                    </motion.div>

                    {/* Search */}
                    <motion.div
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.15}}
                        className="mx-auto mt-6 max-w-lg"
                    >
                        <div className="flex items-center rounded-xl bg-white/10 backdrop-blur">
                            <Search className="ml-4 h-4 w-4 text-white/50" />
                            <input
                                id="tech-search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm bài viết..."
                                className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/40"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Category Tabs ──────────────────────────────────────── */}
            <section className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                    const active = category === cat.key
                    const Icon = cat.icon
                    return (
                        <button
                            key={cat.key}
                            onClick={() => {
                                setCategory(cat.key)
                                setPage(0)
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                                active
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                    : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {cat.label}
                        </button>
                    )
                })}
            </section>

            {/* ── Articles Grid ──────────────────────────────────────── */}
            {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({length: 6}).map((_, i) => (
                        <ArticleCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
                    <Newspaper className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-lg font-semibold text-slate-700">
                        Chưa có bài viết nào
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Hãy quay lại sau để xem những bài viết công nghệ mới nhất!
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredArticles.map((article, index) => (
                        <motion.div
                            key={article.id}
                            initial={{opacity: 0, y: 16}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.3, delay: index * 0.05}}
                        >
                            <Link
                                to={`/tech/${article.slug}`}
                                className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
                            >
                                {/* Cover */}
                                {article.cover_image_url ? (
                                    <div className="aspect-[16/9] overflow-hidden">
                                        <img
                                            src={article.cover_image_url}
                                            alt={article.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className={`flex aspect-[16/9] items-center justify-center bg-gradient-to-br ${
                                            COVER_GRADIENTS[index % COVER_GRADIENTS.length]
                                        }`}
                                    >
                                        <Newspaper className="h-12 w-12 text-white/40" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-5">
                                    {/* Category tag */}
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600">
                                            {article.category}
                                        </span>
                                    </div>

                                    <h3 className="line-clamp-2 text-base font-bold text-slate-900 transition group-hover:text-indigo-600">
                                        {article.title}
                                    </h3>

                                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                                        {article.summary}
                                    </p>

                                    {/* Tags */}
                                    {article.tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {article.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
                                                >
                                                    <Tag className="h-2.5 w-2.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Meta */}
                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {article.author}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(article.created_at)}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {readingTime(article.content)} phút
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ── Pagination ──────────────────────────────────────── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({length: totalPages}).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                                i === page
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* ── CTA Section ─────────────────────────────────────── */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-8 text-center md:p-12">
                <Sparkles className="mx-auto h-8 w-8 text-indigo-500" />
                <h2 className="mt-3 text-xl font-bold text-slate-900">
                    Khám phá sản phẩm công nghệ mới nhất
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Từ laptop gaming đến phụ kiện cao cấp — tất cả đều có tại NovaGear
                </p>
                <Link
                    to="/products"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                    Xem sản phẩm
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    )
}
