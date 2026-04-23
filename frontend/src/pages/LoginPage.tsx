import {useState, type SyntheticEvent} from "react"
import {Link, useNavigate, useSearchParams} from "react-router-dom"
import {ArrowRight, KeyRound, Mail, Sparkles, ShieldCheck} from "lucide-react"
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
        globalThis.location.href = getGoogleAuthUrl()
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
        <div className="min-h-screen px-4 py-10 md:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/10 md:p-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,212,0,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_28%)]" />
                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/75 backdrop-blur">
                            <Sparkles className="h-4 w-4 text-brand-yellow" />
                            NovaGear Secure Login
                        </div>

                        <div className="space-y-4">
                            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-5xl">
                                Đăng nhập nhanh, mua sắm mượt, quản lý tài khoản gọn gàng
                            </h1>
                            <p className="max-w-xl text-sm leading-7 text-slate-200 md:text-base">
                                Giao diện được làm sáng hơn, rõ hierarchy hơn và tối ưu cho cả đăng nhập thường lẫn Google.
                                Các trạng thái lỗi cũng hiển thị rõ ràng để bạn dễ xử lý hơn.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {[
                                ["Bảo mật", "Xác thực tài khoản an toàn"],
                                ["Nhanh", "Đăng nhập ít bước hơn"],
                                ["Tiện", "Tự động điều hướng đúng vai trò"],
                            ].map(([title, description]) => (
                                <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                        <ShieldCheck className="h-4 w-4 text-brand-yellow" />
                                        {title}
                                    </div>
                                    <p className="mt-1 text-xs leading-5 text-slate-200/80">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-8"
                >
                    <div className="text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-blue">
                            Welcome back
                        </p>
                        <h2 className="mt-2 text-3xl font-black text-slate-900">Đăng nhập</h2>
                        <p className="mt-2 text-sm text-slate-500">Chào mừng quay lại NovaGear</p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="login-username" className="ml-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                Tên đăng nhập
                            </label>
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-brand-blue focus-within:bg-white focus-within:shadow-md">
                                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                                <input
                                    id="login-username"
                                    type="text"
                                    placeholder="Nhập username hoặc email..."
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                                    value={form.username}
                                    onChange={(e) => setForm({...form, username: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="login-password" className="ml-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                Mật khẩu
                            </label>
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-brand-blue focus-within:bg-white focus-within:shadow-md">
                                <KeyRound className="h-4 w-4 shrink-0 text-slate-400" />
                                <input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                                    value={form.password}
                                    onChange={(e) => setForm({...form, password: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-600">{error}</p>
                        </div>
                    )}

                    {!error && oauthError && (
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm font-medium text-amber-800">
                                Đăng nhập Google chưa hoàn tất. Vui lòng thử lại.
                            </p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                    >
                        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.239 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.841 1.153 7.955 3.045l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.841 1.153 7.955 3.045l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.148 35.091 26.715 36 24 36c-5.218 0-9.621-3.319-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.793 2.657-2.448 4.917-4.693 6.57l.003-.002 6.19 5.238C36.365 40.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"/>
                        </svg>
                        Đăng nhập bằng Google
                    </button>

                    <div className="mt-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200"/>
                        <span className="text-xs uppercase tracking-wide text-slate-400">hoặc</span>
                        <div className="h-px flex-1 bg-slate-200"/>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3.5 font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {loading ? "Đang xử lý..." : (
                            <>
                                Đăng nhập ngay
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Chưa có tài khoản?{" "}
                        <Link to="/register" className="font-bold text-brand-blue hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}