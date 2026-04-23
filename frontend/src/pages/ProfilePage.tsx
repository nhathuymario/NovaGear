import {useEffect, useMemo, useState} from "react"
import {useNavigate} from "react-router-dom"
import {motion} from "framer-motion"

import {CircleUserRound, Mail, Phone, ShieldCheck, UserRound} from "lucide-react"
import {getOrBootstrapMyProfile, updateMyProfile, type UserProfile} from "../api/userApi"
import {useAuth} from "../hooks/useAuth"
import {setStoredUser} from "../utils/auth"
import {
    createSavedAddress,
    loadSavedAddresses,
    normalizePhone,
    persistSavedAddresses,
    type SavedAddress,
} from "../utils/addressBook"
import {ProfileSkeleton} from "../components/ui/Skeletons"

function isAdminRole(role?: string | null) {
    if (!role) return false
    return role === "ADMIN" || role === "ROLE_ADMIN" || role.includes("ADMIN")
}

export default function ProfilePage() {
    const navigate = useNavigate()
    const {user, loading, logout} = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
    })
    const [initialForm, setInitialForm] = useState({
        fullName: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
    })
    const userStorageKey = String(user?.id ?? user?.username ?? "guest")
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState("")
    const [addressForm, setAddressForm] = useState({
        label: "",
        receiverName: "",
        receiverPhone: "",
        shippingAddress: "",
        note: "",
    })
    const [addressError, setAddressError] = useState("")
    const [addressSuccess, setAddressSuccess] = useState("")
    const [isAddressBookOpen, setIsAddressBookOpen] = useState(false)

    const displayName = profile?.fullName || user?.fullName || user?.username || "Người dùng"
    const displayEmail = profile?.email || user?.email || "Chưa cập nhật"
    const displayUsername = profile?.username || user?.username || "Chưa cập nhật"
    const displayRole = user?.role || "USER"
    const hasChanges = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm])
    const selectedAddress = useMemo(
        () => savedAddresses.find((item) => item.id === selectedAddressId) ?? null,
        [savedAddresses, selectedAddressId]
    )

    const bindProfileToForm = (data: UserProfile | null) => {
        const next = {
            fullName: data?.fullName || "",
            phone: data?.phone || "",
            gender: data?.gender || "",
            dateOfBirth: data?.dateOfBirth || "",
        }
        setForm(next)
        setInitialForm(next)
    }

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setProfileLoading(true)
                const data = await getOrBootstrapMyProfile()
                setProfile(data)
                bindProfileToForm(data)
            } catch (err) {
                console.error(err)
                setProfile(null)
                bindProfileToForm(null)
            } finally {
                setProfileLoading(false)
            }
        }

        loadProfile()
    }, [])

    useEffect(() => {
        const addresses = loadSavedAddresses(userStorageKey)
        setSavedAddresses(addresses)
        setSelectedAddressId(addresses[0]?.id ?? "")
    }, [userStorageKey])

    const handleInputChange = (field: keyof typeof form, value: string) => {
        setErrorMessage("")
        setSuccessMessage("")
        setForm((prev) => ({...prev, [field]: value}))
    }

    const handleUpdateProfile = async () => {
        if (!hasChanges || saving) return

        try {
            setSaving(true)
            setErrorMessage("")
            setSuccessMessage("")

            const payload = {
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                gender: form.gender.trim(),
                dateOfBirth: form.dateOfBirth || undefined,
            }

            let updated: UserProfile
            try {
                updated = await updateMyProfile(payload)
            } catch {
                // Self-heal old accounts that do not have a profile row yet.
                await getOrBootstrapMyProfile()
                updated = await updateMyProfile(payload)
            }

            setProfile(updated)
            bindProfileToForm(updated)
            setStoredUser({
                id: user?.id,
                username: updated?.username || user?.username,
                email: updated?.email || user?.email,
                fullName: updated?.fullName || user?.fullName,
                role: user?.role,
            })
            setSuccessMessage("Cập nhật tài khoản thành công")
        } catch (error) {
            console.error(error)
            setErrorMessage("Không thể cập nhật tài khoản. Vui lòng thử lại.")
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate("/")
        globalThis.location.reload()
    }

    const handleAddAddress = () => {
        setAddressError("")
        setAddressSuccess("")

        if (!addressForm.receiverName.trim() || !normalizePhone(addressForm.receiverPhone) || !addressForm.shippingAddress.trim()) {
            setAddressError("Điền đủ người nhận, số điện thoại và địa chỉ trước khi thêm")
            return
        }

        const newAddress = createSavedAddress({
            label: addressForm.label,
            receiverName: addressForm.receiverName,
            receiverPhone: addressForm.receiverPhone,
            shippingAddress: addressForm.shippingAddress,
            note: addressForm.note,
        })

        const next = [
            newAddress,
            ...savedAddresses.map((item) => ({...item, isDefault: false})),
        ]

        persistSavedAddresses(userStorageKey, next)
        setSavedAddresses(next)
        setSelectedAddressId(newAddress.id)
        setAddressForm({
            label: "",
            receiverName: "",
            receiverPhone: "",
            shippingAddress: "",
            note: "",
        })
        setAddressSuccess("Đã thêm địa chỉ mới")
    }

    const handleDeleteAddress = (addressId: string) => {
        setAddressError("")
        setAddressSuccess("")

        const next = savedAddresses
            .filter((item) => item.id !== addressId)
            .map((item, index) => ({
                ...item,
                isDefault: index === 0,
            }))

        persistSavedAddresses(userStorageKey, next)
        setSavedAddresses(next)
        setSelectedAddressId(next[0]?.id ?? "")
        setAddressSuccess("Đã xóa địa chỉ")
    }

    if (loading || profileLoading) {
        return <ProfileSkeleton />
    }

    return (
        <motion.div
            initial={{opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.28}}
            className="mx-auto max-w-5xl space-y-6"
        >
            <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
                <h1 className="text-3xl font-black text-slate-900">Tài khoản của tôi</h1>
                <p className="mt-2 text-sm text-brand-gray">
                    Quản lý thông tin cá nhân và trạng thái đăng nhập.
                </p>

                <div className="mt-5 flex items-center gap-4 rounded-[28px] bg-slate-50 p-4">
                    <div className="rounded-full bg-slate-900 p-3 text-white">
                        <CircleUserRound className="h-6 w-6"/>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-slate-900">{displayName}</p>
                        <p className="text-sm text-slate-500">{displayEmail}</p>
                    </div>
                </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <section className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
                        <button
                            type="button"
                            onClick={handleUpdateProfile}
                            disabled={!hasChanges || saving}
                            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {saving ? "Dang luu..." : "Luu thay doi"}
                        </button>
                    </div>

                    <p className="text-sm text-slate-500">Chinh sua truc tiep cac truong ben duoi, sau do bam Luu thay
                        doi.</p>

                    {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}
                    {successMessage ? <p className="text-sm font-medium text-emerald-600">{successMessage}</p> : null}

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[24px] bg-gray-50 p-4">
                            <p className="inline-flex items-center gap-1 text-sm text-brand-gray">
                                <UserRound className="h-4 w-4"/>
                                Username
                            </p>
                            <p className="mt-1 font-semibold">
                                {displayUsername}
                            </p>
                        </div>

                        <div className="rounded-[24px] bg-gray-50 p-4">
                            <p className="inline-flex items-center gap-1 text-sm text-brand-gray">
                                <Mail className="h-4 w-4"/>
                                Email
                            </p>
                            <p className="mt-1 font-semibold">
                                {displayEmail}
                            </p>
                        </div>

                        <label className="rounded-[24px] bg-gray-50 p-4">
                            <p className="text-sm text-brand-gray">Họ và tên</p>
                            <input
                                type="text"
                                value={form.fullName}
                                onChange={(event) => handleInputChange("fullName", event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold outline-none transition focus:border-slate-400"
                                placeholder="Nhập họ và tên"
                            />
                        </label>

                        <label className="rounded-[24px] bg-gray-50 p-4">
                            <p className="inline-flex items-center gap-1 text-sm text-brand-gray">
                                <Phone className="h-4 w-4"/>
                                Số điện thoại
                            </p>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={(event) => handleInputChange("phone", event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold outline-none transition focus:border-slate-400"
                                placeholder="Nhập số điện thoại"
                            />
                        </label>

                        <label className="rounded-[24px] bg-gray-50 p-4">
                            <p className="text-sm text-brand-gray">Gioi tinh</p>
                            <input
                                type="text"
                                value={form.gender}
                                onChange={(event) => handleInputChange("gender", event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold outline-none transition focus:border-slate-400"
                                placeholder="VD: Nam / Nữ"
                            />
                        </label>

                        <label className="rounded-[24px] bg-gray-50 p-4">
                            <p className="text-sm text-brand-gray">Ngày sinh</p>
                            <input
                                type="date"
                                value={form.dateOfBirth}
                                onChange={(event) => handleInputChange("dateOfBirth", event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold outline-none transition focus:border-slate-400"
                            />
                        </label>

                        <div className="rounded-[24px] bg-gray-50 p-4">
                            <p className="inline-flex items-center gap-1 text-sm text-brand-gray">
                                <ShieldCheck className="h-4 w-4"/>
                                Vai trò
                            </p>
                            <p className="mt-1 font-semibold">
                                {displayRole}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                        <button
                            type="button"
                            onClick={() => setIsAddressBookOpen((prev) => !prev)}
                            aria-expanded={isAddressBookOpen}
                            aria-controls="profile-address-book"
                            className="flex w-full items-center justify-between gap-3 text-left"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Sổ địa chỉ giao hàng</h3>
                                <p className="text-xs text-slate-500">Bấm để mở và quản lý địa chỉ.</p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                                {isAddressBookOpen ? "Thu gọn" : "Mở ra"}
                            </span>
                        </button>

                        {isAddressBookOpen && (
                            <div id="profile-address-book" className="mt-4 space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <input
                                        type="text"
                                        placeholder="Nhãn địa chỉ (Nhà riêng, Công ty...)"
                                        value={addressForm.label}
                                        onChange={(e) => setAddressForm((prev) => ({...prev, label: e.target.value}))}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Người nhận"
                                        value={addressForm.receiverName}
                                        onChange={(e) => setAddressForm((prev) => ({...prev, receiverName: e.target.value}))}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Số điện thoại"
                                        value={addressForm.receiverPhone}
                                        onChange={(e) => setAddressForm((prev) => ({...prev, receiverPhone: e.target.value}))}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Ghi chú (không bắt buộc)"
                                        value={addressForm.note}
                                        onChange={(e) => setAddressForm((prev) => ({...prev, note: e.target.value}))}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                                    />
                                    <textarea
                                        placeholder="Địa chỉ giao hàng"
                                        value={addressForm.shippingAddress}
                                        onChange={(e) => setAddressForm((prev) => ({...prev, shippingAddress: e.target.value}))}
                                        className="min-h-[90px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none sm:col-span-2"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddAddress}
                                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Thêm địa chỉ
                                </button>

                                {addressError ? <p className="text-sm text-red-600">{addressError}</p> : null}
                                {addressSuccess ? <p className="text-sm text-emerald-600">{addressSuccess}</p> : null}

                                {savedAddresses.length === 0 ? (
                                    <p className="text-sm text-slate-500">Chưa có địa chỉ nào.</p>
                                ) : (
                                    <div className="grid gap-2">
                                        {savedAddresses.map((item) => (
                                            <div
                                                key={item.id}
                                                    className={`rounded-2xl border bg-white p-3 ${item.id === selectedAddressId ? "border-slate-900" : "border-slate-200"}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{item.label} {item.isDefault ? "(Mặc định)" : ""}</p>
                                                        <p className="text-sm text-slate-600">{item.receiverName} - {item.receiverPhone}</p>
                                                        <p className="text-sm text-slate-600">{item.shippingAddress}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedAddressId(item.id)}
                                                            className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600"
                                                        >
                                                            Chọn
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteAddress(item.id)}
                                                            className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedAddress ? (
                                    <p className="text-xs text-slate-500">Địa chỉ đang chọn cho checkout: <span className="font-semibold text-slate-700">{selectedAddress.label}</span></p>
                                ) : null}
                            </div>
                        )}
                    </div>
                </section>

                <aside className="h-fit rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
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
        </motion.div>
    )
}