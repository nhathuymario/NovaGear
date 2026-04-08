export interface CartItem {
    id: number | string
    productId: number | string
    variantId?: number | string
    quantity: number
    productName?: string
    thumbnail?: string
    price?: number
    salePrice?: number
    lineTotal?: number
    variantLabel?: string
    variantSku?: string
    product?: {
        id: number | string
        slug: string
        name: string
        description: string
        imageUrl: string
        price: number
        salePrice?: number
        stock: number
        category: string
        brand: string
    }
}