import axiosClient from "./axiosClient"
import type {CartItem} from "../types/cart"

type RawVariant = {
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
}

type RawImage = {
    thumbnail?: boolean
    imageUrl?: string
}

type RawProduct = {
    id?: number | string
    productId?: number | string
    slug?: string
    name?: string
    shortDescription?: string
    description?: string
    thumbnail?: string
    imageUrl?: string
    price?: number
    salePrice?: number
    stock?: number
    brand?: string
    category?: {
        name?: string
    } | string
    variants?: RawVariant[]
    images?: RawImage[]
}

type RawCartItem = {
    id?: number | string
    productId?: number | string
    variantId?: number | string
    quantity?: number
    product?: RawProduct
    variant?: RawVariant
    productVariant?: RawVariant
    sku?: string
    color?: string
    ram?: string
    storage?: string
    versionName?: string
}

function mapProduct(item: RawProduct) {
    const firstVariant = item?.variants?.[0]
    const thumbImage = item?.images?.find((img) => img.thumbnail)?.imageUrl
    const firstImage = item?.images?.[0]?.imageUrl
    const categoryName = typeof item?.category === "string" ? item.category : item?.category?.name ?? ""

    return {
        id: item?.id ?? item?.productId ?? "",
        slug: item?.slug ?? "",
        name: item?.name ?? "",
        description: item?.shortDescription ?? item?.description ?? "",
        imageUrl:
            item?.thumbnail ??
            firstVariant?.imageUrl ??
            thumbImage ??
            firstImage ??
            item?.imageUrl ??
            "",
        price: Number(firstVariant?.price ?? item?.price ?? 0),
        salePrice:
            firstVariant?.salePrice != null
                ? Number(firstVariant.salePrice)
                : item?.salePrice != null
                    ? Number(item.salePrice)
                    : undefined,
        stock:
            firstVariant?.stockQuantity != null
                ? Number(firstVariant.stockQuantity)
                : item?.stock != null
                    ? Number(item.stock)
                    : 0,
        category: categoryName,
        brand: item?.brand ?? "",
    }
}

function buildVariantLabel(source?: RawVariant | RawCartItem): string {
    return [
        source?.color,
        source?.ram,
        source?.storage,
        source?.versionName,
    ]
        .filter(Boolean)
        .join(" / ")
}

function mapCartItem(item: RawCartItem): CartItem {
    const variantSource = item.variant ?? item.productVariant ?? item

    return {
        id: item.id ?? "",
        productId: item.productId ?? item.product?.id ?? "",
        variantId:
            item.variantId ??
            item.variant?.id ??
            item.productVariant?.id ??
            "",
        quantity: Number(item.quantity ?? 0),
        variantSku:
            item.variant?.sku ??
            item.productVariant?.sku ??
            item.sku ??
            "",
        variantLabel: buildVariantLabel(variantSource),
        product: item.product ? mapProduct(item.product) : undefined,
    }
}

export async function getMyCart(): Promise<CartItem[]> {
    const res = await axiosClient.get("/cart")
    const items = Array.isArray(res.data) ? res.data : res.data?.items ?? []
    return items.map(mapCartItem)
}

export async function addToCart(
    payload: {
        productId: number | string
        quantity?: number
        variantId?: number | string
        productName: string
        variantName?: string
        thumbnail?: string
        price: number | string
    }
) {
    const requestBody: Record<string, number | string> = {
        productId: payload.productId,
        quantity: payload.quantity ?? 1,
        productName: payload.productName,
        price: payload.price,
    }

    if (payload.variantId !== undefined && payload.variantId !== null && payload.variantId !== "") {
        requestBody.variantId = payload.variantId
    }

    if (payload.variantName?.trim()) {
        requestBody.variantName = payload.variantName.trim()
    }

    if (payload.thumbnail?.trim()) {
        requestBody.thumbnail = payload.thumbnail.trim()
    }

    const res = await axiosClient.post("/cart/items", requestBody)
    return res.data
}

export async function updateCartItem(itemId: number | string, quantity: number) {
    const res = await axiosClient.put(`/cart/items/${itemId}`, {quantity})
    return res.data
}

export async function removeCartItem(itemId: number | string) {
    const res = await axiosClient.delete(`/cart/items/${itemId}`)
    return res.data
}

export async function clearCart() {
    await axiosClient.delete("/cart/clear")
}