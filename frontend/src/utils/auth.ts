import type { AuthState, AuthUser } from "../types/auth"

const TOKEN_KEY = "token"
const USER_KEY = "auth_user"

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY)
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
}

export function removeStoredUser() {
    localStorage.removeItem(USER_KEY)
}

export function getAuthState(): AuthState {
    return {
        token: getToken(),
        user: getStoredUser(),
    }
}

export function clearAuth() {
    removeToken()
    removeStoredUser()
}