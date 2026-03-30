import { Link } from "react-router-dom"
import type { Product } from "../../types/product"

interface Props {
    product: Product
}

export default function ProductCard({ product }: Props) {
    const finalPrice = product.salePrice ?? product.price

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Link to={`/products/${product.id}`}>
                <div className="aspect-square bg-gray-100">
                    <img
                        src={product.imageUrl || "https://via.placeholder.com/400x400?text=NovaGear"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                </div>
            </Link>

            <div className="p-4">
                <Link to={`/products/${product.id}`}>
                    <h3 className="line-clamp-2 min-h-[48px] text-sm font-semibold text-brand-dark">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-3">
                    <p className="text-lg font-bold text-brand-red">
                        {finalPrice.toLocaleString("vi-VN")}đ
                    </p>

                    {product.salePrice && (
                        <p className="text-sm text-gray-400 line-through">
                            {product.price.toLocaleString("vi-VN")}đ
                        </p>
                    )}
                </div>

                <div className="mt-3 flex items-center justify-between">
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            {product.stock && product.stock > 0 ? "Còn hàng" : "Hết hàng"}
          </span>

                    <Link
                        to={`/products/${product.id}`}
                        className="rounded-lg bg-brand-dark px-3 py-2 text-xs font-semibold text-white"
                    >
                        Xem chi tiết
                    </Link>
                </div>
            </div>
        </div>
    )
}