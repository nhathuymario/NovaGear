import axios from "axios"
import axiosClient from "./axiosClient"

export interface UserProfile {
    id?: number | string
    username?: string
    email?: string
    fullName?: string
    phone?: string
    gender?: string
    dateOfBirth?: string
    avatarUrl?: string
}

export interface UpdateProfilePayload {
    fullName?: string
    email?: string
    phone?: string
    gender?: string
    dateOfBirth?: string
    avatarUrl?: string
}

export async function bootstrapMyProfile() {
    const res = await axiosClient.post("/users/me/bootstrap")
    return res.data
}

export async function getMyProfile() {
    const res = await axiosClient.get("/users/me")
    return res.data as UserProfile
}

export async function getOrBootstrapMyProfile() {
    try {
        return await getMyProfile()
    } catch (error) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined
        if (status !== 404) {
            throw error
        }

        await bootstrapMyProfile()
        return await getMyProfile()
    }
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
    const res = await axiosClient.put("/users/me", payload)
    return res.data as UserProfile
}