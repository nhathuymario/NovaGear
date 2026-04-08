import { useCallback, useEffect, useState } from "react"
import type { AuthUser } from "../types/auth"
import { clearAuth, getStoredUser, getToken, onAuthChange, setStoredUser } from "../utils/auth"
import { getMeApi } from "../api/authApi"

export function useAuth() {
    const [token, setToken] = useState<string | null>(getToken())
    const [user, setUser] = useState<AuthUser | null>(getStoredUser())
    const [loading, setLoading] = useState(Boolean(token && !user))

    const syncAuth = useCallback(async () => {
        const currentToken = getToken()
        const currentUser = getStoredUser()

        if (!currentToken) {
            setToken(null)
            setUser(null)
            setLoading(false)
            return
        }

        setToken(currentToken)

        if (currentUser) {
            setUser(currentUser)
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const me = await getMeApi()
            const mappedUser: AuthUser = {
                id: me?.id,
                email: me?.email,
                fullName: me?.fullName ?? me?.name ?? me?.username,
                role: Array.isArray(me?.roles) ? me.roles[0] : me?.role,
            }
            setStoredUser(mappedUser)
            setUser(mappedUser)
        } catch {
            clearAuth()
            setToken(null)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void syncAuth()
    }, [syncAuth])

    useEffect(() => onAuthChange(() => {
        void syncAuth()
    }), [syncAuth])

    const logout = () => {
        clearAuth()
        setToken(null)
        setUser(null)
    }

    return {
        token,
        user,
        loading,
        isAuthenticated: Boolean(token),
        logout,
    }
}