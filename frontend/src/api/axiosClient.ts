import axios from "axios"
import type { AuthUser } from "../types/auth"
import {
    clearAuth,
    getRefreshToken,
    getToken,
    setRefreshToken,
    setStoredUser,
    setToken,
} from "../utils/auth"
import { refreshAuthApi, type LoginResponse } from "./authApi"

const axiosClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
})

axiosClient.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined
        const status = error.response?.status
        const requestUrl = String(originalRequest?.url ?? "")

        const isAuthEndpoint = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/refresh")

        if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
            throw error
        }

        const refreshToken = getRefreshToken()
        if (!refreshToken) {
            clearAuth()
            throw error
        }

        originalRequest._retry = true

        try {
            const payload = (await refreshAuthApi({ refreshToken })) as LoginResponse
            const nested = payload.data ?? {}
            const newToken = payload.accessToken ?? payload.token ?? nested.accessToken ?? nested.token
            const newRefreshToken = payload.refreshToken ?? nested.refreshToken ?? refreshToken
            const rawRoles = payload.roles ?? nested.roles
            const role = Array.isArray(rawRoles) ? rawRoles[0] : rawRoles
            const user: AuthUser = {
                id: payload.userId ?? nested.userId,
                username: payload.username ?? nested.username,
                email: payload.email ?? nested.email,
                fullName: payload.fullName ?? nested.fullName ?? payload.username ?? nested.username,
                role: role ?? undefined,
            }

            if (!newToken) {
                clearAuth()
                throw error
            }

            setToken(String(newToken))
            setRefreshToken(String(newRefreshToken))
            setStoredUser(user)

            originalRequest.headers = originalRequest.headers ?? {}
            originalRequest.headers.Authorization = `Bearer ${newToken}`

            return axiosClient(originalRequest)
        } catch (refreshError) {
            clearAuth()
            throw refreshError
        }
    }
)

export default axiosClient