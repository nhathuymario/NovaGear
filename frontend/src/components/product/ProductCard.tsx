import {motion} from "framer-motion"
import {Link} from "react-router-dom"
import type {Product} from "../../types/product"
import {getFallbackImageSrc, handleImageError} from "../../utils/image"

interface Props {
    readonly product: Product
}

export default function ProductCard({product}: Readonly<Props>) {
    const finalPrice = product.salePrice ?? product.price
    const percentOff =
        product.salePrice != null && product.price > 0
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0

    return (
        <motion.article
            initial={{opacity: 0, y: 18}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.28, ease: "easeOut"}}
            whileHover={{y: -6}}
            whileTap={{scale: 0.985}}
            className="group overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-2xl"
        >
            <Link to={`/products/${product.slug}`}>
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                    <img
                        src={product.imageUrl || getFallbackImageSrc("NovaGear")}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        data-fallback={getFallbackImageSrc("NovaGear")}
                        onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {percentOff > 0 && (
                        <span
                            className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-red-500/20">
                            -{percentOff}%
                        </span>
                    )}
                </div>
            </Link>

            <div className="p-4">
                <Link to={`/products/${product.slug}`}>
                    <h3 className="line-clamp-2 min-h-[48px] text-sm font-semibold text-slate-800 transition group-hover:text-brand-blue">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-3">
                    <p className="text-xl font-extrabold text-brand-red">
                        {finalPrice.toLocaleString("vi-VN")}đ
                    </p>

                    {product.salePrice != null && (
                        <p className="text-sm text-slate-400 line-through">
                            {product.price.toLocaleString("vi-VN")}đ
                        </p>
                    )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${(product.stock ?? 0) > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                        {(product.stock ?? 0) > 0 ? "Còn hàng" : "Hết hàng"}
                    </span>
                    <Link
                        to={`/products/${product.slug}`}
                        className="rounded-xl bg-brand-yellow px-3 py-2 text-xs font-bold text-brand-dark transition hover:-translate-y-0.5 hover:brightness-95"
                    >
                        Xem chi tiết
                    </Link>
                </div>
            </div>
        </motion.article>
    )
}