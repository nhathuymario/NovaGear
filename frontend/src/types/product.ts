export interface Product {
    id: number | string
    slug: string
    name: string
    featured?: boolean
    description?: string
    imageUrl?: string
    price: number
    salePrice?: number
    stock?: number
    category?: string
    categorySlug?: string
    brand?: string
}

export interface PublicCategory {
    id: number | string
    name: string
    slug: string
}