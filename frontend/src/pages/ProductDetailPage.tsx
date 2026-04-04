import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getProductBySlug } from "../api/productApi"
import type { Product } from "../types/product"

export default function ProductDetailPage() {
    const { slug = "" } = useParams()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!slug) {
            setLoading(false)
            return
        }

        getProductBySlug(slug)
            .then(setProduct)
            .finally(() => setLoading(false))
    }, [slug])

    const handleAddToCart = () => {
        alert("Nối API cart ở đây")
    }

    if (loading) return <div>Đang tải...</div>
    if (!product) return <div>Không tìm thấy sản phẩm</div>

    const finalPrice = product.salePrice ?? product.price

    return (
        <div className="grid gap-6 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl bg-gray-100">
                <img
                    src={product.imageUrl || "https://via.placeholder.com/600x600?text=NovaGear"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                />
            </div>

            <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="mt-3 text-sm text-brand-gray">{product.description}</p>

                <div className="mt-6">
                    <p className="text-3xl font-extrabold text-brand-red">
                        {finalPrice.toLocaleString("vi-VN")}đ
                    </p>
                    {product.salePrice != null && (
                        <p className="mt-1 text-sm text-gray-400 line-through">
                            {product.price.toLocaleString("vi-VN")}đ
                        </p>
                    )}
                </div>

                <div className="mt-4 text-sm text-brand-gray">
                    Tồn kho: {product.stock ?? 0}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleAddToCart}
                        className="rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white"
                    >
                        Thêm vào giỏ
                    </button>

                    <button className="rounded-xl border border-brand-dark px-5 py-3 font-semibold text-brand-dark">
                        Mua ngay
                    </button>
                </div>

                <div className="mt-8 rounded-2xl bg-gray-50 p-4">
                    <h3 className="font-bold">Thông tin sản phẩm</h3>
                    <div className="mt-3 space-y-2 text-sm text-brand-gray">
                        <p>Danh mục: {product.category || "Đang cập nhật"}</p>
                        <p>Thương hiệu: {product.brand || "Đang cập nhật"}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}