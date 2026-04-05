import axiosClient from "./axiosClient"

export interface AdminProductPayload {
    name: string
    slug: string
    brand: string
    categoryId: number | string
    shortDescription?: string
    description?: string
    thumbnail?: string
    status?: "DRAFT" | "ACTIVE" | "INACTIVE"
    featured?: boolean
}

export interface AdminProductItem {
    id: number | string
    slug: string
    name: string
    brand: string
    categoryName?: string
    shortDescription?: string
    thumbnail?: string
    status?: string
    featured?: boolean
}

export interface AdminCategorySummary {
    id: number | string
    name: string
}

type RawAdminProduct = {
    id?: number | string
    slug?: string
    name?: string
    brand?: string
    shortDescription?: string
    thumbnail?: string
    status?: string
    featured?: boolean
    category?: {
        id?: number | string
        name?: string
    }
}

type RawAdminCategory = {
    id?: number | string
    name?: string
}

function mapAdminProduct(raw: RawAdminProduct): AdminProductItem {
    return {
        id: raw.id ?? "",
        slug: raw.slug ?? "",
        name: raw.name ?? "",
        brand: raw.brand ?? "",
        categoryName: raw.category?.name ?? "",
        shortDescription: raw.shortDescription ?? "",
        thumbnail: raw.thumbnail ?? "",
        status: raw.status ?? "",
        featured: Boolean(raw.featured),
    }
}

export async function getAdminProducts(): Promise<AdminProductItem[]> {
    const res = await axiosClient.get("/admin/products")
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapAdminProduct)
}

export async function getAdminProductDetail(id: number | string) {
    const res = await axiosClient.get(`/admin/products/${id}`)
    return res.data
}

export async function createAdminProduct(payload: AdminProductPayload) {
    const res = await axiosClient.post("/admin/products", payload)
    return res.data
}

export async function updateAdminProduct(
    id: number | string,
    payload: AdminProductPayload
) {
    const res = await axiosClient.put(`/admin/products/${id}`, payload)
    return res.data
}

export async function deleteAdminProduct(id: number | string) {
    const res = await axiosClient.delete(`/admin/products/${id}`)
    return res.data
}

export async function getAdminCategories() {
    const res = await axiosClient.get("/admin/categories")
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map((item: RawAdminCategory) => ({
        id: item.id ?? "",
        name: item.name ?? "",
    })) as AdminCategorySummary[]
}