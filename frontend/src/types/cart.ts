import type { Product } from "./product"

export interface CartItem {
    id: number | string
    productId: number | string
    quantity: number
    product?: Product
}