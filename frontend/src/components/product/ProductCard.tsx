import { Link } from "react-router-dom"
import type { Product } from "../../types/product"

interface Props {
    product: Product
}

export default function ProductCard({ product }: Props) {
    const finalPrice = product.salePrice ?? product.price
    const percentOff =
        product.salePrice != null && product.price > 0
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0

    return (
        <div className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <Link to={`/products/${product.slug}`}>
                <div className="relative aspect-square bg-slate-100">
                    <img
                        src={product.imageUrl || "https://via.placeholder.com/400x400?text=NovaGear"}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    {percentOff > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
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
                        {(product.stock ?? 0) > 0 ? "Con hang" : "Het hang"}
                    </span>

                    <Link
                        to={`/products/${product.slug}`}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                    >
                        Xem chi tiet
                    </Link>
                </div>
            </div>
        </div>
    )
}