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

export type UpdateAdminUserStatusPayload = {
    enabled: boolean
}

type RawAdminUser = Partial<AdminUserItem>

function mapAdminUser(raw: RawAdminUser): AdminUserItem {
    const normalizedRole = String(raw.role ?? "")
        .replace("[", "")
        .replace("]", "")
        .replace(/^ROLE_/i, "")
        .trim()

    return {
        authUserId: raw.authUserId ?? "",
        email: raw.email ?? "",
        username: raw.username ?? "",
        fullName: raw.fullName ?? "",
        phone: raw.phone ?? "",
        status: String(raw.status ?? "ACTIVE").toUpperCase(),
        role: normalizedRole || "USER",
    }
}

export async function getAdminUsers(): Promise<AdminUserItem[]> {
    const res = await axiosClient.get("/admin/users")
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapAdminUser)
}

export async function updateAdminUserStatus(
    userId: number | string,
    payload: UpdateAdminUserStatusPayload
) {
    const res = await axiosClient.put(`/admin/users/${userId}/status`, payload)
    return res.data
}

