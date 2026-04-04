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

    if (loading) return <div>Đang tải category...</div>

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
                        <p className="mt-1 text-sm text-brand-gray">
                            Tạo, chỉnh sửa và xóa category từ product-service.
                        </p>
                    </div>

                    <button
                        onClick={handleCreate}
                        className="rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white"
                    >
                        Thêm danh mục
                    </button>
                </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm theo tên / slug"
                    className="w-full rounded-xl border px-4 py-3 outline-none"
                />
            </div>

            {openForm && (
                <form
                    onSubmit={handleSubmit}
                    className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2"
                >
                    <input
                        type="text"
                        placeholder="Tên danh mục"
                        className="rounded-xl border px-4 py-3 outline-none"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Slug"
                        className="rounded-xl border px-4 py-3 outline-none"
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
                            className="rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white disabled:opacity-60"
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
                            className="rounded-xl border px-5 py-3 font-semibold"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="px-4 py-3">Tên</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="px-4 py-3 font-medium">{item.name}</td>
                                <td className="px-4 py-3">{item.slug}</td>
                                <td className="px-4 py-3">{item.active ? "Hoạt động" : "Ẩn"}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="rounded-lg border px-3 py-1 font-medium"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="rounded-lg border border-red-500 px-3 py-1 font-medium text-red-500"
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