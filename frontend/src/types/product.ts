export interface Product {
    id: number | string
    name: string
    description?: string
    imageUrl?: string
    price: number
    salePrice?: number
    stock?: number
    category?: string
    brand?: string
}