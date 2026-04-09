import { type FormEvent, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { getProducts, getPublicCategories, type PublicCategory } from "../api/productApi"
import type { Product } from "../types/product"
import ProductCard from "../components/product/ProductCard"

export default function ProductListPage() {
    const [items, setItems] = useState<Product[]>([])
    const [categories, setCategories] = useState<PublicCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()

    const keyword = (searchParams.get("keyword") || "").trim()
    const selectedCategoryId = searchParams.get("categoryId") || ""

    const [keywordInput, setKeywordInput] = useState(keyword)

    useEffect(() => {
        setKeywordInput(keyword)
    }, [keyword])

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)

                const [productData, categoryData] = await Promise.all([
                    getProducts({ keyword, categoryId: selectedCategoryId || undefined }),
                    getPublicCategories(),
                ])

                setItems(productData)
                setCategories(categoryData)
            } catch (error) {
                console.error(error)
                setItems([])
                setCategories([])
            } finally {
                setLoading(false)
            }
        }

        void loadData()
    }, [keyword, selectedCategoryId])

    const categoryNameMap = useMemo(() => {
        const map = new Map<string, string>()
        categories.forEach((category) => {
            map.set(String(category.id), category.name)
            map.set(category.name.toLowerCase(), category.name)
            if (category.slug) {
                map.set(category.slug.toLowerCase(), category.name)
            }
        })
        return map
    }, [categories])

    const filtered = useMemo(() => {
        const keywordLower = keyword.toLowerCase()
        const selectedCategoryName = categoryNameMap.get(selectedCategoryId)?.toLowerCase()

        return items.filter((p) => {
            const name = p.name?.toLowerCase() || ""
            const desc = p.description?.toLowerCase() || ""
            const category = p.category?.toLowerCase() || ""

            const matchedKeyword = !keywordLower || name.includes(keywordLower) || desc.includes(keywordLower)
            const matchedCategory = !selectedCategoryName || category.includes(selectedCategoryName)

            return matchedKeyword && matchedCategory
        })
    }, [categoryNameMap, items, keyword, selectedCategoryId])

    const updateFilter = (nextKeyword: string, nextCategoryId: string) => {
        const nextParams = new URLSearchParams(searchParams)

        if (nextKeyword.trim()) {
            nextParams.set("keyword", nextKeyword.trim())
        } else {
            nextParams.delete("keyword")
        }

        if (nextCategoryId) {
            nextParams.set("categoryId", nextCategoryId)
        } else {
            nextParams.delete("categoryId")
        }

        setSearchParams(nextParams)
    }

    const handleKeywordSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        updateFilter(keywordInput, selectedCategoryId)
    }

    return (
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Bo loc nhanh</h3>

                <form onSubmit={handleKeywordSubmit} className="mt-4 space-y-2">
                    <input
                        value={keywordInput}
                        onChange={(event) => setKeywordInput(event.target.value)}
                        placeholder="Tim ten san pham"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                    />
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                    >
                        Ap dung tim kiem
                    </button>
                </form>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <button
                        type="button"
                        onClick={() => updateFilter(keyword, "")}
                        className={`w-full rounded-xl border p-3 text-left font-medium transition ${
                            !selectedCategoryId
                                ? "border-brand-blue bg-blue-50 text-brand-blue"
                                : "border-slate-200 bg-slate-50 hover:border-brand-blue/40"
                        }`}
                    >
                        Tat ca danh muc
                    </button>

                    {categories.map((category) => {
                        const isActive = selectedCategoryId === String(category.id)
                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => updateFilter(keyword, String(category.id))}
                                className={`w-full rounded-xl border p-3 text-left font-medium transition ${
                                    isActive
                                        ? "border-brand-blue bg-blue-50 text-brand-blue"
                                        : "border-slate-200 bg-slate-50 hover:border-brand-blue/40"
                                }`}
                            >
                                {category.name}
                            </button>
                        )
                    })}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setKeywordInput("")
                        updateFilter("", "")
                    }}
                    className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                    Xoa bo loc
                </button>
            </aside>

            <section>
                <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h1 className="text-2xl font-black text-slate-900">Danh sach san pham</h1>
                    {keyword && (
                        <p className="mt-1 text-sm text-slate-500">
                            Kết quả tìm kiếm cho: <span className="font-semibold">{keyword}</span>
                        </p>
                    )}
                    {selectedCategoryId && (
                        <p className="mt-1 text-sm text-slate-500">
                            Danh muc: <span className="font-semibold">{categoryNameMap.get(selectedCategoryId) || "Da chon"}</span>
                        </p>
                    )}
                    <p className="mt-2 text-sm text-slate-500">Tim thay {filtered.length} san pham</p>
                </div>

                {loading ? (
                    <div className="rounded-xl bg-white px-4 py-8 text-center text-slate-500 shadow-sm">Dang tai...</div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {filtered.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}