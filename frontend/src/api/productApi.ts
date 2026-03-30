import axiosClient from "./axiosClient"
import type { Product } from "../types/product"

export async function getProducts(): Promise<Product[]> {
    const res = await axiosClient.get("/products")
    return Array.isArray(res.data) ? res.data : (res.data.content ?? [])
}

export async function getProductById(id: string): Promise<Product> {
    const res = await axiosClient.get(`/products/${id}`)
    return res.data
}