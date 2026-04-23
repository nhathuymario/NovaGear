import {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import {motion} from "framer-motion"
import {getProducts} from "../api/productApi"
import type {Product} from "../types/product"
import {getSiteContent} from "../utils/siteContent"
import TechShowcase3D from "../components/ui/TechShowcase3D"
import FeaturedProductsSection from "../components/home/FeaturedProductsSection"

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const homeFlashSaleText = getSiteContent("homeFlashSaleText")

    useEffect(() => {
        getProducts()
            .then(setProducts)
            .finally(() => setLoading(false))
    }, [])

    const categories = [
        {name: "Laptop", slug: "laptop", accent: "from-sky-50 to-blue-100"},
        {name: "PC", slug: "pc", accent: "from-slate-50 to-slate-100"},
        {name: "Màn hình", slug: "man-hinh", accent: "from-emerald-50 to-teal-100"},
        {name: "Bàn phím", slug: "ban-phim", accent: "from-violet-50 to-fuchsia-100"},
        {name: "Tai nghe", slug: "tai-nghe", accent: "from-amber-50 to-orange-100"},
    ]

    const stats = [
        ["1000+", "Sản phẩm"],
        ["2h", "Giao nhanh"],
        ["100%", "Chính hãng"],
        ["24/7", "Hỗ trợ"],
    ]

    return (
        <div className="space-y-8 md:space-y-10">
            <motion.section
                initial={{opacity: 0, y: 28}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.45, ease: "easeOut"}}
                className="overflow-hidden rounded-[32px] border border-slate-900/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-2xl md:p-8"
            >
                <div className="grid items-center gap-8 md:grid-cols-[1.15fr_0.85fr]">
                    <div className="max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/80 backdrop-blur">
                            NovaGear Premium Store
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black leading-tight md:text-6xl">
                                Công nghệ xịn, trải nghiệm mượt, mua sắm cực đã
                            </h1>
                            <p className="max-w-xl text-sm leading-7 text-slate-200 md:text-base">
                                Tăng cảm giác cao cấp với chuyển động mượt, hiệu ứng tinh tế, preview hình ảnh sản
                                phẩm và các trạng thái tải được chăm chút để FE của NovaGear nhìn hiện đại hơn ngay từ
                                ấn tượng đầu.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/products"
                                className="inline-flex items-center justify-center rounded-2xl bg-brand-yellow px-6 py-3.5 text-sm font-bold text-brand-dark transition hover:-translate-y-0.5 hover:brightness-95"
                            >
                                Khám phá ngay
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                            {stats.map(([value, label]) => (
                                <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                                    <p className="text-2xl font-black text-brand-yellow">{value}</p>
                                    <p className="text-xs text-slate-200/80">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <TechShowcase3D />
                </div>
            </motion.section>

            <motion.section
                initial={{opacity: 0, y: 18}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true, amount: 0.25}}
                transition={{duration: 0.35}}
                className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm md:p-5"
            >
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Danh mục nổi bật</h2>
                        <p className="mt-1 text-sm text-slate-500">Đi nhanh tới nhóm sản phẩm phổ biến nhất.</p>
                    </div>
                    <Link to="/products" className="text-sm font-semibold text-brand-blue transition hover:opacity-80">
                        Xem tất cả
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {categories.map((item) => (
                        <Link
                            key={item.slug}
                            to={`/products?category=${encodeURIComponent(item.slug)}`}
                            className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${item.accent} px-4 py-4 text-center text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:shadow-lg`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </motion.section>

            <motion.section
                initial={{opacity: 0, y: 18}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true, amount: 0.25}}
                transition={{duration: 0.35, delay: 0.05}}
                className="rounded-[28px] border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-white p-4 md:p-5"
            >
                <div className="flex items-start gap-3">
                    <div className="mt-1 h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_0_6px_rgba(245,158,11,0.18)]" />
                    <div>
                        <p className="text-sm font-semibold text-amber-900">{homeFlashSaleText}</p>
                        <p className="mt-1 text-xs text-amber-800/80">
                            Hiển thị trạng thái khuyến mãi nổi bật theo nội dung hệ thống.
                        </p>
                    </div>
                </div>
            </motion.section>

            <FeaturedProductsSection products={products} loading={loading} />
        </div>
    )
}