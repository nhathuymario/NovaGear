import axiosClient from "./axiosClient"

export interface AdminCategoryItem {
    id: number | string
    name: string
    slug: string
    active: boolean
}

export interface AdminCategoryPayload {
    name: string
    slug: string
    active?: boolean
}

type RawCategory = {
    id?: number | string
    name?: string
    slug?: string
    active?: boolean
}

function mapCategory(raw: RawCategory): AdminCategoryItem {
    return {
        id: raw.id ?? "",
        name: raw.name ?? "",
        slug: raw.slug ?? "",
        active: Boolean(raw.active),
    }
}

export async function getAdminCategories(): Promise<AdminCategoryItem[]> {
    const res = await axiosClient.get("/admin/categories")
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapCategory)
}

export async function createAdminCategory(payload: AdminCategoryPayload) {
    const res = await axiosClient.post("/admin/categories", payload)
    return res.data
}

export async function updateAdminCategory(
    id: number | string,
    payload: AdminCategoryPayload
) {
    const res = await axiosClient.put(`/admin/categories/${id}`, payload)
    return res.data
}

export async function deleteAdminCategory(id: number | string) {
    const res = await axiosClient.delete(`/admin/categories/${id}`)
    return res.data
}