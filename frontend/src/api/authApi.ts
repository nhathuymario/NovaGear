import axios from "axios"
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

export interface LoginResponse {
    token?: string
    accessToken?: string
    refreshToken?: string
    userId?: number | string
    username?: string
    email?: string
    fullName?: string
    roles?: string[] | string
    data?: {
        token?: string
        accessToken?: string
        refreshToken?: string
        userId?: number | string
        username?: string
        email?: string
        fullName?: string
        roles?: string[] | string
    }
}

export interface AuthMeResponse {
    id?: number | string
    username?: string
    name?: string
    email?: string
    fullName?: string
    role?: string
    roles?: string[] | string
}

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
    const res = await axiosClient.post("/auth/login", payload)
    return res.data as LoginResponse
}

export interface RefreshTokenRequest {
    refreshToken: string
}

export async function refreshAuthApi(payload: RefreshTokenRequest): Promise<LoginResponse> {
    const res = await axios.post("/api/auth/refresh", payload)
    return res.data as LoginResponse
}

export async function registerApi(payload: RegisterRequest): Promise<unknown> {
    const res = await axiosClient.post("/auth/register", payload)
    return res.data
}

export async function getMeApi(): Promise<AuthMeResponse> {
    // Thông thường Gateway/Auth trả về data bọc trong object
    const res = await axiosClient.get("/auth/me")
    return (res.data?.data || res.data) as AuthMeResponse
}

export function getGoogleAuthUrl(): string {
    const configuredUrl = import.meta.env.VITE_GOOGLE_AUTH_URL as string | undefined
    if (configuredUrl && configuredUrl.trim().length > 0) {
        return configuredUrl.trim()
    }

    // Default through Gateway so OAuth path stays aligned with FE -> Gateway flow.
    return "http://localhost:8089/api/oauth2/authorization/google"
}
