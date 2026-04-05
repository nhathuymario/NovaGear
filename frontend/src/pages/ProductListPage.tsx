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
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Bo loc nhanh</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                    {["Laptop", "PC", "Man hinh", "Phu kien"].map((label) => (
                        <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium">
                            {label}
                        </div>
                    ))}
                </div>
            </aside>

            <section>
                <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h1 className="text-2xl font-black text-slate-900">Danh sach san pham</h1>
                    {keyword && (
                        <p className="mt-1 text-sm text-slate-500">
                            Kết quả tìm kiếm cho: <span className="font-semibold">{keyword}</span>
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