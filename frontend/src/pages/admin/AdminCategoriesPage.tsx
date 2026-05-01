import { useEffect, useMemo, useState } from "react"
import {
    createAdminCategory,
    deleteAdminCategory,
    getAdminCategories,
    updateAdminCategory,
    type AdminCategoryItem,
    type AdminCategoryPayload,
} from "../../api/adminCategoryApi"

const initialForm: AdminCategoryPayload = {
    name: "",
    slug: "",
    active: true,
}

export default function AdminCategoriesPage() {
    const [items, setItems] = useState<AdminCategoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState("")
    const [openForm, setOpenForm] = useState(false)
    const [editingId, setEditingId] = useState<number | string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState<AdminCategoryPayload>(initialForm)

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await getAdminCategories()
            setItems(data)
        } catch (error) {
            console.error(error)
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const filteredItems = useMemo(() => {
        const q = keyword.trim().toLowerCase()
        if (!q) return items

        return items.filter((item) => {
            const name = item.name.toLowerCase()
            const slug = item.slug.toLowerCase()
            return name.includes(q) || slug.includes(q)
        })
    }, [items, keyword])

    const resetForm = () => {
        setForm(initialForm)
        setEditingId(null)
        setOpenForm(false)
    }

    const handleCreate = () => {
        setForm(initialForm)
        setEditingId(null)
        setOpenForm(true)
    }

    const handleEdit = (item: AdminCategoryItem) => {
        setForm({
            name: item.name,
            slug: item.slug,
            active: item.active,
        })
        setEditingId(item.id)
        setOpenForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setSubmitting(true)
            if (editingId) {
                await updateAdminCategory(editingId, form)
            } else {
                await createAdminCategory(form)
            }
            await loadData()
            resetForm()
            alert(editingId ? "Cập nhật category thành công" : "Tạo category thành công")
        } catch (error) {
            console.error(error)
            alert("Lưu category thất bại")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number | string) => {
        if (!window.confirm("Bạn có chắc muốn xóa category này?")) return

        try {
            await deleteAdminCategory(id)
            await loadData()
            alert("Xóa category thành công")
        } catch (error) {
            console.error(error)
            alert("Xóa category thất bại")
        }
    }

    if (loading) return (
        <div className="flex h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-accent border-t-transparent" />
        </div>
    )

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Quản lý danh mục</h1>
                    <p className="mt-0.5 text-sm text-slate-500">Tạo, chỉnh sửa và xóa category.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                >
                    + Thêm danh mục
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm theo tên / slug..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
            </div>

            {openForm && (
                <form
                    onSubmit={handleSubmit}
                    className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
                >
                    <input
                        type="text"
                        placeholder="Tên danh mục"
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Slug"
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    />

                    <label className="flex items-center gap-2 rounded-xl border px-4 py-3 md:col-span-2">
                        <input
                            type="checkbox"
                            checked={Boolean(form.active)}
                            onChange={(e) => setForm({ ...form, active: e.target.checked })}
                        />
                        <span>Đang hoạt động</span>
                    </label>

                    <div className="flex gap-3 md:col-span-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {submitting
                                ? "Đang lưu..."
                                : editingId
                                    ? "Cập nhật danh mục"
                                    : "Tạo danh mục"}
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead>
                        <tr className="bg-slate-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tên</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Slug</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="transition hover:bg-slate-50/80">
                                <td className="px-4 py-3 font-medium text-slate-700">{item.name}</td>
                                <td className="px-4 py-3 text-slate-500">{item.slug}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {item.active ? "Hoạt động" : "Ẩn"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredItems.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-brand-gray">
                                    Không có danh mục nào
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}