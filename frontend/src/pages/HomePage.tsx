import {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import {getProducts} from "../api/productApi"
import type {Product} from "../types/product"
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
        <div className="space-y-6 md:space-y-8">
            <section
                className="overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-7 text-white shadow-xl md:p-10">
                <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
                    <div className="max-w-2xl">
                        <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                            NovaGear Premium Store
                        </p>
                        <h1 className="text-3xl font-black leading-tight md:text-5xl">
                            Công nghệ xịn, giá tốt, giao nhanh
                        </h1>
                        <p className="mt-4 text-sm text-slate-200 md:text-base">
                            Phong các hiện đại và tối giản, tối ưu cho mua sắm online dễ dàng hơn, rõ ràng hơn và an tâm
                            hơn.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                to="/products"
                                className="rounded-xl bg-brand-yellow px-5 py-3 text-sm font-bold text-brand-dark transition hover:brightness-95"
                            >
                                Mua ngay
                            </Link>
                            <Link
                                to="/products?keyword=laptop"
                                className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Xem laptop
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            ["1000+", "Sản phẩm"],
                            ["2h", "Giao nhanh"],
                            ["100%", "Hàng chính hãng"],
                            ["24/7", "Hỗ trợ"],
                        ].map(([value, label]) => (
                            <div key={label}
                                 className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                                <p className="text-2xl font-black">{value}</p>
                                <p className="text-xs text-slate-200">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Danh mục nổi bật</h2>
                    <Link to="/products" className="text-sm font-semibold text-brand-blue">
                        Xem thêm
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {[
                        {name: "Laptop", slug: "laptop"},
                        {name: "PC", slug: "pc"},
                        {name: "Màn hình", slug: "man-hinh"},
                        {name: "Bàn phím", slug: "ban-phim"},
                        {name: "Tai nghe", slug: "tai-nghe"},
                    ].map((item) => (
                        <Link
                            key={item.slug}
                            to={`/products?category=${encodeURIComponent(item.slug)}`}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-brand-blue hover:bg-blue-50 hover:text-brand-blue"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </section>

            <section
                className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 md:p-5">
                <p className="text-sm font-semibold text-amber-800">
                    Flash dead cuối tuần - Giảm đến 20% cho nhiều dòng laptop và phụ kiện.
                </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-900">Sản phẩm nổi bật</h2>
                    <Link to="/products" className="text-sm font-semibold text-brand-blue">
                        Xem tất cả
                    </Link>
                </div>

                {loading ? (
                    <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-slate-500">Đang tải sản
                        phẩm...</div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {products.slice(0, 8).map((product) => (
                            <ProductCard key={product.id} product={product}/>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}