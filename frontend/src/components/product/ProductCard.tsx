import {Link} from "react-router-dom"
import type {Product} from "../../types/product"
import {getFallbackImageSrc, handleImageError} from "../../utils/image"
import {Star} from "lucide-react"

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
        <article className="product-card-hover group relative overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Link to={`/products/${product.slug}`} className="block">
                {/* Discount badge */}
                {percentOff > 0 && (
                    <span className="absolute right-2 top-2 z-10 rounded-md bg-brand-red px-2 py-0.5 text-xs font-bold text-white">
                        -{percentOff}%
                    </span>
                )}

                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-slate-50 p-4">
                    <img
                        src={product.imageUrl || getFallbackImageSrc("NovaGear")}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
                        className="h-full w-full object-contain transition duration-400 group-hover:scale-105"
                        data-fallback={getFallbackImageSrc("NovaGear")}
                        onError={handleImageError}
                    />
                </div>

                {/* Content */}
                <div className="p-3">
                    <h3 className="line-clamp-2 min-h-[40px] text-sm font-medium text-slate-800 transition group-hover:text-brand-blue">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="mt-2">
                        <p className="text-lg font-extrabold text-brand-red">
                            {finalPrice.toLocaleString("vi-VN")}₫
                        </p>
                        {product.salePrice != null && (
                            <p className="text-xs text-slate-400 line-through">
                                {product.price.toLocaleString("vi-VN")}₫
                            </p>
                        )}
                    </div>

                    {/* Rating & stock */}
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-3 w-3 fill-brand-yellow text-brand-yellow" />
                            ))}
                        </div>
                        <span
                            className={`text-[10px] font-semibold ${
                                (product.stock ?? 0) > 0 ? "text-brand-green" : "text-slate-400"
                            }`}
                        >
                            {(product.stock ?? 0) > 0 ? "Còn hàng" : "Hết hàng"}
                        </span>
                    </div>

                    {/* Installment tag */}
                    {finalPrice >= 3000000 && (
                        <div className="mt-2 rounded-md bg-brand-blue/5 px-2 py-1 text-center text-[10px] font-semibold text-brand-blue">
                            Trả góp 0%
                        </div>
                    )}
                </div>
            </Link>
        </article>
    )
}