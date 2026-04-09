import {useState, type SyntheticEvent} from "react"
import {Link, useNavigate, useSearchParams} from "react-router-dom"
import {getGoogleAuthUrl, getMeApi, loginApi} from "../api/authApi"
import {bootstrapMyProfile, getMyProfile, type UserProfile} from "../api/userApi"
import {setRefreshToken, setStoredUser, setToken} from "../utils/auth"

type AuthIdentity = {
    id?: number | string
    username?: string
    email?: string
    fullName?: string
    role?: string
    roles?: string[] | string
}

type LoginResponseLike = AuthIdentity & {
    token?: string
    accessToken?: string
    refreshToken?: string
    userId?: number | string
    data?: AuthIdentity & {
        token?: string
        accessToken?: string
        refreshToken?: string
        userId?: number | string
    }
}

type ApiErrorLike = {
    response?: {
        data?: {
            message?: string
            error?: string
        }
    }
}

// Chuẩn hóa kiểm tra Role: Chấp nhận ADMIN, ROLE_ADMIN hoặc mảng chứa chúng
function getNormalizedRole(authData: AuthIdentity | null | undefined): string {
    const rawRole = Array.isArray(authData?.roles) ? authData.roles[0] : (authData?.role || authData?.roles)
    return rawRole ? String(rawRole).replace("ROLE_", "").toUpperCase() : "USER"
}

export default function LoginPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [form, setForm] = useState({
        username: "",
        password: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const oauthError = searchParams.get("error")

    const handleGoogleLogin = () => {
        window.location.href = getGoogleAuthUrl()
    }

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            setLoading(true)
            setError("")

            // 1. Đăng nhập lấy Token
            const res = await loginApi(form) as LoginResponseLike
            const token = res.token || res.accessToken || res.data?.token || res.data?.accessToken
            const refreshToken = res.refreshToken || res.data?.refreshToken

            if (!token) {
                setError("Hệ thống không trả về Token xác thực")
                return
            }

            // Lưu Token vào LocalStorage ngay lập tức
            setToken(token)
            if (refreshToken) {
                setRefreshToken(refreshToken)
            }

            // 2. Lấy thông tin tài khoản và Profile
            let authMe: AuthIdentity | null = null
            let profile: UserProfile | null = null

            const loginIdentity: AuthIdentity = {
                id: res.userId ?? res.data?.id,
                username: res.username ?? res.data?.username,
                email: res.email ?? res.data?.email,
                roles: res.roles ?? res.data?.roles,
            }

            try {
                // Gọi song song để tiết kiệm thời gian
                const [meRes] = await Promise.all([
                    getMeApi(),
                    bootstrapMyProfile().catch(() => null) // Tạo profile nếu chưa có
                ])
                authMe = meRes
                profile = await getMyProfile().catch(() => null)
            } catch (err) {
                console.warn("Không thể lấy đầy đủ Profile thông qua Gateway:", err)
            }

            // 3. Chuẩn hóa Role để AdminRoute không bị lỗi
            const finalRole = getNormalizedRole(loginIdentity ?? authMe ?? profile)

            // 4. Lưu User vào LocalStorage
            setStoredUser({
                id: loginIdentity.id ?? authMe?.id ?? profile?.id,
                username: loginIdentity.username ?? authMe?.username ?? profile?.username ?? form.username,
                email: loginIdentity.email ?? authMe?.email ?? profile?.email,
                fullName: profile?.fullName ?? authMe?.fullName ?? loginIdentity.fullName ?? "Nguyễn Nhất Huy",
                role: finalRole,
            })

            // 5. Điều hướng dựa trên Role
            if (finalRole === "ADMIN") {
                navigate("/admin", {replace: true})
            } else {
                navigate("/", {replace: true})
            }


        } catch (err: unknown) {
            console.error("Login Error:", err)
            const serverError = (err as ApiErrorLike).response?.data?.message || (err as ApiErrorLike).response?.data?.error
            setError(serverError || "Tên đăng nhập hoặc mật khẩu không đúng")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg animate-in fade-in duration-500"
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-brand-dark">Đăng nhập</h1>
                    <p className="mt-2 text-sm text-brand-gray">Chào mừng quay lại NovaGear</p>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="login-username" className="ml-1 text-xs font-bold uppercase text-brand-gray">Tên đăng nhập</label>
                        <input
                            id="login-username"
                            type="text"
                            placeholder="Nhập username..."
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-brand-dark transition-all"
                            value={form.username}
                            onChange={(e) => setForm({...form, username: e.target.value})}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="login-password" className="ml-1 text-xs font-bold uppercase text-brand-gray">Mật khẩu</label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-brand-dark transition-all"
                            value={form.password}
                            onChange={(e) => setForm({...form, password: e.target.value})}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                        <p className="text-xs font-medium text-red-500">{error}</p>
                    </div>
                )}

                {!error && oauthError && (
                    <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3">
                        <p className="text-xs font-medium text-amber-700">
                            Dang nhap Google chua hoan tat. Vui long thu lai.
                        </p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.239 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.841 1.153 7.955 3.045l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.841 1.153 7.955 3.045l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.148 35.091 26.715 36 24 36c-5.218 0-9.621-3.319-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.793 2.657-2.448 4.917-4.693 6.57l.003-.002 6.19 5.238C36.365 40.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"/>
                    </svg>
                    Dang nhap bang Google
                </button>

                <div className="mt-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200"/>
                    <span className="text-xs uppercase tracking-wide text-slate-400">hoac</span>
                    <div className="h-px flex-1 bg-slate-200"/>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-8 w-full rounded-xl bg-brand-dark py-3.5 font-bold text-white shadow-md transition-all hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
                </button>

                <p className="mt-6 text-center text-sm text-brand-gray">
                    Chưa có tài khoản? <Link to="/register" className="font-bold text-blue-600 hover:underline">Đăng ký
                    ngay</Link>
                </p>
            </form>
        </div>
    )
}