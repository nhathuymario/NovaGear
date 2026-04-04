import { useEffect, useMemo, useState } from "react"
import {
    createAdminProduct,
    deleteAdminProduct,
    getAdminCategories,
    getAdminProductDetail,
    getAdminProducts,
    updateAdminProduct,
    type AdminProductItem,
    type AdminProductPayload,
} from "../../api/adminProductApi"

type CategoryOption = {
    id: number | string
    name: string
}

const initialForm: AdminProductPayload = {
    name: "",
    slug: "",
    brand: "",
    categoryId: "",
    shortDescription: "",
    description: "",
    thumbnail: "",
    status: "DRAFT",
    featured: false,
}

export default function AdminProductsPage() {
    const [items, setItems] = useState<AdminProductItem[]>([])
    const [categories, setCategories] = useState<CategoryOption[]>([])
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState("")
    const [editingId, setEditingId] = useState<number | string | null>(null)
    const [openForm, setOpenForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState<AdminProductPayload>(initialForm)

    const loadData = async () => {
        try {
            setLoading(true)
            const [products, categoryData] = await Promise.all([
                getAdminProducts(),
                getAdminCategories(),
            ])
            setItems(products)
            setCategories(categoryData)
        } catch (error) {
            console.error(error)
            setItems([])
            setCategories([])
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
            const name = item.name?.toLowerCase() ?? ""
            const slug = item.slug?.toLowerCase() ?? ""
            const brand = item.brand?.toLowerCase() ?? ""
            return name.includes(q) || slug.includes(q) || brand.includes(q)
        })
    }, [items, keyword])

    const resetForm = () => {
        setForm(initialForm)
        setEditingId(null)
        setOpenForm(false)
    }

    const handleOpenCreate = () => {
        setForm(initialForm)
        setEditingId(null)
        setOpenForm(true)
    }

    const handleOpenEdit = async (id: number | string) => {
        try {
            const detail = await getAdminProductDetail(id)
            setForm({
                name: detail?.name ?? "",
                slug: detail?.slug ?? "",
                brand: detail?.brand ?? "",
                categoryId: detail?.category?.id ?? "",
                shortDescription: detail?.shortDescription ?? "",
                description: detail?.description ?? "",
                thumbnail: detail?.thumbnail ?? "",
                status: detail?.status ?? "DRAFT",
                featured: Boolean(detail?.featured),
            })
            setEditingId(id)
            setOpenForm(true)
        } catch (error) {
            console.error(error)
            alert("Không tải được chi tiết sản phẩm")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setSubmitting(true)

            if (editingId) {
                await updateAdminProduct(editingId, form)
            } else {
                await createAdminProduct(form)
            }

            await loadData()
            resetForm()
            alert(editingId ? "Cập nhật sản phẩm thành công" : "Tạo sản phẩm thành công")
        } catch (error) {
            console.error(error)
            alert("Lưu sản phẩm thất bại")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number | string) => {
        const ok = window.confirm("Bạn có chắc muốn xóa sản phẩm này?")
        if (!ok) return

        try {
            await deleteAdminProduct(id)
            await loadData()
            alert("Xóa sản phẩm thành công")
        } catch (error) {
            console.error(error)
            alert("Xóa sản phẩm thất bại")
        }
    }

    if (loading) return <div>Đang tải sản phẩm admin...</div>

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
                        <p className="mt-1 text-sm text-brand-gray">
                            Tạo, chỉnh sửa và xóa sản phẩm từ product-service.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenCreate}
                        className="rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white"
                    >
                        Thêm sản phẩm
                    </button>
                </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm theo tên / slug / thương hiệu"
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
                        placeholder="Tên sản phẩm"
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

                    <input
                        type="text"
                        placeholder="Thương hiệu"
                        className="rounded-xl border px-4 py-3 outline-none"
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    />

                    <select
                        className="rounded-xl border px-4 py-3 outline-none"
                        value={String(form.categoryId)}
                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map((item) => (
                            <option key={item.id} value={String(item.id)}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Thumbnail URL"
                        className="rounded-xl border px-4 py-3 outline-none md:col-span-2"
                        value={form.thumbnail}
                        onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                    />

                    <textarea
                        placeholder="Mô tả ngắn"
                        className="min-h-[100px] rounded-xl border px-4 py-3 outline-none"
                        value={form.shortDescription}
                        onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    />

                    <textarea
                        placeholder="Mô tả chi tiết"
                        className="min-h-[100px] rounded-xl border px-4 py-3 outline-none"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />

                    <select
                        className="rounded-xl border px-4 py-3 outline-none"
                        value={form.status}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                status: e.target.value as "DRAFT" | "ACTIVE" | "INACTIVE",
                            })
                        }
                    >
                        <option value="DRAFT">DRAFT</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>

                    <label className="flex items-center gap-2 rounded-xl border px-4 py-3">
                        <input
                            type="checkbox"
                            checked={Boolean(form.featured)}
                            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                        />
                        <span>Nổi bật</span>
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
                                    ? "Cập nhật sản phẩm"
                                    : "Tạo sản phẩm"}
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
                            <th className="px-4 py-3">Sản phẩm</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">Thương hiệu</th>
                            <th className="px-4 py-3">Danh mục</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3">Nổi bật</th>
                            <th className="px-4 py-3">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="px-4 py-3 font-medium">{item.name}</td>
                                <td className="px-4 py-3">{item.slug}</td>
                                <td className="px-4 py-3">{item.brand}</td>
                                <td className="px-4 py-3">{item.categoryName || "—"}</td>
                                <td className="px-4 py-3">{item.status}</td>
                                <td className="px-4 py-3">{item.featured ? "Có" : "Không"}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenEdit(item.id)}
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
                                <td colSpan={7} className="px-4 py-8 text-center text-brand-gray">
                                    Không có sản phẩm nào
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