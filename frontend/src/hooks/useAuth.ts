import { useEffect, useState } from "react"
import type { AuthUser } from "../types/auth"
import { clearAuth, getStoredUser, getToken, setStoredUser } from "../utils/auth"
import { getMeApi } from "../api/authApi"

export function useAuth() {
    const [token, setTokenState] = useState<string | null>(getToken())
    const [user, setUser] = useState<AuthUser | null>(getStoredUser())
    const [loading, setLoading] = useState(Boolean(token && !user))

    useEffect(() => {
        const sync = async () => {
            const currentToken = getToken()
            if (!currentToken) {
                setTokenState(null)
                setUser(null)
                setLoading(false)
                return
            }

            setTokenState(currentToken)

            if (user) {
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
                setTokenState(null)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        sync()
    }, [user])

    const logout = () => {
        clearAuth()
        setTokenState(null)
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