import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getProducts } from "../api/productApi"
import type { Product } from "../types/product"
import ProductCard from "../components/product/ProductCard"

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getProducts()
            .then(setProducts)
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-300 to-yellow-100 p-8">
                <div className="max-w-2xl">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-dark">
                        NovaGear Store
                    </p>
                    <h1 className="text-3xl font-extrabold text-brand-dark md:text-5xl">
                        Công nghệ hiện đại, mua sắm dễ hơn
                    </h1>
                    <p className="mt-3 text-sm text-gray-700 md:text-base">
                        Giao diện lấy cảm hứng từ Thegioididong nhưng tinh gọn hơn, tập trung vào trải nghiệm mua hàng.
                    </p>
                    <Link
                        to="/products"
                        className="mt-5 inline-block rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white"
                    >
                        Mua ngay
                    </Link>
                </div>
            </section>

            <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {["Laptop", "PC", "Màn hình", "Bàn phím", "Tai nghe"].map((item) => (
                    <div
                        key={item}
                        className="rounded-2xl bg-white p-4 text-center font-semibold shadow-sm"
                    >
                        {item}
                    </div>
                ))}
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
                    <Link to="/products" className="text-sm font-semibold text-blue-600">
                        Xem tất cả
                    </Link>
                </div>

                {loading ? (
                    <div>Đang tải sản phẩm...</div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {products.slice(0, 8).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}