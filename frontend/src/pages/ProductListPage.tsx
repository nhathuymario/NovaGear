import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { getProducts } from "../api/productApi"
import type { Product } from "../types/product"
import ProductCard from "../components/product/ProductCard"

export default function ProductListPage() {
    const [items, setItems] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()

    const keyword = searchParams.get("keyword")?.toLowerCase() || ""

    useEffect(() => {
        getProducts()
            .then(setItems)
            .finally(() => setLoading(false))
    }, [])

    const filtered = useMemo(() => {
        if (!keyword) return items
        return items.filter((p) => {
            const name = p.name?.toLowerCase() || ""
            const desc = p.description?.toLowerCase() || ""
            return name.includes(keyword) || desc.includes(keyword)
        })
    }, [items, keyword])

    return (
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
            <aside className="h-fit rounded-2xl bg-white p-4 shadow-sm">
                <h3 className="text-lg font-bold">Bộ lọc</h3>
                <div className="mt-4 space-y-3 text-sm text-brand-gray">
                    <div className="rounded-xl bg-gray-50 p-3">Laptop</div>
                    <div className="rounded-xl bg-gray-50 p-3">PC</div>
                    <div className="rounded-xl bg-gray-50 p-3">Màn hình</div>
                    <div className="rounded-xl bg-gray-50 p-3">Phụ kiện</div>
                </div>
            </aside>

            <section>
                <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
                    <h1 className="text-2xl font-bold">Danh sách sản phẩm</h1>
                    {keyword && (
                        <p className="mt-1 text-sm text-brand-gray">
                            Kết quả tìm kiếm cho: <span className="font-semibold">{keyword}</span>
                        </p>
                    )}
                </div>

                {loading ? (
                    <div>Đang tải...</div>
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