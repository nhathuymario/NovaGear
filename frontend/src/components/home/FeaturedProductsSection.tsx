import {useMemo, useState} from "react"
import {Link} from "react-router-dom"
import {motion} from "framer-motion"
import {ArrowRight} from "lucide-react"
import type {Product} from "../../types/product"
import ProductCard from "../product/ProductCard"
import {ProductGridSkeleton} from "../ui/Skeletons"

type FeaturedProductsSectionProps = {
    products: Product[]
    loading: boolean
}

const PAGE_SIZE = 10

export default function FeaturedProductsSection({products, loading}: FeaturedProductsSectionProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [showPagination, setShowPagination] = useState(false)

    const featuredProducts = useMemo(() => {
        const featuredOnly = products.filter((item) => item.featured)
        return featuredOnly.length > 0 ? featuredOnly : products
    }, [products])

    const totalPages = Math.max(1, Math.ceil(featuredProducts.length / PAGE_SIZE))

    const visibleFeaturedProducts = useMemo(() => {
        if (!showPagination) return featuredProducts.slice(0, PAGE_SIZE)
        const safePage = Math.min(Math.max(currentPage, 1), totalPages)
        const start = (safePage - 1) * PAGE_SIZE
        return featuredProducts.slice(start, start + PAGE_SIZE)
    }, [currentPage, featuredProducts, showPagination, totalPages])

    const goToPage = (page: number) => {
        setShowPagination(true)
        setCurrentPage(Math.min(Math.max(page, 1), totalPages))
    }

    return (
        <motion.section
            initial={{opacity: 0, y: 16}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.3}}
            className="rounded-xl border border-slate-200 bg-white p-4"
        >
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Sản phẩm nổi bật</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Được yêu thích nhất tại NovaGear</p>
                </div>
                <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-brand-blue transition hover:text-brand-blue/80">
                    Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {loading ? (
                <ProductGridSkeleton count={10} />
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {visibleFeaturedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {!showPagination && featuredProducts.length > PAGE_SIZE && (
                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPagination(true)
                                    setCurrentPage(2)
                                }}
                                className="inline-flex items-center gap-2 rounded-lg border border-brand-blue px-5 py-2.5 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue hover:text-white"
                            >
                                Xem thêm sản phẩm
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {showPagination && totalPages > 1 && (
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
                            >
                                Trước
                            </button>
                            {Array.from({length: totalPages}).map((_, i) => {
                                const page = i + 1
                                const active = page === currentPage
                                return (
                                    <button
                                        type="button"
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                            active ? "bg-brand-blue text-white" : "border border-slate-200 text-slate-700 hover:border-brand-blue"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            })}
                            <button
                                type="button"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            )}
        </motion.section>
    )
}
