import { useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { getMeApi } from "../api/authApi"
import { setRefreshToken, setStoredUser, setToken } from "../utils/auth"

function normalizeRole(rawRole?: string | string[] | null): string {
    if (!rawRole) return "USER"
    const role = Array.isArray(rawRole) ? rawRole[0] : rawRole
    return String(role).replace("ROLE_", "").toUpperCase()
}

export default function OAuthCallbackPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const token = useMemo(
        () =>
            searchParams.get("token") ||
            searchParams.get("accessToken") ||
            searchParams.get("access_token") ||
            "",
        [searchParams]
    )

    const refreshToken = useMemo(
        () => searchParams.get("refreshToken") || searchParams.get("refresh_token") || "",
        [searchParams]
    )

    useEffect(() => {
        const completeOAuthLogin = async () => {
            if (!token) {
                navigate("/login?error=google_auth_failed", { replace: true })
                return
            }

            try {
                setToken(token)
                if (refreshToken) {
                    setRefreshToken(refreshToken)
                }

                const me = await getMeApi()
                setStoredUser({
                    id: me?.id,
                    username: me?.username,
                    email: me?.email,
                    fullName: me?.fullName ?? me?.name ?? me?.username,
                    role: normalizeRole(me?.roles ?? me?.role),
                })

                const normalizedRole = normalizeRole(me?.roles ?? me?.role)
                navigate(normalizedRole === "ADMIN" ? "/admin" : "/", { replace: true })
            } catch {
                navigate("/login?error=google_profile_failed", { replace: true })
            }
        }

        void completeOAuthLogin()
    }, [navigate, refreshToken, token])

    return (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">Dang xu ly dang nhap Google...</p>
        </div>
    )
}

