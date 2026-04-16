import {useEffect, useMemo, useState, type ReactNode} from "react"
import {getAdminUsers, type AdminUserItem} from "../../api/adminUserApi"

function statusBadgeClass(status: string) {
    if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "INACTIVE") return "bg-slate-100 text-slate-600 border-slate-200"
    if (status === "PENDING") return "bg-amber-50 text-amber-700 border-amber-200"
    if (status === "BANNED") return "bg-rose-50 text-rose-700 border-rose-200"
    return "bg-slate-100 text-slate-600 border-slate-200"
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUserItem[]>([])
    const [keyword, setKeyword] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true)
                const data = await getAdminUsers()
                setUsers(data)
            } catch (error) {
                console.error(error)
                setUsers([])
            } finally {
                setLoading(false)
            }
        }

        void loadUsers()
    }, [])

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
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Dang tai danh sach user...</td>
            </tr>
        )
    } else if (filtered.length === 0) {
        tableRows = (
            <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Khong co user nao.</td>
            </tr>
        )
    } else {
        tableRows = filtered.map((item) => (
            <tr key={String(item.authUserId)} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-700">{item.authUserId}</td>
                <td className="px-4 py-3 text-slate-700">{item.email || "--"}</td>
                <td className="px-4 py-3 text-slate-700">{item.username || "--"}</td>
                <td className="px-4 py-3 text-slate-700">{item.fullName || "--"}</td>
                <td className="px-4 py-3 text-slate-700">{item.phone || "--"}</td>
                <td className="px-4 py-3">
                    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {item.role || "--"}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                        {item.status || "--"}
                    </span>
                </td>
            </tr>
        ))
    }

    return (
        <div className="space-y-5 pb-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900">Quan ly nguoi dung</h1>
                <p className="mt-1 text-sm text-slate-500">Du lieu lay tu endpoint admin user cua backend.</p>

                <div className="mt-4">
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Tim theo email, username, ho ten..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                </div>
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




