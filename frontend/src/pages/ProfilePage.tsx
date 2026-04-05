import {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {getMyProfile, type UserProfile} from "../api/userApi"
import {useAuth} from "../hooks/useAuth"

function isAdminRole(role?: string | null) {
    if (!role) return false
    return role === "ADMIN" || role === "ROLE_ADMIN" || role.includes("ADMIN")
}

export default function ProfilePage() {
    const navigate = useNavigate()
    const {user, loading, logout} = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [profileLoading, setProfileLoading] = useState(true)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setProfileLoading(true)
                const data = await getMyProfile()
                setProfile(data)
            } catch (err) {
                console.error(err)
                setProfile(null)
            } finally {
                setProfileLoading(false)
            }
        }

        loadProfile()
    }, [])

    const handleLogout = () => {
        logout()
        navigate("/")
        window.location.reload()
    }

    if (loading || profileLoading) {
        return <div>Đang tải thông tin tài khoản...</div>
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h1 className="text-3xl font-bold">Tài khoản của tôi</h1>
                <p className="mt-2 text-sm text-brand-gray">
                    Quản lý thông tin cá nhân và trạng thái đăng nhập.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_320px]">
                <section className="rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold">Thông tin cá nhân</h2>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-sm text-brand-gray">Username</p>
                            <p className="mt-1 font-semibold">
                                {profile?.username || user?.username || "Chưa cập nhật"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-sm text-brand-gray">Email</p>
                            <p className="mt-1 font-semibold">
                                {profile?.email || user?.email || "Chưa cập nhật"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-sm text-brand-gray">Họ và tên</p>
                            <p className="mt-1 font-semibold">
                                {profile?.fullName || user?.fullName || "Chưa cập nhật"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-sm text-brand-gray">Vai trò</p>
                            <p className="mt-1 font-semibold">
                                {user?.role || "USER"}
                            </p>
                        </div>
                    </div>
                </section>

                <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold">Thao tác nhanh</h2>

                    <div className="mt-4 space-y-3">
                        {isAdminRole(user?.role) && (
                            <button
                                onClick={() => navigate("/admin")}
                                className="w-full rounded-xl border px-4 py-3 text-left font-semibold"
                            >
                                Đi tới Admin Dashboard
                            </button>
                        )}

                        <button
                            onClick={() => navigate("/orders")}
                            className="w-full rounded-xl border px-4 py-3 text-left font-semibold"
                        >
                            Xem đơn hàng của tôi
                        </button>

                        <button
                            onClick={() => navigate("/cart")}
                            className="w-full rounded-xl border px-4 py-3 text-left font-semibold"
                        >
                            Đi tới giỏ hàng
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full rounded-xl bg-brand-dark px-4 py-3 font-semibold text-white"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    )
}