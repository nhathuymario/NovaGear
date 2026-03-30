import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerApi } from "../api/authApi"

export default function RegisterPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        fullName: "",
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
            await registerApi(form)
            navigate("/login")
        } catch {
            setError("Đăng ký thất bại")
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
                <h1 className="text-3xl font-bold">Đăng ký</h1>
                <p className="mt-2 text-sm text-brand-gray">Tạo tài khoản mới tại NovaGear</p>

                <div className="mt-6 space-y-4">
                    <input
                        type="text"
                        placeholder="Họ và tên"
                        className="w-full rounded-xl border px-4 py-3 outline-none"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
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
                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>

                <p className="mt-4 text-sm text-brand-gray">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="font-semibold text-blue-600">
                        Đăng nhập
                    </Link>
                </p>
            </form>
        </div>
    )
}