import axiosClient from "./axiosClient"

export type AdminUserItem = {
    authUserId: number | string
    email: string
    username: string
    fullName: string
    phone: string
    status: string
    role: string
}

type RawAdminUser = Partial<AdminUserItem>

function mapAdminUser(raw: RawAdminUser): AdminUserItem {
    return {
        authUserId: raw.authUserId ?? "",
        email: raw.email ?? "",
        username: raw.username ?? "",
        fullName: raw.fullName ?? "",
        phone: raw.phone ?? "",
        status: raw.status ?? "",
        role: raw.role ?? "",
    }
}

export async function getAdminUsers(): Promise<AdminUserItem[]> {
    const res = await axiosClient.get("/admin/users")
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapAdminUser)
}

