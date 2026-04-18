import axiosClient from "./axiosClient"
import type {Product, PublicCategory} from "../types/product"

export interface PublicProductVariant {
    id: number | string
    sku?: string
    color?: string
    ram?: string
    storage?: string
    versionName?: string
    price: number
    salePrice?: number
    stockQuantity?: number
    imageUrl?: string
    status?: string
}

export interface ProductDetailData {
    id: number | string
    slug: string
    name: string
    shortDescription?: string
    description?: string
    thumbnail?: string
    brand?: string
    category?: {
        id?: number | string
        name?: string
        slug?: string
    }
    images: Array<{
        id?: number | string
        imageUrl?: string
        thumbnail?: boolean
    }>
    specifications: Array<{
        id?: number | string
        groupName: string
        specKey: string
        specValue: string
        sortOrder: number
    }>
    variants: PublicProductVariant[]
}

export interface ProductReviewItem {
    id: number | string
    userId?: number | string
    username: string
    rating: number
    comment?: string
    createdAt?: string
    updatedAt?: string
}

export interface ProductReviewSummary {
    averageRating: number
    totalReviews: number
    fiveStar: number
    fourStar: number
    threeStar: number
    twoStar: number
    oneStar: number
}

export interface ProductReviewOverview {
    summary: ProductReviewSummary
    reviews: ProductReviewItem[]
}

type ProductResponse = {
    id: number | string
    slug?: string
    name?: string
    shortDescription?: string
    description?: string
    thumbnail?: string
    brand?: string
    category?: {
        id?: number | string
        name?: string
        slug?: string
    }
    variants?: Array<{
        id?: number | string
        sku?: string
        color?: string
        ram?: string
        storage?: string
        versionName?: string
        price?: number
        salePrice?: number
        stockQuantity?: number
        imageUrl?: string
        status?: string
    }>
    images?: Array<{
        id?: number | string
        imageUrl?: string
        thumbnail?: boolean
    }>
    specifications?: Array<{
        id?: number | string
        groupName?: string
        specKey?: string
        specValue?: string
        sortOrder?: number
    }>
}

type ProductReviewOverviewResponse = {
    summary?: {
        averageRating?: number
        totalReviews?: number
        fiveStar?: number
        fourStar?: number
        threeStar?: number
        twoStar?: number
        oneStar?: number
    }
    reviews?: Array<{
        id?: number | string
        userId?: number | string
        username?: string
        rating?: number
        comment?: string
        createdAt?: string
        updatedAt?: string
    }>
}

function mapProduct(item: ProductResponse): Product {
    const firstVariant = item.variants?.[0]
    const thumbImage = item.images?.find((img) => img.thumbnail)?.imageUrl
    const firstImage = item.images?.[0]?.imageUrl

    return {
        id: item.id,
        slug: item.slug ?? "",
        name: item.name ?? "",
        description: item.shortDescription ?? item.description ?? "",
        imageUrl:
            item.thumbnail ??
            firstVariant?.imageUrl ??
            thumbImage ??
            firstImage ??
            "",
        price: Number(firstVariant?.price ?? 0),
        salePrice:
            firstVariant?.salePrice != null
                ? Number(firstVariant.salePrice)
                : undefined,
        stock:
            firstVariant?.stockQuantity != null
                ? Number(firstVariant.stockQuantity)
                : 0,
        category: item.category?.name ?? "",
        categorySlug: item.category?.slug ?? "",
        brand: item.brand ?? "",
    }
}

function mapProductDetail(item: ProductResponse): ProductDetailData {
    return {
        id: item.id,
        slug: item.slug ?? "",
        name: item.name ?? "",
        shortDescription: item.shortDescription ?? "",
        description: item.description ?? item.shortDescription ?? "",
        thumbnail: item.thumbnail ?? "",
        brand: item.brand ?? "",
        category: item.category,
        images: (item.images ?? []).map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl ?? "",
            thumbnail: Boolean(img.thumbnail),
        })),
        specifications: (item.specifications ?? []).map((spec) => ({
            id: spec.id,
            groupName: spec.groupName ?? "Thong so khac",
            specKey: spec.specKey ?? "",
            specValue: spec.specValue ?? "",
            sortOrder: Number(spec.sortOrder ?? 0),
        })),
        variants: (item.variants ?? []).map((variant) => ({
            id: variant.id ?? "",
            sku: variant.sku ?? "",
            color: variant.color ?? "",
            ram: variant.ram ?? "",
            storage: variant.storage ?? "",
            versionName: variant.versionName ?? "",
            price: Number(variant.price ?? 0),
            salePrice:
                variant.salePrice != null ? Number(variant.salePrice) : undefined,
            stockQuantity:
                variant.stockQuantity != null
                    ? Number(variant.stockQuantity)
                    : 0,
            imageUrl: variant.imageUrl ?? "",
            status: variant.status ?? "",
        })),
    }
}

export async function getProducts(): Promise<Product[]> {
    const res = await axiosClient.get("/products/public")
    const items: ProductResponse[] = Array.isArray(res.data)
        ? res.data
        : res.data?.content ?? []
    return items.map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product> {
    const res = await axiosClient.get(`/products/public/${slug}`)
    return mapProduct(res.data)
}

export async function getProductDetailBySlug(
    slug: string
): Promise<ProductDetailData> {
    const res = await axiosClient.get(`/products/public/${slug}`)
    return mapProductDetail(res.data)
}

export async function getRelatedProductsBySlug(
    slug: string,
    size = 8
): Promise<Product[]> {
    const res = await axiosClient.get(`/products/public/${slug}/related`, {
        params: { size },
    })
    const items: ProductResponse[] = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapProduct)
}

export async function getProductReviewsBySlug(
    slug: string
): Promise<ProductReviewOverview> {
    const res = await axiosClient.get(`/products/public/${slug}/reviews`)
    const payload: ProductReviewOverviewResponse = res.data ?? {}

    return {
        summary: {
            averageRating: Number(payload.summary?.averageRating ?? 0),
            totalReviews: Number(payload.summary?.totalReviews ?? 0),
            fiveStar: Number(payload.summary?.fiveStar ?? 0),
            fourStar: Number(payload.summary?.fourStar ?? 0),
            threeStar: Number(payload.summary?.threeStar ?? 0),
            twoStar: Number(payload.summary?.twoStar ?? 0),
            oneStar: Number(payload.summary?.oneStar ?? 0),
        },
        reviews: (payload.reviews ?? []).map((review) => ({
            id: review.id ?? "",
            userId: review.userId ?? "",
            username: review.username ?? "Khach hang",
            rating: Number(review.rating ?? 0),
            comment: review.comment ?? "",
            createdAt: review.createdAt ?? "",
            updatedAt: review.updatedAt ?? "",
        })),
    }
}

export async function submitProductReview(
    slug: string,
    payload: { rating: number; comment?: string }
): Promise<ProductReviewItem> {
    const res = await axiosClient.post(`/products/public/${slug}/reviews`, payload)
    const data = res.data?.data ?? {}
    return {
        id: data.id ?? "",
        userId: data.userId ?? "",
        username: data.username ?? "Khach hang",
        rating: Number(data.rating ?? payload.rating),
        comment: data.comment ?? payload.comment ?? "",
        createdAt: data.createdAt ?? "",
        updatedAt: data.updatedAt ?? "",
    }
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
    const res = await axiosClient.get("/products/public/categories")
    return Array.isArray(res.data) ? res.data : res.data?.content ?? []
}