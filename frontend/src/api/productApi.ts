import axiosClient from "./axiosClient"
import type { Product } from "../types/product"

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
        price?: number
        salePrice?: number
        stockQuantity?: number
        imageUrl?: string
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
        imageUrl: item.thumbnail ?? firstVariant?.imageUrl ?? thumbImage ?? firstImage ?? "",
        price: Number(firstVariant?.price ?? 0),
        salePrice:
            firstVariant?.salePrice != null ? Number(firstVariant.salePrice) : undefined,
        stock:
            firstVariant?.stockQuantity != null ? Number(firstVariant.stockQuantity) : 0,
        category: item.category?.name ?? "",
        brand: item.brand ?? "",
    }
}

export async function getProducts(): Promise<Product[]> {
    const res = await axiosClient.get("/products/public")
    const items: ProductResponse[] = res.data?.content ?? []
    return items.map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product> {
    const res = await axiosClient.get(`/products/public/${slug}`)
    return mapProduct(res.data)
}

export async function getPublicCategories() {
    const res = await axiosClient.get("/products/public/categories")
    return res.data ?? []
}