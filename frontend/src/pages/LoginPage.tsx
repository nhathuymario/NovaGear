import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMeApi, loginApi } from "../api/authApi"
import { setStoredUser, setToken } from "../utils/auth"

export default function LoginPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        username: "", // Đổi từ email sang username cho đồng bộ
        password: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setLoading(true)
            setError("")

            // Gửi trực tiếp form vì giờ key đã là 'username' khớp với API
            const data = await loginApi(form)

            // Kiểm tra token linh hoạt dựa trên cấu trúc response của ông
            const token = data.token || data.accessToken || data.data?.token

            if (!token) {
                throw new Error("Không nhận được token từ hệ thống")
            }

            setToken(token)

            try {
                const me = await getMeApi()
                setStoredUser({
                    id: me?.id,
                    username: me?.username, // Lưu username thay vì email
                    fullName: me?.fullName ?? me?.name ?? "Nguyễn Nhất Huy",
                    role: Array.isArray(me?.roles) ? me.roles[0] : me?.role,
                })
            } catch {
                // Fallback nếu getMe lỗi nhưng vẫn có token
                setStoredUser({
                    username: form.username,
                })
            }

            navigate("/")
        } catch (err: any) {
            // Lấy message lỗi từ UnifiedExceptionHandler của ông
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
                className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg animate-in fade-in duration-500"
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-brand-dark">Đăng nhập</h1>
                    <p className="mt-2 text-sm text-brand-gray">Chào mừng quay lại NovaGear</p>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-brand-gray ml-1">Tên đăng nhập</label>
                        <input
                            type="text"
                            placeholder="Nhập username của ông..."
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-brand-dark transition-all"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-brand-gray ml-1">Mật khẩu</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-brand-dark transition-all"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-xl bg-red-50 p-3 border border-red-100">
                        <p className="text-xs text-red-500 font-medium">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-8 w-full rounded-xl bg-brand-dark py-3.5 font-bold text-white shadow-md transition-all hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Đang xử lý...
                        </span>
                    ) : "Đăng nhập ngay"}
                </button>

                <p className="mt-6 text-center text-sm text-brand-gray">
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        Đăng ký ngay
                    </Link>
                </p>
            </form>
        </div>
    )
}