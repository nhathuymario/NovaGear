import {useMemo, useState} from "react"
import {Link} from "react-router-dom"
import {motion} from "framer-motion"
import type {Product} from "../../types/product"
import ProductCard from "../product/ProductCard"
import {ProductGridSkeleton} from "../ui/Skeletons"

type FeaturedProductsSectionProps = {
    products: Product[]
    loading: boolean
}

const PAGE_SIZE = 12

export default function FeaturedProductsSection({products, loading}: FeaturedProductsSectionProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [showPagination, setShowPagination] = useState(false)

    const featuredProducts = useMemo(() => {
        const featuredOnly = products.filter((item) => item.featured)
        return featuredOnly.length > 0 ? featuredOnly : products
    }, [products])

    const totalPages = Math.max(1, Math.ceil(featuredProducts.length / PAGE_SIZE))

    const visibleFeaturedProducts = useMemo(() => {
        if (!showPagination) {
            return featuredProducts.slice(0, PAGE_SIZE)
        }

        const safePage = Math.min(Math.max(currentPage, 1), totalPages)
        const start = (safePage - 1) * PAGE_SIZE
        return featuredProducts.slice(start, start + PAGE_SIZE)
    }, [currentPage, featuredProducts, showPagination, totalPages])

    const handleViewMoreFeatured = () => {
        setShowPagination(true)
        setCurrentPage(2)
    }

    const goToPage = (page: number) => {
        setShowPagination(true)
        setCurrentPage(Math.min(Math.max(page, 1), totalPages))
    }

    return (
        <motion.section
            initial={{opacity: 0, y: 18}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.35}}
            className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm md:p-5"
        >
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Sản phẩm nổi bật</h2>
                    <p className="mt-1 text-sm text-slate-500">Micro-interactions, đổ bóng mềm và hover nâng card.</p>
                </div>
                <Link to="/products" className="text-sm font-semibold text-brand-blue transition hover:opacity-80">
                    Xem tất cả
                </Link>
            </div>

            {loading ? (
                <ProductGridSkeleton count={12} />
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {visibleFeaturedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {!showPagination && featuredProducts.length > PAGE_SIZE && (
                        <div className="mt-5 flex justify-center">
                            <button
                                type="button"
                                onClick={handleViewMoreFeatured}
                                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                            >
                                Xem thêm 12 sản phẩm
                            </button>
                        </div>
                    )}

                    {showPagination && totalPages > 1 && (
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
                            >
                                Trước
                            </button>

                            {Array.from({length: totalPages}).map((_, index) => {
                                const page = index + 1
                                const active = page === currentPage
                                return (
                                    <button
                                        type="button"
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                            active
                                                ? "bg-slate-900 text-white"
                                                : "border border-slate-300 text-slate-700 hover:border-slate-900"
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
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
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


