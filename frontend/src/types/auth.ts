export interface AuthUser {
    id?: number | string
    email?: string
    fullName?: string
    role?: string
}

export interface AuthState {
    token: string | null
    user: AuthUser | null
}