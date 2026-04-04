import axiosClient from "./axiosClient"

export interface LoginRequest {
    username: string
    password: string
}

export interface RegisterRequest {
    username: string
    fullName: string
    email: string
    password: string
}

export async function loginApi(payload: LoginRequest) {
    const res = await axiosClient.post("/auth/login", payload)
    return res.data
}

export async function registerApi(payload: RegisterRequest) {
    const res = await axiosClient.post("/auth/register", payload)
    return res.data
}

export async function getMeApi() {
    // Thông thường Gateway/Auth trả về data bọc trong object
    const res = await axiosClient.get("/auth/me")
    return res.data?.data || res.data
}