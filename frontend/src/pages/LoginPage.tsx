import {useState} from "react"
import {Link, useNavigate} from "react-router-dom"
import {getMeApi, loginApi} from "../api/authApi"
import {bootstrapMyProfile, getMyProfile} from "../api/userApi"
import {setStoredUser, setToken} from "../utils/auth"

function isAdminRole(role?: string | null) {
    if (!role) return false
    return role === "ADMIN" || role === "ROLE_ADMIN" || role.includes("ADMIN")
}

export default function LoginPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        username: "",
        password: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setLoading(true)
            setError("")

            const data = await loginApi(form)
            const token = data.token || data.accessToken || data.data?.token

            if (!token) {
                throw new Error("Không nhận được token từ hệ thống")
            }

            setToken(token)

            let authMe: any = null
            let profile: any = null
            let role: string | undefined

            try {
                authMe = await getMeApi()
                role = Array.isArray(authMe?.roles) ? authMe.roles[0] : authMe?.role
            } catch (err) {
                console.error(err)
            }

            try {
                await bootstrapMyProfile()
            } catch (err) {
                console.error(err)
            }

            try {
                profile = await getMyProfile()
            } catch (err) {
                console.error(err)
            }

            setStoredUser({
                id: authMe?.id ?? profile?.id,
                username: profile?.username ?? authMe?.username ?? form.username,
                email: profile?.email ?? authMe?.email,
                fullName: profile?.fullName ?? authMe?.fullName ?? authMe?.name ?? authMe?.username,
                role,
            })

            if (isAdminRole(role)) {
                navigate("/admin", {replace: true})
            } else {
                navigate("/", {replace: true})
            }

            window.location.reload()
        } catch (err: any) {
            console.error(err)
            const serverError = err.response?.data?.message || err.response?.data?.error
            setError(serverError || "Tên đăng nhập hoặc mật khẩu không đúng")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg"
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-brand-dark">Đăng nhập</h1>
                    <p className="mt-2 text-sm text-brand-gray">Chào mừng quay lại NovaGear</p>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="space-y-1">
                        <label className="ml-1 text-xs font-bold uppercase text-brand-gray">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập username..."
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
                            value={form.username}
                            onChange={(e) => setForm({...form, username: e.target.value})}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="ml-1 text-xs font-bold uppercase text-brand-gray">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
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
                    className="mt-8 w-full rounded-xl bg-brand-dark py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
                </button>

                <p className="mt-6 text-center text-sm text-brand-gray">
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="font-bold text-blue-600">
                        Đăng ký ngay
                    </Link>
                </p>
            </form>
        </div>
    )
}