import axiosClient from "./axiosClient"
import type { Product } from "../types/product"

export interface ProductQueryParams {
    keyword?: string
    categoryId?: string | number
}

export interface PublicCategory {
    id: number | string
    name: string
    slug: string
}

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
    variants: PublicProductVariant[]
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

export async function getProducts(params?: ProductQueryParams): Promise<Product[]> {
    const queryParams: Record<string, string | number> = {}
    if (params?.keyword?.trim()) {
        queryParams.keyword = params.keyword.trim()
    }
    if (params?.categoryId != null && String(params.categoryId).trim() !== "") {
        queryParams.categoryId = params.categoryId
    }

    const res = await axiosClient.get("/products/public", {
        params: queryParams,
    })
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

type RawPublicCategory = {
    id?: number | string
    name?: string
    slug?: string
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
    const res = await axiosClient.get("/products/public/categories")
    const items: RawPublicCategory[] = Array.isArray(res.data)
        ? res.data
        : res.data?.content ?? []

    return items.map((item) => ({
        id: item.id ?? "",
        name: item.name ?? "",
        slug: item.slug ?? "",
    }))
}