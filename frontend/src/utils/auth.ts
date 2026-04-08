import type { AuthUser } from "../types/auth"

const TOKEN_KEY = "token"
const REFRESH_TOKEN_KEY = "refresh_token"
const USER_KEY = "auth_user"
const AUTH_EVENT = "novagear-auth-changed"

function emitAuthChange() {
    if (typeof window === "undefined") return
    window.dispatchEvent(new Event(AUTH_EVENT))
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
    emitAuthChange()
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(refreshToken: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    emitAuthChange()
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY)
    emitAuthChange()
}

export function removeRefreshToken() {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    emitAuthChange()
}

export function getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null

    try {
        return JSON.parse(raw) as AuthUser
    } catch {
        return null
    }
}

export function setStoredUser(user: AuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    emitAuthChange()
}

export function removeStoredUser() {
    localStorage.removeItem(USER_KEY)
    emitAuthChange()
}

export function clearAuth() {
    removeToken()
    removeStoredUser()
    removeRefreshToken()
}

export function onAuthChange(handler: () => void) {
    if (typeof window === "undefined") {
        return () => undefined
    }

    window.addEventListener(AUTH_EVENT, handler)
    window.addEventListener("storage", handler)

    return () => {
        window.removeEventListener(AUTH_EVENT, handler)
        window.removeEventListener("storage", handler)
    }
}