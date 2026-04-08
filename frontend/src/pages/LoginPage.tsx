import {useState, type SyntheticEvent} from "react"
import {Link, useNavigate} from "react-router-dom"
import {getMeApi, loginApi} from "../api/authApi"
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
    const [form, setForm] = useState({
        username: "",
        password: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

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