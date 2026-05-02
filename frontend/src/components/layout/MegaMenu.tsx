import {useState, useEffect, useRef} from "react"
import {Link} from "react-router-dom"
import {ChevronRight} from "lucide-react"
import {getPublicCategories} from "../../api/productApi"
import type {PublicCategory} from "../../types/product"

interface MegaMenuProps {
    readonly isOpen: boolean
    readonly onClose: () => void
}

const CATEGORY_ICONS: Record<string, string> = {
    "laptop": "💻",
    "pc": "🖥️",
    "man-hinh": "🖥️",
    "ban-phim": "⌨️",
    "tai-nghe": "🎧",
    "chuot": "🖱️",
    "loa": "🔊",
    "phu-kien": "🔌",
    "dien-thoai": "📱",
    "tablet": "📱",
    "camera": "📷",
    "smartwatch": "⌚",
}

function getCategoryIcon(slug: string): string {
    const key = Object.keys(CATEGORY_ICONS).find(k => slug.toLowerCase().includes(k))
    return key ? CATEGORY_ICONS[key] : "📦"
}

export default function MegaMenu({isOpen, onClose}: MegaMenuProps) {
    const [categories, setCategories] = useState<PublicCategory[]>([])
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        getPublicCategories()
            .then(setCategories)
            .catch(() => setCategories([]))
    }, [])

    useEffect(() => {
        if (!isOpen) {
            setActiveCategory(null)
            return
        }

        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            ref={menuRef}
            className="mega-menu-enter absolute left-0 top-full z-50 w-full border-t border-slate-200 bg-white shadow-xl"
        >
            <div className="mx-auto max-w-[1320px] px-4">
                <div className="grid grid-cols-[260px_1fr] gap-0">
                    {/* Category sidebar */}
                    <div className="border-r border-slate-100 py-3 pr-3">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/products?category=${encodeURIComponent(cat.slug)}`}
                                onClick={onClose}
                                onMouseEnter={() => setActiveCategory(cat.slug)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                    activeCategory === cat.slug
                                        ? "bg-brand-yellow/10 text-brand-dark"
                                        : "text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                <span className="text-base">{getCategoryIcon(cat.slug)}</span>
                                <span className="flex-1">{cat.name}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            </Link>
                        ))}
                    </div>

                    {/* Right content panel */}
                    <div className="p-5">
                        {activeCategory ? (
                            <div className="animate-fade-in-up">
                                <h3 className="mb-4 text-lg font-bold text-slate-900">
                                    {categories.find(c => c.slug === activeCategory)?.name || "Danh mục"}
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <Link
                                        to={`/products?category=${encodeURIComponent(activeCategory)}`}
                                        onClick={onClose}
                                        className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-slate-700 transition hover:border-brand-yellow hover:bg-brand-yellow/5"
                                    >
                                        Xem tất cả sản phẩm
                                    </Link>
                                    <Link
                                        to={`/products?category=${encodeURIComponent(activeCategory)}&sort=price_asc`}
                                        onClick={onClose}
                                        className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-slate-700 transition hover:border-brand-blue hover:bg-brand-blue/5"
                                    >
                                        Giá thấp đến cao
                                    </Link>
                                    <Link
                                        to={`/products?category=${encodeURIComponent(activeCategory)}&featured=true`}
                                        onClick={onClose}
                                        className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-slate-700 transition hover:border-brand-orange hover:bg-brand-orange/5"
                                    >
                                        Nổi bật
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-slate-400">Di chuột vào danh mục để xem chi tiết</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
