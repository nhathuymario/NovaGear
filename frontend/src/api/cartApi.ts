import axiosClient from "./axiosClient"
import type { CartItem } from "../types/cart"
import type { Product } from "../types/product"

type RawCartItem = {
    id?: number | string
    productId?: number | string
    quantity?: number
    product?: any
}

function mapProduct(item: any): Product {
    const firstVariant = item?.variants?.[0]
    const thumbImage = item?.images?.find((img: any) => img.thumbnail)?.imageUrl
    const firstImage = item?.images?.[0]?.imageUrl

    return {
        id: item?.id ?? item?.productId ?? "",
        slug: item?.slug ?? "",
        name: item?.name ?? "",
        description: item?.shortDescription ?? item?.description ?? "",
        imageUrl: item?.thumbnail ?? firstVariant?.imageUrl ?? thumbImage ?? firstImage ?? item?.imageUrl ?? "",
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
        category: item?.category?.name ?? item?.category ?? "",
        brand: item?.brand ?? "",
    }
}

function mapCartItem(item: RawCartItem): CartItem {
    return {
        id: item.id ?? "",
        productId: item.productId ?? item.product?.id ?? "",
        quantity: Number(item.quantity ?? 0),
        product: item.product ? mapProduct(item.product) : undefined,
    }
}

export async function getMyCart(): Promise<CartItem[]> {
    const res = await axiosClient.get("/cart")
    const items = Array.isArray(res.data) ? res.data : res.data?.items ?? []
    return items.map(mapCartItem)
}

export async function addToCart(productId: number | string, quantity = 1) {
    const res = await axiosClient.post("/cart/add", { productId, quantity })
    return res.data
}

export async function updateCartItem(itemId: number | string, quantity: number) {
    const res = await axiosClient.put(`/cart/items/${itemId}`, { quantity })
    return res.data
}

export async function removeCartItem(itemId: number | string) {
    const res = await axiosClient.delete(`/cart/items/${itemId}`)
    return res.data
}