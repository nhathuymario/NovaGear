import {useEffect, useState} from "react"
import {Link, useParams} from "react-router-dom"
import {motion} from "framer-motion"
import {
    ArrowLeft,
    Calendar,
    ChevronRight,
    Clock,
    Newspaper,
    Share2,
    Tag,
    User,
} from "lucide-react"
import {getArticleBySlug, getArticles, type ArticleItem} from "../api/articleApi"

const COVER_GRADIENTS = [
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-cyan-500 via-blue-500 to-indigo-500",
    "from-emerald-500 via-teal-500 to-cyan-500",
]

function formatDate(dateStr: string): string {
    try {
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(new Date(dateStr))
    } catch {
        return dateStr
    }
}

function readingTime(content: string): number {
    return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))
}

/** Simple markdown-to-HTML renderer for article content */
function renderMarkdown(md: string): string {
    let html = md
        // headings
        .replace(/^### (.+)$/gm, '<h3 class="mt-8 mb-3 text-lg font-bold text-slate-900">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="mt-10 mb-4 text-xl font-extrabold text-slate-900">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="mt-10 mb-4 text-2xl font-black text-slate-900">$1</h1>')
        // bold & italic
        .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        // inline code
        .replace(/`(.+?)`/g, '<code class="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono text-indigo-600">$1</code>')
        // blockquote
        .replace(/^> (.+)$/gm, '<blockquote class="my-4 border-l-4 border-indigo-400 bg-indigo-50/50 pl-4 py-2 italic text-slate-600">$1</blockquote>')
        // unordered list
        .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc text-slate-700">$1</li>')
        // ordered list
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal text-slate-700">$1</li>')
        // horizontal rule
        .replace(/^---$/gm, '<hr class="my-8 border-slate-200" />')
        // links
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-indigo-600 underline hover:text-indigo-800">$1</a>')
        // paragraphs — replace double newlines
        .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-slate-700">')

    // Wrap in paragraph
    html = `<p class="mb-4 leading-relaxed text-slate-700">${html}</p>`
    // Clean up empty paragraphs
    html = html.replace(/<p class="[^"]*"><\/p>/g, "")
    // Wrap consecutive <li> items in <ul>
    html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul class="my-4 space-y-1">$1</ul>')

    return html
}

function ContentSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-72 w-full rounded-2xl animate-shimmer" />
            <div className="h-8 w-3/4 rounded animate-shimmer" />
            <div className="h-4 w-1/3 rounded animate-shimmer" />
            <div className="space-y-2 mt-8">
                {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="h-4 w-full rounded animate-shimmer" />
                ))}
            </div>
        </div>
    )
}

export default function TechArticleDetailPage() {
    const {slug} = useParams<{slug: string}>()
    const [article, setArticle] = useState<ArticleItem | null>(null)
    const [relatedArticles, setRelatedArticles] = useState<ArticleItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!slug) return
        setLoading(true)
        setError("")

        getArticleBySlug(slug)
            .then((data) => {
                setArticle(data)
                // Fetch related articles from same category
                return getArticles(0, 4, data.category, "PUBLISHED")
            })
            .then((res) => {
                setRelatedArticles(
                    res.items.filter((a) => a.slug !== slug).slice(0, 3)
                )
            })
            .catch(() => setError("Không tìm thấy bài viết"))
            .finally(() => setLoading(false))
    }, [slug])

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article?.title,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl py-8">
                <ContentSkeleton />
            </div>
        )
    }

    if (error || !article) {
        return (
            <div className="py-20 text-center">
                <Newspaper className="mx-auto h-16 w-16 text-slate-300" />
                <p className="mt-4 text-xl font-bold text-slate-700">
                    {error || "Không tìm thấy bài viết"}
                </p>
                <Link
                    to="/tech"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại Tin công nghệ
                </Link>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 py-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                <Link to="/" className="transition hover:text-indigo-600">
                    Trang chủ
                </Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/tech" className="transition hover:text-indigo-600">
                    Tin công nghệ
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="max-w-[200px] truncate font-medium text-slate-700">
                    {article.title}
                </span>
            </nav>

            {/* Cover image */}
            <motion.div
                initial={{opacity: 0, y: 16}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.4}}
            >
                {article.cover_image_url ? (
                    <div className="overflow-hidden rounded-2xl">
                        <img
                            src={article.cover_image_url}
                            alt={article.title}
                            className="aspect-[2/1] w-full object-cover"
                        />
                    </div>
                ) : (
                    <div
                        className={`flex aspect-[2.5/1] items-center justify-center rounded-2xl bg-gradient-to-br ${COVER_GRADIENTS[0]}`}
                    >
                        <Newspaper className="h-20 w-20 text-white/30" />
                    </div>
                )}
            </motion.div>

            {/* Article header */}
            <motion.div
                initial={{opacity: 0, y: 12}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.4, delay: 0.1}}
            >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                        {article.category}
                    </span>
                    {article.tags.slice(0, 4).map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                        </span>
                    ))}
                </div>

                <h1 className="text-2xl font-black leading-tight text-slate-900 md:text-3xl">
                    {article.title}
                </h1>

                {article.summary && (
                    <p className="mt-3 text-base leading-relaxed text-slate-500">
                        {article.summary}
                    </p>
                )}

                {/* Meta bar */}
                <div className="mt-5 flex flex-wrap items-center gap-4 border-y border-slate-100 py-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        {article.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(article.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {readingTime(article.content)} phút đọc
                    </span>
                    <button
                        onClick={handleShare}
                        className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Chia sẻ
                    </button>
                </div>
            </motion.div>

            {/* Article content */}
            <motion.article
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.4, delay: 0.2}}
                className="prose-novagear"
                dangerouslySetInnerHTML={{__html: renderMarkdown(article.content)}}
            />

            {/* Image Gallery */}
            {article.images && article.images.length > 0 && (
                <section className="mt-8 border-t border-slate-200 pt-8">
                    <h2 className="mb-5 text-lg font-bold text-slate-900">
                        Hình ảnh đính kèm
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {article.images.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((img) => (
                            <div key={img.id || img.imageUrl} className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                <a href={`/api/admin/articles${img.imageUrl}`} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={`/api/admin/articles${img.imageUrl}`}
                                        alt={img.caption || article.title}
                                        className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </a>
                                {img.caption && (
                                    <div className="p-3 text-center">
                                        <p className="text-xs text-slate-600 italic">{img.caption}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <section className="border-t border-slate-200 pt-8">
                    <h2 className="mb-5 text-lg font-bold text-slate-900">
                        Bài viết liên quan
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {relatedArticles.map((related, i) => (
                            <Link
                                key={related.id}
                                to={`/tech/${related.slug}`}
                                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                {related.cover_image_url ? (
                                    <img
                                        src={related.cover_image_url}
                                        alt={related.title}
                                        className="aspect-[16/9] w-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className={`flex aspect-[16/9] items-center justify-center bg-gradient-to-br ${
                                            COVER_GRADIENTS[i % COVER_GRADIENTS.length]
                                        }`}
                                    >
                                        <Newspaper className="h-8 w-8 text-white/40" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <p className="line-clamp-2 text-sm font-bold text-slate-900 transition group-hover:text-indigo-600">
                                        {related.title}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {formatDate(related.created_at)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Back link */}
            <div className="pb-8">
                <Link
                    to="/tech"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Tất cả bài viết
                </Link>
            </div>
        </div>
    )
}
