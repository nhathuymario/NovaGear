import {useEffect, useMemo, useState} from "react"
import {Link, useNavigate, useParams} from "react-router-dom"
import {motion} from "framer-motion"
import {ChevronRight, Package, RefreshCw, ShieldCheck, Truck} from "lucide-react"
import {addToCart} from "../api/cartApi"
import {type InventoryItem,} from "../api/inventoryApi"
import {
    getProductDetailBySlug,
    getProductReviewsBySlug,
    getRelatedProductsBySlug,
    type ProductDetailData,
    type ProductReviewOverview,
    type PublicProductVariant,
    submitProductReview,
} from "../api/productApi"
import type {Product} from "../types/product"
import {getToken} from "../utils/auth"
import {getFallbackImageSrc, handleImageError} from "../utils/image"
import ProductCard from "../components/product/ProductCard"
import {ProductDetailSkeleton} from "../components/ui/Skeletons"

function formatCurrency(value: number) {
    return value.toLocaleString("vi-VN") + "đ"
}

function buildVariantLabel(variant: PublicProductVariant) {
    return [variant.color, variant.ram, variant.storage, variant.versionName]
        .filter(Boolean)
        .join(" / ")
}

function normalizeVariantOption(value?: string) {
    return String(value ?? "").trim()
}

function extractApiErrorMessage(error: unknown): string {
    const maybeAxiosError = error as {
        response?: { data?: { message?: string } }
        message?: string
    }
    return (
        maybeAxiosError?.response?.data?.message ||
        maybeAxiosError?.message ||
        "Gửi đánh giá thất bại"
    )
}

const SHOP_COMMITMENTS = [
    {
        icon: RefreshCw,
        title: "Hư gì đổi nấy 12 tháng",
        description: "Đổi trả tại hệ thống cửa hàng trong 12 tháng, miễn phí tháng đầu theo chính sách.",
    },
    {
        icon: Package,
        title: "Bộ sản phẩm đầy đủ",
        description: "Hộp, sách hướng dẫn, cáp Type-C và phụ kiện đi kèm theo từng phiên bản.",
    },
    {
        icon: ShieldCheck,
        title: "Bảo hành chính hãng",
        description: "Bảo hành điện thoại chính hãng tại trung tâm bảo hành của hãng.",
    },
    {
        icon: Truck,
        title: "Giao hàng nhanh",
        description: "Hỗ trợ giao nhanh, theo dõi đơn hàng và nhận hàng thuận tiện tại nhà.",
    },
]

function sanitizeDescriptionHtml(htmlValue: string) {
    return htmlValue
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/ on\w+="[^"]*"/gi, "")
        .replace(/ on\w+='[^']*'/gi, "")
}

export default function ProductDetailPage() {
    const {slug = ""} = useParams()
    const navigate = useNavigate()

    const [product, setProduct] = useState<ProductDetailData | null>(null)
    const [selectedVariantId, setSelectedVariantId] = useState<number | string | null>(null)
    const [selectedStorage, setSelectedStorage] = useState("")
    const [selectedColor, setSelectedColor] = useState("")
    const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [openSpecGroups, setOpenSpecGroups] = useState<Record<string, boolean>>({})
    const [reviewData, setReviewData] = useState<ProductReviewOverview | null>(null)
    const [reviewLoading, setReviewLoading] = useState(false)
    const [reviewSubmitting, setReviewSubmitting] = useState(false)
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: "",
    })
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const [relatedLoading, setRelatedLoading] = useState(false)

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
                    const firstVariant = detail.variants[0]
                    setSelectedVariantId(firstVariant.id)
                    setSelectedStorage(normalizeVariantOption(firstVariant.storage))
                    setSelectedColor(normalizeVariantOption(firstVariant.color))
                } else {
                    setSelectedVariantId(null)
                    setSelectedStorage("")
                    setSelectedColor("")
                    setSelectedInventory(null)
                }
            } catch (error) {
                console.error(error)
                setProduct(null)
                setSelectedVariantId(null)
                setSelectedStorage("")
                setSelectedColor("")
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

    const storageOptions = useMemo(() => {
        if (!product) return []

        return Array.from(
            new Set(
                product.variants
                    .map((variant) => normalizeVariantOption(variant.storage))
                    .filter(Boolean)
            )
        )
    }, [product])

    const colorOptions = useMemo(() => {
        if (!product) return []

        const targetVariants = selectedStorage
            ? product.variants.filter(
                (variant) => normalizeVariantOption(variant.storage) === selectedStorage
            )
            : product.variants

        return Array.from(
            new Set(targetVariants.map((variant) => normalizeVariantOption(variant.color)).filter(Boolean))
        )
    }, [product, selectedStorage])

    const filteredVariants = useMemo(() => {
        if (!product) return []

        return product.variants.filter((variant) => {
            const variantStorage = normalizeVariantOption(variant.storage)
            const variantColor = normalizeVariantOption(variant.color)

            if (selectedStorage && variantStorage !== selectedStorage) {
                return false
            }

            if (selectedColor && variantColor !== selectedColor) {
                return false
            }

            return true
        })
    }, [product, selectedStorage, selectedColor])

    useEffect(() => {
        if (!product || product.variants.length === 0) {
            return
        }

        const candidates = filteredVariants
        const hasSelectedInCandidates = candidates.some(
            (variant) => String(variant.id) === String(selectedVariantId)
        )

        if (candidates.length > 0 && !hasSelectedInCandidates) {
            setSelectedVariantId(candidates[0].id)
            return
        }

        if (candidates.length === 0) {
            const fallbackByStorage = selectedStorage
                ? product.variants.filter(
                    (variant) => normalizeVariantOption(variant.storage) === selectedStorage
                )
                : product.variants

            const fallback = fallbackByStorage[0] ?? product.variants[0]
            if (!fallback) {
                return
            }

            setSelectedVariantId(fallback.id)
            setSelectedStorage(normalizeVariantOption(fallback.storage))
            setSelectedColor(normalizeVariantOption(fallback.color))
        }
    }, [product, filteredVariants, selectedVariantId, selectedStorage, selectedColor])

    useEffect(() => {
        if (!selectedVariant?.id) {
            setSelectedInventory(null)
            return
        }

        setInventoryLoading(false)
        setSelectedInventory({
            id: selectedVariant.id,
            variantId: selectedVariant.id,
            productName: product?.name ?? "",
            stockQuantity: Number(selectedVariant.stockQuantity ?? 0),
            reservedQuantity: 0,
            availableQuantity: Number(selectedVariant.stockQuantity ?? 0),
        })
    }, [product?.name, selectedVariant])

    const galleryImages = useMemo(() => {
        let effectiveVariant = selectedVariant
        let effectiveId = selectedVariant?.id != null ? String(selectedVariant.id) : null

        if (selectedVariant && !selectedVariant.imageUrl && selectedVariant.color) {
            const hasOwnGalleryImages = (product?.images ?? []).some(
                (img) => String(img.variantId) === effectiveId
            )
            if (!hasOwnGalleryImages) {
                const sameColorVariant = product?.variants.find(
                    (v) =>
                        v.id !== selectedVariant.id &&
                        v.color === selectedVariant.color &&
                        (v.imageUrl || (product?.images ?? []).some((img) => String(img.variantId) === String(v.id)))
                )
                if (sameColorVariant) {
                    effectiveVariant = sameColorVariant
                    effectiveId = String(sameColorVariant.id)
                }
            }
        }

        const scopedImages = (product?.images ?? []).filter((img) => {
            if (!effectiveId) {
                return true
            }
            if (img.variantId == null || String(img.variantId).trim() === "") {
                return true
            }
            return String(img.variantId) === effectiveId
        })

        const variantImageUrls = new Set(
            [
                ...(product?.variants ?? []).map((variant) => String(variant.imageUrl ?? "").trim()),
                ...(product?.images ?? [])
                    .filter((img) => img.variantId != null && String(img.variantId).trim() !== "")
                    .map((img) => String(img.imageUrl ?? "").trim()),
            ].filter(Boolean)
        )

        const sharedThumbnail = String(product?.thumbnail ?? "").trim()
        const sharedThumbnailIsVariantImage = sharedThumbnail ? variantImageUrls.has(sharedThumbnail) : false

        const candidates = [
            effectiveVariant?.imageUrl,
            ...scopedImages.map((img) => img.imageUrl),
            ...(sharedThumbnail && !sharedThumbnailIsVariantImage ? [sharedThumbnail] : []),
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

    const handleSelectStorage = (storage: string) => {
        setSelectedStorage(storage)

        if (!product) {
            return
        }

        const variantsByStorage = product.variants.filter(
            (variant) => normalizeVariantOption(variant.storage) === storage
        )

        if (variantsByStorage.length === 0) {
            return
        }

        const nextColor = variantsByStorage.some(
            (variant) => normalizeVariantOption(variant.color) === selectedColor
        )
            ? selectedColor
            : normalizeVariantOption(variantsByStorage[0].color)

        if (nextColor !== selectedColor) {
            setSelectedColor(nextColor)
        }

        const nextVariant =
            variantsByStorage.find(
                (variant) => normalizeVariantOption(variant.color) === nextColor
            ) ?? variantsByStorage[0]

        if (nextVariant) {
            setSelectedVariantId(nextVariant.id)
        }
    }

    const handleSelectColor = (color: string) => {
        setSelectedColor(color)

        if (!product) {
            return
        }

        const variantsByColor = product.variants.filter(
            (variant) => normalizeVariantOption(variant.color) === color
        )

        if (variantsByColor.length === 0) {
            return
        }

        const nextVariant = selectedStorage
            ? variantsByColor.find(
                (variant) => normalizeVariantOption(variant.storage) === selectedStorage
            ) ?? variantsByColor[0]
            : variantsByColor[0]

        if (nextVariant) {
            setSelectedVariantId(nextVariant.id)
            const nextStorage = normalizeVariantOption(nextVariant.storage)
            if (nextStorage && nextStorage !== selectedStorage) {
                setSelectedStorage(nextStorage)
            }
        }
    }

    useEffect(() => {
        if (!slug) {
            setReviewData(null)
            return
        }

        const loadReviews = async () => {
            try {
                setReviewLoading(true)
                const payload = await getProductReviewsBySlug(slug)
                setReviewData(payload)
            } catch (error) {
                console.error(error)
                setReviewData(null)
            } finally {
                setReviewLoading(false)
            }
        }

        loadReviews()
    }, [slug])

    useEffect(() => {
        if (!slug) {
            setRelatedProducts([])
            return
        }

        const loadRelatedProducts = async () => {
            try {
                setRelatedLoading(true)
                const items = await getRelatedProductsBySlug(slug, 8)
                setRelatedProducts(items)
            } catch (error) {
                console.error(error)
                setRelatedProducts([])
            } finally {
                setRelatedLoading(false)
            }
        }

        loadRelatedProducts()
    }, [slug])

    useEffect(() => {
        setIsDescriptionExpanded(false)
    }, [product?.id])

    const descriptionHtml = useMemo(() => {
        const raw = (product?.description ?? product?.shortDescription ?? "").trim()
        if (!raw) {
            return ""
        }

        const looksLikeHtml = /<[^>]+>/.test(raw)
        return sanitizeDescriptionHtml(looksLikeHtml ? raw : raw.replace(/\n/g, "<br />"))
    }, [product?.description, product?.shortDescription])

    const hasExpandableDescription = Boolean(descriptionHtml)

    const groupedSpecifications = useMemo(() => {
        const source = product?.specifications ?? []
        const grouped = new Map<string, ProductDetailData["specifications"]>()

        for (const spec of source) {
            const groupName = String(spec.groupName ?? "").trim() || "Thong so khac"
            if (!grouped.has(groupName)) {
                grouped.set(groupName, [])
            }
            grouped.get(groupName)?.push(spec)
        }

        return Array.from(grouped.entries()).map(([groupName, specs]) => ({
            groupName,
            specs: specs.slice().sort((a, b) => a.sortOrder - b.sortOrder),
        }))
    }, [product?.specifications])

    useEffect(() => {
        if (groupedSpecifications.length === 0) {
            setOpenSpecGroups({})
            return
        }

        const nextState: Record<string, boolean> = {}
        groupedSpecifications.forEach((group, index) => {
            nextState[group.groupName] = index === 0
        })
        setOpenSpecGroups(nextState)
    }, [groupedSpecifications])

    const toggleSpecGroup = (groupName: string) => {
        setOpenSpecGroups((prev) => ({
            ...prev,
            [groupName]: !prev[groupName],
        }))
    }

    const finalPrice = selectedVariant
        ? selectedVariant.salePrice ?? selectedVariant.price
        : 0

    const originalPrice = selectedVariant?.price ?? 0

    const availableStock =
        selectedInventory?.availableQuantity ??
        selectedVariant?.stockQuantity ??
        0

    const reviewSummary = reviewData?.summary ?? {
        averageRating: 0,
        totalReviews: 0,
        fiveStar: 0,
        fourStar: 0,
        threeStar: 0,
        twoStar: 0,
        oneStar: 0,
    }

    const reviewBars = [
        {star: 5, count: reviewSummary.fiveStar},
        {star: 4, count: reviewSummary.fourStar},
        {star: 3, count: reviewSummary.threeStar},
        {star: 2, count: reviewSummary.twoStar},
        {star: 1, count: reviewSummary.oneStar},
    ]

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!getToken()) {
            navigate("/login", {state: {from: `/products/${slug}`}})
            return
        }

        const normalizedRating = Number(reviewForm.rating)
        if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
            alert("Số sao không hợp lệ")
            return
        }

        try {
            setReviewSubmitting(true)
            await submitProductReview(slug, {
                rating: normalizedRating,
                comment: reviewForm.comment.trim(),
            })

            const payload = await getProductReviewsBySlug(slug)
            setReviewData(payload)
            setReviewForm({
                rating: 5,
                comment: "",
            })
            alert("Đã gửi đánh giá")
        } catch (error) {
            console.error(error)
            alert(extractApiErrorMessage(error))
        } finally {
            setReviewSubmitting(false)
        }
    }

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

    if (loading) return <ProductDetailSkeleton />
    if (!product) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-xl font-bold text-slate-900">Không tìm thấy sản phẩm</p>
                <p className="mt-2 text-sm text-slate-500">Sản phẩm có thể đã bị gỡ hoặc đường dẫn không còn hợp lệ.</p>
                <Link to="/products" className="mt-4 inline-flex rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white">Quay lại</Link>
            </div>
        )
    }

    return (
        <motion.div
            initial={{opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.25}}
            className="space-y-4"
        >
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Link to="/" className="hover:text-brand-blue">Trang chủ</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/products" className="hover:text-brand-blue">Sản phẩm</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-slate-700 truncate max-w-[200px]">{product.name}</span>
            </div>

            <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-6">
                <div className="space-y-3">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <div className="relative aspect-square w-full bg-slate-100">
                            <img
                                src={galleryImage}
                                alt={product.name}
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                                sizes="(min-width: 768px) 50vw, 100vw"
                                className="h-full w-full object-contain p-2"
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
                                    <span
                                        className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                                    {selectedImageIndex + 1}/{galleryImages.length}
                                </span>
                                </>
                            )}
                        </div>
                    </div>

                    {galleryImages.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                            {galleryImages.slice(0, 8).map((imageUrl, index) => (
                                <div
                                    key={`${imageUrl}-${index}`}
                                    className={`aspect-square overflow-hidden rounded-lg border-2 bg-slate-50 ${
                                        index === selectedImageIndex ? "border-brand-blue" : "border-transparent hover:border-slate-300"
                                    }`}
                                >
                                    <button type="button" onClick={() => setSelectedImageIndex(index)}
                                            className="h-full w-full">
                                        <img
                                            src={imageUrl || getFallbackImageSrc("NovaGear")}
                                            alt={`${product.name}-${index}`}
                                            loading="lazy"
                                            decoding="async"
                                            sizes="(min-width: 768px) 12vw, 25vw"
                                            className="h-full w-full object-contain p-1"
                                            data-fallback={getFallbackImageSrc("NovaGear")}
                                            onError={handleImageError}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        {product.brand && (
                            <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">{product.brand}</p>
                        )}
                        <h1 className="mt-1 text-2xl font-bold text-slate-900">{product.name}</h1>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-500">
                        {product.shortDescription || product.description}
                    </p>

                    <div className="rounded-xl bg-red-50/50 border border-red-100 p-4">
                        <p className="text-2xl font-extrabold text-brand-red">
                            {formatCurrency(finalPrice)}
                        </p>
                        {selectedVariant?.salePrice != null && (
                            <div className="mt-1 flex items-center gap-2">
                                <p className="text-sm text-slate-400 line-through">{formatCurrency(originalPrice)}</p>
                                <span className="rounded-md bg-brand-red px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    -{Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}%
                                </span>
                            </div>
                        )}
                        {finalPrice >= 3000000 && (
                            <p className="mt-2 text-xs font-semibold text-brand-blue">Trả góp 0% qua thẻ tín dụng</p>
                        )}
                    </div>

                    {product.variants.length > 0 && (
                        <div>
                            <h3 className="font-bold">Phiên bản</h3>

                            {storageOptions.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Bộ nhớ
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {storageOptions.map((storage) => {
                                            const isActive = storage === selectedStorage
                                            return (
                                                <button
                                                    key={storage}
                                                    type="button"
                                                    onClick={() => handleSelectStorage(storage)}
                                                    className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
                                                        isActive
                                                            ? "border-brand-dark bg-brand-dark/10 text-brand-dark"
                                                            : "border-slate-200 text-slate-700 hover:border-slate-400"
                                                    }`}
                                                >
                                                    {storage}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {colorOptions.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Màu sắc
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {colorOptions.map((color) => {
                                            const isActive = color === selectedColor
                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => handleSelectColor(color)}
                                                    className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
                                                        isActive
                                                            ? "border-brand-dark bg-brand-dark/10 text-brand-dark"
                                                            : "border-slate-200 text-slate-700 hover:border-slate-400"
                                                    }`}
                                                >
                                                    {color}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="mt-3 grid gap-3">
                                {(filteredVariants.length > 0 ? filteredVariants : product.variants).map((variant) => {
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
                                            onClick={() => {
                                                setSelectedVariantId(variant.id)
                                                setSelectedStorage(normalizeVariantOption(variant.storage))
                                                setSelectedColor(normalizeVariantOption(variant.color))
                                            }}
                                            className={`rounded-2xl border p-4 text-left transition ${
                                                isSelected
                                                    ? "border-brand-dark bg-gray-50"
                                                    : "border-gray-200 hover:border-gray-400"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">{label}</p>
                                                    {/*{variant.sku && (*/}
                                                    {/*    <p className="mt-1 text-xs text-brand-gray">*/}
                                                    {/*        SKU: {variant.sku}*/}
                                                    {/*    </p>*/}
                                                    {/*)}*/}
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

                    <div className="flex gap-3">
                        <button
                            onClick={handleBuyNow}
                            disabled={adding || inventoryLoading || availableStock <= 0}
                            className="flex-1 rounded-lg bg-brand-red py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-50"
                        >
                            {adding ? "Đang xử lý..." : "MUA NGAY"}
                        </button>
                        <button
                            onClick={handleAddToCart}
                            disabled={adding || inventoryLoading || availableStock <= 0}
                            className="flex-1 rounded-lg border-2 border-brand-blue py-3 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-white disabled:opacity-50"
                        >
                            {adding ? "Đang thêm..." : "THÊM VÀO GIỎ"}
                        </button>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {inventoryLoading ? (
                            <p className="text-xs text-slate-500">Đang tải tồn kho...</p>
                        ) : availableStock > 0 ? (
                            <div className="flex items-center gap-2 text-xs">
                                <span className="h-2 w-2 rounded-full bg-brand-green"></span>
                                <span className="font-semibold text-brand-green">Còn hàng</span>
                                <span className="text-slate-400">({availableStock} sản phẩm)</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs">
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                <span className="font-semibold text-red-500">Hết hàng</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-900">NovaGear cam kết</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {SHOP_COMMITMENTS.map((item) => {
                        const Icon = item.icon
                        return (
                            <div key={item.title} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-blue shadow-sm">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {descriptionHtml && (
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Thông tin sản phẩm</h3>
                        </div>
                    </div>

                    <div className="relative mt-5">
                        <div
                            className={`overflow-hidden rounded-[28px] transition-all duration-300 ${
                                isDescriptionExpanded ? "max-h-none" : "max-h-[360px]"
                            }`}
                        >
                            <div
                                className="product-description p-4 text-slate-800 [&_a]:text-brand-blue [&_a]:underline [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-none [&_p]:mt-3 [&_p]:leading-7 [&_p]:text-slate-700"
                                dangerouslySetInnerHTML={{__html: descriptionHtml}}
                            />
                        </div>

                        {!isDescriptionExpanded && hasExpandableDescription && (
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 rounded-b-[28px] bg-gradient-to-t from-white to-transparent" />
                        )}
                    </div>

                    {hasExpandableDescription && (
                        <button
                            type="button"
                            onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                            className="mx-auto mt-4 flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-brand-blue transition hover:bg-brand-blue/5"
                        >
                            {isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}
                            <span className={`transition-transform ${isDescriptionExpanded ? "rotate-180" : ""}`}>
                                ▾
                            </span>
                        </button>
                    )}
                </section>
            )}

            {groupedSpecifications.length > 0 && (
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900">Thông số kỹ thuật</h3>

                    <div className="mt-5 space-y-3">
                        {groupedSpecifications.map((group) => {
                            const isOpen = Boolean(openSpecGroups[group.groupName])

                            return (
                                <div
                                    key={group.groupName}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleSpecGroup(group.groupName)}
                                        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left"
                                    >
                                        <span className="font-semibold text-slate-800">{group.groupName}</span>
                                        <span className="text-slate-500">{isOpen ? "-" : "+"}</span>
                                    </button>

                                    {isOpen && (
                                        <div className="divide-y divide-slate-100">
                                            {group.specs.map((spec) => (
                                                <div
                                                    key={`${group.groupName}-${spec.id ?? spec.specKey}`}
                                                    className="grid grid-cols-[170px_1fr] gap-3 px-4 py-3 text-sm"
                                                >
                                                    <p className="font-medium text-slate-700">{spec.specKey}</p>
                                                    <p className="text-slate-700">{spec.specValue}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">Đánh giá sản phẩm</h3>

                {reviewLoading ? (
                    <p className="mt-3 text-sm text-slate-500">Đang tải đánh giá...</p>
                ) : (
                    <div className="mt-4 grid gap-6 lg:grid-cols-[280px_1fr]">
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-4xl font-black text-slate-900">{reviewSummary.averageRating.toFixed(1)}</p>
                            <p className="mt-1 text-sm text-slate-600">{reviewSummary.totalReviews} danh gia</p>
                        </div>

                        <div className="space-y-2">
                            {reviewBars.map((item) => {
                                const percent = reviewSummary.totalReviews > 0
                                    ? Math.round((item.count / reviewSummary.totalReviews) * 100)
                                    : 0

                                return (
                                    <div key={item.star}
                                         className="grid grid-cols-[24px_1fr_40px] items-center gap-2 text-sm">
                                        <span className="text-slate-600">{item.star}★</span>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                            <div className="h-full bg-brand-blue" style={{width: `${percent}%`}}/>
                                        </div>
                                        <span className="text-right text-slate-600">{percent}%</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmitReview} className="mt-6 rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-800">Viết đánh giá của bạn</p>
                    <div className="mt-3 flex items-center gap-3">
                        <label className="text-sm text-slate-600">Số sao</label>
                        <select
                            value={reviewForm.rating}
                            onChange={(e) => setReviewForm((prev) => ({...prev, rating: Number(e.target.value)}))}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                        >
                            <option value={5}>5 sao</option>
                            <option value={4}>4 sao</option>
                            <option value={3}>3 sao</option>
                            <option value={2}>2 sao</option>
                            <option value={1}>1 sao</option>
                        </select>
                    </div>
                    <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((prev) => ({...prev, comment: e.target.value}))}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                        className="mt-3 min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    />
                    <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="mt-3 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                </form>

                {(reviewData?.reviews.length ?? 0) > 0 && (
                    <div className="mt-6 space-y-3">
                        {reviewData?.reviews.map((review) => (
                            <div key={review.id} className="rounded-2xl border border-slate-200 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-semibold text-slate-900">{review.username}</p>
                                    <p className="text-xs text-slate-500">{review.createdAt || ""}</p>
                                </div>
                                <p className="mt-1 text-sm text-amber-600">{"★".repeat(Math.max(1, review.rating))}</p>
                                {review.comment ?
                                    <p className="mt-2 text-sm text-slate-700">{review.comment}</p> : null}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Sản phẩm tương tự</h3>
                    <Link to="/products" className="text-xs font-semibold text-brand-blue hover:underline">Xem thêm</Link>
                </div>

                {relatedLoading ? (
                    <p className="text-sm text-slate-500">Đang tải...</p>
                ) : relatedProducts.length === 0 ? (
                    <p className="text-sm text-slate-500">Chưa có sản phẩm tương tự.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {relatedProducts.map((item) => (
                            <ProductCard key={item.id} product={item}/>
                        ))}
                    </div>
                )}
            </section>
        </motion.div>
    )
}
