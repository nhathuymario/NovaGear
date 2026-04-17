import {useEffect, useMemo, useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import {addToCart} from "../api/cartApi"
import {getPublicInventoryByVariant, type InventoryItem,} from "../api/inventoryApi"
import {getProductDetailBySlug, type ProductDetailData, type PublicProductVariant,} from "../api/productApi"
import {getToken} from "../utils/auth"
import {getFallbackImageSrc, handleImageError} from "../utils/image"

function formatCurrency(value: number) {
    return value.toLocaleString("vi-VN") + "đ"
}

function buildVariantLabel(variant: PublicProductVariant) {
    return [variant.color, variant.ram, variant.storage, variant.versionName]
        .filter(Boolean)
        .join(" / ")
}

export default function ProductDetailPage() {
    const {slug = ""} = useParams()
    const navigate = useNavigate()

    const [product, setProduct] = useState<ProductDetailData | null>(null)
    const [selectedVariantId, setSelectedVariantId] = useState<number | string | null>(null)
    const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    const [loading, setLoading] = useState(true)
    const [inventoryLoading, setInventoryLoading] = useState(false)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        if (!slug) {
            setLoading(false)
            return
        }

        const loadProduct = async () => {
            try {
                setLoading(true)

                const detail = await getProductDetailBySlug(slug)
                setProduct(detail)

                if (detail.variants.length > 0) {
                    setSelectedVariantId(detail.variants[0].id)
                } else {
                    setSelectedVariantId(null)
                    setSelectedInventory(null)
                }
            } catch (error) {
                console.error(error)
                setProduct(null)
                setSelectedVariantId(null)
                setSelectedInventory(null)
            } finally {
                setLoading(false)
            }
        }

        loadProduct()
    }, [slug])

    const selectedVariant = useMemo(() => {
        if (!product || product.variants.length === 0) return null

        return (
            product.variants.find(
                (variant) => String(variant.id) === String(selectedVariantId)
            ) ?? product.variants[0]
        )
    }, [product, selectedVariantId])

    useEffect(() => {
        if (!selectedVariant?.id) {
            setSelectedInventory(null)
            return
        }

        const loadInventory = async () => {
            try {
                setInventoryLoading(true)
                const inventory = await getPublicInventoryByVariant(selectedVariant.id)
                setSelectedInventory(inventory)
            } catch (error) {
                console.error(error)
                setSelectedInventory(null)
            } finally {
                setInventoryLoading(false)
            }
        }

        loadInventory()
    }, [selectedVariant?.id])

    const galleryImages = useMemo(() => {
        const candidates = [
            selectedVariant?.imageUrl,
            product?.thumbnail,
            ...(product?.images ?? []).map((img) => img.imageUrl),
        ]

        const normalized = candidates
            .map((item) => String(item ?? "").trim())
            .filter(Boolean)

        const unique = Array.from(new Set(normalized))
        return unique.length > 0 ? unique : [getFallbackImageSrc("NovaGear")]
    }, [product, selectedVariant])

    const galleryImage = galleryImages[selectedImageIndex] ?? galleryImages[0]

    useEffect(() => {
        setSelectedImageIndex(0)
    }, [selectedVariant?.id, product?.id])

    const handlePrevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
    }

    const handleNextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length)
    }

    const finalPrice = selectedVariant
        ? selectedVariant.salePrice ?? selectedVariant.price
        : 0

    const originalPrice = selectedVariant?.price ?? 0

    const availableStock =
        selectedInventory?.availableQuantity ??
        selectedVariant?.stockQuantity ??
        0

    // const reservedStock = selectedInventory?.reservedQuantity ?? 0
    const totalStock =
        selectedInventory?.stockQuantity ??
        selectedVariant?.stockQuantity ??
        0

    const handleAddToCart = async () => {
        if (!product) return

        if (!getToken()) {
            navigate("/login", {state: {from: `/products/${slug}`}})
            return
        }

        if (product.variants.length > 0 && !selectedVariant) {
            alert("Vui lòng chọn phiên bản")
            return
        }

        if (availableStock <= 0) {
            alert("Phiên bản này hiện đang hết hàng")
            return
        }

        try {
            setAdding(true)
            await addToCart({
                productId: product.id,
                variantId: selectedVariant?.id,
                quantity: 1,
                productName: product.name,
                variantName: selectedVariant ? buildVariantLabel(selectedVariant) : undefined,
                thumbnail: galleryImage,
                price: finalPrice,
            })
            alert("Đã thêm vào giỏ hàng")
        } catch (error) {
            console.error(error)
            alert("Thêm vào giỏ thất bại")
        } finally {
            setAdding(false)
        }
    }

    const handleBuyNow = async () => {
        if (!product) return

        if (!getToken()) {
            navigate("/login", {state: {from: `/products/${slug}`}})
            return
        }

        if (product.variants.length > 0 && !selectedVariant) {
            alert("Vui lòng chọn phiên bản")
            return
        }

        if (availableStock <= 0) {
            alert("Phiên bản này hiện đang hết hàng")
            return
        }

        try {
            setAdding(true)
            await addToCart({
                productId: product.id,
                variantId: selectedVariant?.id,
                quantity: 1,
                productName: product.name,
                variantName: selectedVariant ? buildVariantLabel(selectedVariant) : undefined,
                thumbnail: galleryImage,
                price: finalPrice,
            })
            navigate("/cart")
        } catch (error) {
            console.error(error)
            alert("Không thể thêm vào giỏ hàng")
        } finally {
            setAdding(false)
        }
    }

    if (loading) return <div>Đang tải...</div>
    if (!product) return <div>Không tìm thấy sản phẩm</div>

    return (
        <div className="grid gap-6 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2">
            <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl bg-gray-100">
                    <div className="relative">
                        <img
                            src={galleryImage}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            data-fallback={getFallbackImageSrc("NovaGear")}
                            onError={handleImageError}
                        />

                        {galleryImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-sm font-bold text-slate-700 shadow"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-sm font-bold text-slate-700 shadow"
                                >
                                    ›
                                </button>
                                <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                                    {selectedImageIndex + 1}/{galleryImages.length}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {galleryImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                        {galleryImages.slice(0, 8).map((imageUrl, index) => (
                            <div
                                key={`${imageUrl}-${index}`}
                                className={`overflow-hidden rounded-xl border bg-gray-50 ${
                                    index === selectedImageIndex ? "border-brand-dark" : "border-transparent"
                                }`}
                            >
                                <button type="button" onClick={() => setSelectedImageIndex(index)} className="w-full">
                                    <img
                                        src={imageUrl || getFallbackImageSrc("NovaGear")}
                                        alt={`${product.name}-${index}`}
                                        className="h-24 w-full object-cover"
                                        data-fallback={getFallbackImageSrc("NovaGear")}
                                        onError={handleImageError}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="mt-3 text-sm text-brand-gray">
                    {product.shortDescription || product.description}
                </p>

                <div className="mt-6">
                    <p className="text-3xl font-extrabold text-brand-red">
                        {formatCurrency(finalPrice)}
                    </p>

                    {selectedVariant?.salePrice != null && (
                        <p className="mt-1 text-sm text-gray-400 line-through">
                            {formatCurrency(originalPrice)}
                        </p>
                    )}
                </div>

                {product.variants.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-bold">Phiên bản</h3>

                        <div className="mt-3 grid gap-3">
                            {product.variants.map((variant) => {
                                const label =
                                    buildVariantLabel(variant) ||
                                    variant.sku ||
                                    `Variant #${variant.id}`

                                const isSelected =
                                    String(variant.id) === String(selectedVariant?.id)

                                return (
                                    <button
                                        key={variant.id}
                                        type="button"
                                        onClick={() => setSelectedVariantId(variant.id)}
                                        className={`rounded-2xl border p-4 text-left transition ${
                                            isSelected
                                                ? "border-brand-dark bg-gray-50"
                                                : "border-gray-200 hover:border-gray-400"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold">{label}</p>
                                                {variant.sku && (
                                                    <p className="mt-1 text-xs text-brand-gray">
                                                        SKU: {variant.sku}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <p className="font-bold text-brand-red">
                                                    {formatCurrency(
                                                        variant.salePrice ?? variant.price
                                                    )}
                                                </p>
                                                {variant.salePrice != null && (
                                                    <p className="text-xs text-gray-400 line-through">
                                                        {formatCurrency(variant.price)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                    <h3 className="font-bold">Tình trạng kho</h3>

                    {inventoryLoading ? (
                        <p className="mt-3 text-sm text-brand-gray">Đang tải tồn kho...</p>
                    ) : (
                        <>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                <div>
                                    <p className="text-sm text-brand-gray">Tổng tồn</p>
                                    <p className="mt-1 font-semibold">{totalStock}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-brand-gray">Khả dụng</p>
                                    <p
                                        className={`mt-1 font-semibold ${
                                            availableStock > 0 ? "text-green-600" : "text-red-500"
                                        }`}
                                    >
                                        {availableStock}
                                    </p>
                                </div>
                                {/*<div>*/}
                                {/*    <p className="text-sm text-brand-gray">Đang giữ</p>*/}
                                {/*    <p className="mt-1 font-semibold text-amber-600">*/}
                                {/*        {reservedStock}*/}
                                {/*    </p>*/}
                                {/*</div>*/}
                            </div>

                            {availableStock <= 0 && (
                                <p className="mt-3 text-sm font-medium text-red-500">
                                    Phiên bản này hiện đang hết hàng.
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleAddToCart}
                        disabled={adding || inventoryLoading || availableStock <= 0}
                        className="rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white disabled:opacity-60"
                    >
                        {adding ? "Đang thêm..." : "Thêm vào giỏ"}
                    </button>

                    <button
                        onClick={handleBuyNow}
                        disabled={adding || inventoryLoading || availableStock <= 0}
                        className="rounded-xl border border-brand-dark px-5 py-3 font-semibold text-brand-dark disabled:opacity-60"
                    >
                        Mua ngay
                    </button>
                </div>

                {/*<div className="mt-8 rounded-2xl bg-gray-50 p-4">*/}
                {/*    <h3 className="font-bold">Thông tin sản phẩm</h3>*/}
                {/*    <div className="mt-3 space-y-2 text-sm text-brand-gray">*/}
                {/*        <p>Danh mục: {product.category?.name || "Đang cập nhật"}</p>*/}
                {/*        <p>Thương hiệu: {product.brand || "Đang cập nhật"}</p>*/}
                {/*        <p>Mã sản phẩm: {product.slug || "Đang cập nhật"}</p>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {product.description && (
                    <div className="mt-6 rounded-2xl bg-white">
                        <h3 className="text-lg font-bold">Mô tả chi tiết</h3>
                        <p className="mt-3 whitespace-pre-line text-sm text-brand-gray">
                            {product.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}