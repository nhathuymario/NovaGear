import {useCallback, useEffect, useMemo, useState, type ReactNode} from "react"
import {AlertTriangle, RefreshCw} from "lucide-react"
import axios from "axios"
import {getAdminUsers, type AdminUserItem, updateAdminUserStatus} from "../../api/adminUserApi"
import {useAuth} from "../../hooks/useAuth"

function statusBadgeClass(status: string) {
    if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "INACTIVE") return "bg-slate-100 text-slate-600 border-slate-200"
    if (status === "PENDING") return "bg-amber-50 text-amber-700 border-amber-200"
    if (status === "BANNED") return "bg-rose-50 text-rose-700 border-rose-200"
    return "bg-slate-100 text-slate-600 border-slate-200"
}

function roleBadgeClass(role: string) {
    if (role === "ADMIN") return "border-indigo-200 bg-indigo-50 text-indigo-700"
    if (role === "STAFF") return "border-cyan-200 bg-cyan-50 text-cyan-700"
    return "border-blue-200 bg-blue-50 text-blue-700"
}

export default function AdminUsersPage() {
    const {user} = useAuth()
    const [users, setUsers] = useState<AdminUserItem[]>([])
    const [keyword, setKeyword] = useState("")
    const [loading, setLoading] = useState(true)
    const [errorText, setErrorText] = useState<string | null>(null)
    const [savingUserId, setSavingUserId] = useState<number | string | null>(null)

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true)
            setErrorText(null)
            const data = await getAdminUsers()
            setUsers(data)
        } catch (error) {
            console.error(error)
            setUsers([])

            if (axios.isAxiosError(error)) {
                const status = error.response?.status
                const serverMessage =
                    (error.response?.data as {message?: string} | undefined)?.message ||
                    error.message

                if (status === 500) {
                    setErrorText(`API /api/admin/users dang loi 500. ${serverMessage}. Hay restart User service (8082) va Gateway (8089), sau do thu lai.`)
                } else {
                    setErrorText(`Khong tai duoc danh sach user (${status ?? "no-status"}): ${serverMessage}`)
                }
            } else {
                setErrorText("Khong tai duoc danh sach user. Vui long thu lai.")
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadUsers()
    }, [loadUsers])

    const handleToggleUserStatus = async (target: AdminUserItem) => {
        const nextEnabled = target.status !== "ACTIVE"
        const targetId = target.authUserId

        if (String(targetId) === String(user?.id)) {
            setErrorText("Khong the tu khoa tai khoan admin dang dang nhap.")
            return
        }

        try {
            setSavingUserId(targetId)
            await updateAdminUserStatus(targetId, {enabled: nextEnabled})

            setUsers((prev) =>
                prev.map((item) =>
                    item.authUserId === targetId
                        ? {...item, status: nextEnabled ? "ACTIVE" : "INACTIVE"}
                        : item
                )
            )
        } catch (error) {
            console.error(error)
            if (axios.isAxiosError(error)) {
                const serverMessage =
                    (error.response?.data as {message?: string} | undefined)?.message ||
                    error.message
                setErrorText(`Khong cap nhat duoc trang thai user: ${serverMessage}`)
            } else {
                setErrorText("Khong cap nhat duoc trang thai user. Vui long thu lai.")
            }
        } finally {
            setSavingUserId(null)
        }
    }

    const filtered = useMemo(() => {
        const q = keyword.trim().toLowerCase()
        if (!q) return users

        return users.filter((item) =>
            [item.email, item.username, item.fullName, item.phone, item.role, item.status]
                .join(" ")
                .toLowerCase()
                .includes(q)
        )
    }, [keyword, users])

    let tableRows: ReactNode

    if (loading) {
        tableRows = (
            <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">Dang tai danh sach user...</td>
            </tr>
        )
    } else if (filtered.length === 0) {
        tableRows = (
            <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">Khong co user nao.</td>
            </tr>
        )
    } else {
        tableRows = filtered.map((item) => {
            const isSaving = savingUserId === item.authUserId
            const isActive = item.status === "ACTIVE"

            let actionLabel = "Mo khoa"
            if (isSaving) {
                actionLabel = "Dang luu..."
            } else if (isActive) {
                actionLabel = "Khoa"
            }

            const buttonClass = isActive
                ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"

            return (
                <tr key={String(item.authUserId)} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-700">{item.authUserId}</td>
                <td className="px-4 py-3 text-slate-700">{item.email || "--"}</td>
                <td className="px-4 py-3 text-slate-700">{item.username || "--"}</td>
                <td className="px-4 py-3 text-slate-700">{item.fullName || "--"}</td>
                <td className="px-4 py-3 text-slate-700">{item.phone || "--"}</td>
                <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(item.role)}`}>
                        {item.role || "--"}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                        {item.status || "--"}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <button
                        disabled={savingUserId === item.authUserId || String(item.authUserId) === String(user?.id)}
                        onClick={() => void handleToggleUserStatus(item)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}
                    >
                        {actionLabel}
                    </button>
                </td>
            </tr>
            )
        })
    }

    return (
        <div className="space-y-5 pb-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900">Quan ly nguoi dung</h1>
                <p className="mt-1 text-sm text-slate-500">Du lieu lay tu endpoint admin user cua backend. Co the khoa/mo khoa tai khoan tai bang ben duoi.</p>

                <div className="mt-4">
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Tim theo email, username, ho ten..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                </div>

                {errorText ? (
                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                        <div className="flex items-start gap-2 text-sm text-rose-700">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0"/>
                            <p>{errorText}</p>
                        </div>
                        <button
                            onClick={() => void loadUsers()}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                            <RefreshCw className="h-3.5 w-3.5"/>
                            Thu lai
                        </button>
                    </div>
                ) : null}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Username</th>
                            <th className="px-4 py-3">Ho ten</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Thao tac</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tableRows}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}




