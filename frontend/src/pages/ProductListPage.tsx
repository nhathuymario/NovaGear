import {useEffect, useMemo, useState} from "react"
import {useSearchParams} from "react-router-dom"
import {motion} from "framer-motion"
import {getProducts, getPublicCategories} from "../api/productApi"
import type {Product, PublicCategory} from "../types/product"
import ProductCard from "../components/product/ProductCard"
import {ProductListSkeleton} from "../components/ui/Skeletons"

export default function ProductListPage() {
    const [items, setItems] = useState<Product[]>([])
    const [categories, setCategories] = useState<PublicCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()

    const keyword = searchParams.get("keyword")?.toLowerCase() || ""
    const selectedCategorySlug = searchParams.get("category")?.toLowerCase() || ""

    useEffect(() => {
        Promise.all([getProducts(), getPublicCategories()])
            .then(([products, categoryList]) => {
                setItems(products)
                setCategories(categoryList)
            })
            .finally(() => setLoading(false))
    }, [])

    const handleCategoryClick = (slug?: string) => {
        const nextParams = new URLSearchParams(searchParams)

        if (!slug) {
            nextParams.delete("category")
        } else if (selectedCategorySlug === slug.toLowerCase()) {
            nextParams.delete("category")
        } else {
            nextParams.set("category", slug)
        }

        setSearchParams(nextParams)
    }

    const filtered = useMemo(() => {
        return items.filter((p) => {
            const name = p.name?.toLowerCase() || ""
            const desc = p.description?.toLowerCase() || ""
            const categorySlug = p.categorySlug?.toLowerCase() || ""

            const matchKeyword =
                !keyword || name.includes(keyword) || desc.includes(keyword)

            const matchCategory =
                !selectedCategorySlug || categorySlug === selectedCategorySlug

            return matchKeyword && matchCategory
        })
    }, [items, keyword, selectedCategorySlug])

    const selectedCategoryName =
        categories.find((c) => c.slug?.toLowerCase() === selectedCategorySlug)?.name || ""

    return (
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            <motion.aside
                initial={{opacity: 0, x: -14}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.28}}
                className="h-fit rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
            >
                <h3 className="text-lg font-bold text-slate-900">Bộ lọc nhanh</h3>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <button
                        type="button"
                        onClick={() => handleCategoryClick()}
                        className={`w-full rounded-xl border p-3 text-left font-medium transition ${
                            !selectedCategorySlug
                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        }`}
                    >
                        Tất cả
                    </button>

                    {categories.map((category) => {
                        const isActive =
                            selectedCategorySlug === category.slug?.toLowerCase()

                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategoryClick(category.slug)}
                                className={`w-full rounded-xl border p-3 text-left font-medium transition ${
                                    isActive
                                        ? "border-blue-500 bg-blue-50 text-blue-600"
                                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                                }`}
                            >
                                {category.name}
                            </button>
                        )
                    })}
                </div>
            </motion.aside>

            <section>
                <div className="mb-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                    <h1 className="text-2xl font-black text-slate-900">Danh sách sản phẩm</h1>

                    {keyword && (
                        <p className="mt-1 text-sm text-slate-500">
                            Kết quả tìm kiếm cho: <span className="font-semibold">{keyword}</span>
                        </p>
                    )}

                    {selectedCategorySlug && (
                        <p className="mt-1 text-sm text-slate-500">
                            Bộ lọc danh mục:{" "}
                            <span className="font-semibold">
                                {selectedCategoryName || selectedCategorySlug}
                            </span>
                        </p>
                    )}

                    <p className="mt-2 text-sm text-slate-500">
                        Tìm thấy {filtered.length} sản phẩm
                    </p>
                </div>

                {loading ? (
                    <ProductListSkeleton />
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {filtered.map((product) => (
                            <ProductCard key={product.id} product={product}/>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}