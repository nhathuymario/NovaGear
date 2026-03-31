import axiosClient from "./axiosClient"
import type { Product } from "../types/product"

export async function getProducts(): Promise<Product[]> {
    const res = await axiosClient.get("/products/public")
    return res.data?.content ?? []
}

export async function getProductBySlug(slug: string): Promise<Product> {
    const res = await axiosClient.get(`/products/public/${slug}`)
    return res.data
}

export async function getPublicCategories() {
    const res = await axiosClient.get("/products/public/categories")
    return res.data
}