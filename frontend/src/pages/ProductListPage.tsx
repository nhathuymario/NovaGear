import {useEffect, useMemo, useState} from "react"
import {Link, useSearchParams} from "react-router-dom"
import {motion} from "framer-motion"
import {ChevronRight, Filter, SlidersHorizontal, X} from "lucide-react"
import {getProducts, getPublicCategories} from "../api/productApi"
import type {Product, PublicCategory} from "../types/product"
import ProductCard from "../components/product/ProductCard"
import {ProductListSkeleton} from "../components/ui/Skeletons"

type SortOption = "default" | "price_asc" | "price_desc" | "name_asc"

const SORT_LABELS: Record<SortOption, string> = {
    default: "Mặc định",
    price_asc: "Giá thấp → cao",
    price_desc: "Giá cao → thấp",
    name_asc: "A → Z",
}

export default function ProductListPage() {
    const [items, setItems] = useState<Product[]>([])
    const [categories, setCategories] = useState<PublicCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortBy, setSortBy] = useState<SortOption>("default")
    const [showMobileFilter, setShowMobileFilter] = useState(false)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    const keyword = searchParams.get("keyword")?.toLowerCase() || ""
    const selectedCategorySlug = searchParams.get("category")?.toLowerCase() || ""

    const currentCategoryId = useMemo(() => {
        if (!selectedCategorySlug) return undefined
        return categories.find(c => c.slug?.toLowerCase() === selectedCategorySlug)?.id
    }, [categories, selectedCategorySlug])

    useEffect(() => {
        setLoading(true)
        Promise.all([
            getProducts(page, 12, currentCategoryId, keyword),
            getPublicCategories()
        ])
            .then(([pageData, categoryList]) => {
                setItems(pageData.content)
                setTotalPages(pageData.totalPages)
                setTotalElements(pageData.totalElements)
                setCategories(categoryList)
            })
            .finally(() => setLoading(false))
    }, [page, currentCategoryId, keyword])

    // Reset page when category or keyword changes
    useEffect(() => {
        setPage(0)
    }, [selectedCategorySlug, keyword])

    const handleCategoryClick = (slug?: string) => {
        const nextParams = new URLSearchParams(searchParams)
        if (!slug || selectedCategorySlug === slug.toLowerCase()) {
            nextParams.delete("category")
        } else {
            nextParams.set("category", slug)
        }
        setSearchParams(nextParams)
    }

    const filtered = useMemo(() => {
        let result = [...items]

        // Sort (Client side for current page)
        switch (sortBy) {
            case "price_asc":
                result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))
                break
            case "price_desc":
                result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price))
                break
            case "name_asc":
                result.sort((a, b) => a.name.localeCompare(b.name))
                break
        }

        return result
    }, [items, sortBy])

    const selectedCategoryName =
        categories.find((c) => c.slug?.toLowerCase() === selectedCategorySlug)?.name || ""

    const filterSidebar = (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <SlidersHorizontal className="h-4 w-4" />
                    Bộ lọc
                </h3>
                <button
                    onClick={() => setShowMobileFilter(false)}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-700 md:hidden"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Danh mục</p>
                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={() => handleCategoryClick()}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                            !selectedCategorySlug
                                ? "bg-brand-yellow/15 text-brand-dark font-semibold"
                                : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        Tất cả sản phẩm
                    </button>
                    {categories.map((category) => {
                        const isActive = selectedCategorySlug === category.slug?.toLowerCase()
                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => {
                                    handleCategoryClick(category.slug)
                                    setShowMobileFilter(false)
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                                    isActive
                                        ? "bg-brand-yellow/15 text-brand-dark font-semibold"
                                        : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                <span>{category.name}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                            </button>
                        )
                    })}
                </div>
            </div>

            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Khoảng giá</p>
                <div className="space-y-1">
                    {[
                        {label: "Dưới 5 triệu", max: 5000000},
                        {label: "5 - 10 triệu", min: 5000000, max: 10000000},
                        {label: "10 - 20 triệu", min: 10000000, max: 20000000},
                        {label: "Trên 20 triệu", min: 20000000},
                    ].map((range) => (
                        <button
                            key={range.label}
                            type="button"
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50"
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Link to="/" className="hover:text-brand-blue">Trang chủ</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-slate-700">
                    {selectedCategoryName || "Tất cả sản phẩm"}
                </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                {/* Desktop filter sidebar */}
                <motion.aside
                    initial={{opacity: 0, x: -10}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.25}}
                    className="hidden h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:block"
                >
                    {filterSidebar}
                </motion.aside>

                {/* Mobile filter overlay */}
                {showMobileFilter && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilter(false)} />
                        <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-5">
                            {filterSidebar}
                        </div>
                    </div>
                )}

                {/* Main content */}
                <section className="space-y-3">
                    {/* Header bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">
                                {selectedCategoryName || "Tất cả sản phẩm"}
                            </h1>
                            <p className="text-xs text-slate-500">
                                {keyword && (
                                    <span>Tìm: <strong>{keyword}</strong> · </span>
                                )}
                                {totalElements} sản phẩm
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Mobile filter button */}
                            <button
                                onClick={() => setShowMobileFilter(true)}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 lg:hidden"
                            >
                                <Filter className="h-3.5 w-3.5" />
                                Bộ lọc
                            </button>

                            {/* Sort dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none"
                            >
                                {Object.entries(SORT_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active filters */}
                    {(selectedCategorySlug || keyword) && (
                        <div className="flex flex-wrap items-center gap-2">
                            {selectedCategorySlug && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-semibold text-brand-dark">
                                    {selectedCategoryName || selectedCategorySlug}
                                    <button onClick={() => handleCategoryClick()} className="hover:text-brand-red">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {keyword && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                                    "{keyword}"
                                </span>
                            )}
                        </div>
                    )}

                    {/* Product grid */}
                    {loading ? (
                        <ProductListSkeleton />
                    ) : filtered.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                            <p className="text-lg font-bold text-slate-900">Không tìm thấy sản phẩm</p>
                            <p className="mt-2 text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                            <Link to="/products" className="mt-4 inline-flex rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
                                Xem tất cả
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {filtered.map((product) => (
                                    <ProductCard key={product.id} product={product}/>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 py-4">
                                    <button
                                        onClick={() => {
                                            setPage((p) => Math.max(0, p - 1))
                                            window.scrollTo({top: 0, behavior: "smooth"})
                                        }}
                                        disabled={page === 0 || loading}
                                        className="flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Trước
                                    </button>
                                    
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setPage(i)
                                                    window.scrollTo({top: 0, behavior: "smooth"})
                                                }}
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                                                    page === i
                                                        ? "bg-brand-blue text-white"
                                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setPage((p) => Math.min(totalPages - 1, p + 1))
                                            window.scrollTo({top: 0, behavior: "smooth"})
                                        }}
                                        disabled={page >= totalPages - 1 || loading}
                                        className="flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}