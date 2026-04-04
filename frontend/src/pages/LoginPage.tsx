import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMeApi, loginApi } from "../api/authApi"
import { setStoredUser, setToken } from "../utils/auth"

export default function LoginPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        email: "",
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
            const token = data.token || data.accessToken

            if (!token) {
                throw new Error("Không nhận được token")
            }

            setToken(token)

            try {
                const me = await getMeApi()
                setStoredUser({
                    id: me?.id,
                    email: me?.email,
                    fullName: me?.fullName ?? me?.name ?? me?.username,
                    role: Array.isArray(me?.roles) ? me.roles[0] : me?.role,
                })
            } catch {
                setStoredUser({
                    email: form.email,
                })
            }

            navigate("/")
            window.location.reload()
        } catch {
            setError("Đăng nhập thất bại")
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
                <h1 className="text-3xl font-bold">Đăng nhập</h1>
                <p className="mt-2 text-sm text-brand-gray">Chào mừng quay lại NovaGear</p>

                <div className="mt-6 space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full rounded-xl border px-4 py-3 outline-none"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        className="w-full rounded-xl border px-4 py-3 outline-none"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                </div>

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-brand-dark py-3 font-semibold text-white"
                >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <p className="mt-4 text-sm text-brand-gray">
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="font-semibold text-blue-600">
                        Đăng ký
                    </Link>
                </p>
            </form>
        </div>
    )
}