import { useEffect, useMemo, useState, useCallback } from "react"
import {
    getAdminProducts,
    createAdminProduct,
    updateAdminProduct,
    deleteAdminProduct,
    getAdminCategories,
    type AdminProductItem,
    type AdminProductPayload,
} from "../../api/adminProductApi"
import {
    getProductVariants,
    getProductSpecifications,
    addProductVariant,
    updateProductVariant,
    deleteProductVariant,
    addProductSpecification,
    updateProductSpecification,
    deleteProductSpecification,
    type AdminVariantItem,
    type AdminVariantPayload,
    type AdminSpecificationItem,
    type AdminSpecificationPayload,
} from "../../api/adminProductDetailApi"
import { getInventoryByVariant, importStock } from "../../api/inventoryApi"
import { uploadProductImage } from "../../api/uploadApi"
import type { InventoryItem } from "../../types/inventory"

interface CategoryOption {
    id: number | string
    name: string
}

type Tab = "list" | "form" | "detail"
type DetailTab = "variants" | "specs"

type VariantImportForm = {
    quantity: number
}

type VariantImportMessage = {
    type: "success" | "error"
    text: string
}

const INITIAL_PRODUCT_FORM: AdminProductPayload = {
    name: "",
    slug: "",
    brand: "",
    categoryId: "",
    shortDescription: "",
    description: "",
    thumbnail: "",
    status: "ACTIVE",
    featured: false,
}

const INITIAL_VARIANT_FORM: AdminVariantPayload = {
    sku: "",
    color: "",
    ram: "",
    storage: "",
    versionName: "",
    price: 0,
    salePrice: undefined,
    stockQuantity: 0,
    imageUrl: "",
    status: "ACTIVE",
}

const INITIAL_SPEC_FORM: AdminSpecificationPayload = {
    groupName: "",
    specKey: "",
    specValue: "",
    sortOrder: 0,
}

const DEFAULT_IMPORT_FORM: VariantImportForm = {
    quantity: 1,
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replaceAll(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
}

function StatusBadge({ status }: { status?: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        ACTIVE: { label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        DRAFT: { label: "Nháp", cls: "bg-amber-50 text-amber-700 border-amber-200" },
        INACTIVE: { label: "Ẩn", cls: "bg-gray-100 text-gray-500 border-gray-200" },
        OUT_OF_STOCK: { label: "Hết hàng", cls: "bg-red-50 text-red-600 border-red-200" },
    }

    const s =
        map[status ?? ""] ?? {
            label: status ?? "—",
            cls: "bg-gray-100 text-gray-500 border-gray-200",
        }

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}
        >
            {s.label}
        </span>
    )
}

export default function AdminProductsPage() {
    const [tab, setTab] = useState<Tab>("list")
    const [products, setProducts] = useState<AdminProductItem[]>([])
    const [categories, setCategories] = useState<CategoryOption[]>([])
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState("")

    const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null)
    const [productForm, setProductForm] = useState<AdminProductPayload>(INITIAL_PRODUCT_FORM)
    const [submittingProduct, setSubmittingProduct] = useState(false)
    const [thumbnailUploading, setThumbnailUploading] = useState(false)

    const [selectedProduct, setSelectedProduct] = useState<AdminProductItem | null>(null)
    const [detailTab, setDetailTab] = useState<DetailTab>("variants")
    const [variants, setVariants] = useState<AdminVariantItem[]>([])
    const [specs, setSpecs] = useState<AdminSpecificationItem[]>([])
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
    const [detailLoading, setDetailLoading] = useState(false)

    const [editingVariant, setEditingVariant] = useState<AdminVariantItem | null>(null)
    const [variantForm, setVariantForm] = useState<AdminVariantPayload>(INITIAL_VARIANT_FORM)
    const [showVariantForm, setShowVariantForm] = useState(false)
    const [submittingVariant, setSubmittingVariant] = useState(false)
    const [variantImgUploading, setVariantImgUploading] = useState(false)

    const [editingSpec, setEditingSpec] = useState<AdminSpecificationItem | null>(null)
    const [specForm, setSpecForm] = useState<AdminSpecificationPayload>(INITIAL_SPEC_FORM)
    const [showSpecForm, setShowSpecForm] = useState(false)
    const [submittingSpec, setSubmittingSpec] = useState(false)

    const [inlineImportForms, setInlineImportForms] = useState<Record<string, VariantImportForm>>({})
    const [inlineImportMessages, setInlineImportMessages] = useState<Record<string, VariantImportMessage>>({})
    const [inlineImportLoadingId, setInlineImportLoadingId] = useState<number | string | null>(null)

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true)
            const [prods, cats] = await Promise.all([
                getAdminProducts(),
                getAdminCategories(),
            ])

            setProducts(prods)
            setCategories(
                Array.isArray(cats)
                    ? cats.map((c: any) => ({ id: c.id ?? "", name: c.name ?? "" }))
                    : []
            )
        } catch (err) {
            console.error(err)
            setProducts([])
            setCategories([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    const loadInventorySnapshots = useCallback(async (variantList: AdminVariantItem[]) => {
        try {
            const results = await Promise.all(
                variantList.map(async (variant) => {
                    try {
                        return await getInventoryByVariant(variant.id)
                    } catch (error) {
                        console.error(error)
                        return null
                    }
                })
            )

            setInventoryItems(results.filter(Boolean) as InventoryItem[])
        } catch (error) {
            console.error(error)
            setInventoryItems([])
        }
    }, [])

    const loadDetail = useCallback(async (productId: number | string) => {
        try {
            setDetailLoading(true)

            const [variantData, specificationData] = await Promise.all([
                getProductVariants(productId),
                getProductSpecifications(productId),
            ])

            setVariants(variantData)
            setSpecs(specificationData)
            setInlineImportForms({})
            setInlineImportMessages({})

            await loadInventorySnapshots(variantData)
        } catch (err) {
            console.error(err)
            setVariants([])
            setSpecs([])
            setInventoryItems([])
        } finally {
            setDetailLoading(false)
        }
    }, [loadInventorySnapshots])

    const refreshInventory = useCallback(async (variantList?: AdminVariantItem[]) => {
        const targetVariants = variantList ?? variants
        await loadInventorySnapshots(targetVariants)
    }, [loadInventorySnapshots, variants])

    const filtered = useMemo(() => {
        const q = keyword.trim().toLowerCase()
        if (!q) return products

        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                (p.categoryName ?? "").toLowerCase().includes(q)
        )
    }, [products, keyword])

    const openCreateProduct = () => {
        setEditingProduct(null)
        setProductForm(INITIAL_PRODUCT_FORM)
        setTab("form")
    }

    const openEditProduct = (item: AdminProductItem) => {
        setEditingProduct(item)
        setProductForm({
            name: item.name,
            slug: item.slug,
            brand: item.brand,
            categoryId: "",
            shortDescription: item.shortDescription ?? "",
            description: "",
            thumbnail: item.thumbnail ?? "",
            status: (item.status as AdminProductPayload["status"]) ?? "ACTIVE",
            featured: item.featured ?? false,
        })
        setTab("form")
    }

    const openDetail = (item: AdminProductItem) => {
        setSelectedProduct(item)
        setDetailTab("variants")
        setShowVariantForm(false)
        setShowSpecForm(false)
        setTab("detail")
        loadDetail(item.id)
    }

    const handleProductNameChange = (name: string) => {
        setProductForm((prev) => ({
            ...prev,
            name,
            slug: editingProduct ? prev.slug : prev.slug ? prev.slug : slugify(name),
        }))
    }

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setThumbnailUploading(true)
            const url = await uploadProductImage(file)
            setProductForm((prev) => ({ ...prev, thumbnail: url }))
        } catch (err) {
            console.error(err)
            alert("Upload ảnh thất bại")
        } finally {
            setThumbnailUploading(false)
        }
    }

    const handleSubmitProduct = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setSubmittingProduct(true)

            if (editingProduct) {
                await updateAdminProduct(editingProduct.id, productForm)
                alert("Cập nhật sản phẩm thành công")
            } else {
                await createAdminProduct(productForm)
                alert("Tạo sản phẩm thành công")
            }

            await loadProducts()
            setTab("list")
        } catch (err) {
            console.error(err)
            alert("Lưu sản phẩm thất bại")
        } finally {
            setSubmittingProduct(false)
        }
    }

    const handleDeleteProduct = async (item: AdminProductItem) => {
        if (!window.confirm(`Xóa sản phẩm "${item.name}"?`)) return

        try {
            await deleteAdminProduct(item.id)
            await loadProducts()
            alert("Đã xóa sản phẩm")
        } catch (err) {
            console.error(err)
            alert("Xóa thất bại")
        }
    }

    const openCreateVariant = () => {
        setEditingVariant(null)
        setVariantForm(INITIAL_VARIANT_FORM)
        setShowVariantForm(true)
    }

    const openEditVariant = (v: AdminVariantItem) => {
        setEditingVariant(v)
        setVariantForm({
            sku: v.sku,
            color: v.color ?? "",
            ram: v.ram ?? "",
            storage: v.storage ?? "",
            versionName: v.versionName ?? "",
            price: v.price,
            salePrice: v.salePrice,
            stockQuantity: v.stockQuantity ?? 0,
            imageUrl: v.imageUrl ?? "",
            status: (v.status as AdminVariantPayload["status"]) ?? "ACTIVE",
        })
        setShowVariantForm(true)
    }

    const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setVariantImgUploading(true)
            const url = await uploadProductImage(file)
            setVariantForm((prev) => ({ ...prev, imageUrl: url }))
        } catch (err) {
            console.error(err)
            alert("Upload ảnh thất bại")
        } finally {
            setVariantImgUploading(false)
        }
    }

    const handleSubmitVariant = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProduct) return

        try {
            setSubmittingVariant(true)

            if (editingVariant) {
                await updateProductVariant(editingVariant.id, variantForm)
            } else {
                await addProductVariant(selectedProduct.id, variantForm)
            }

            await loadDetail(selectedProduct.id)
            setShowVariantForm(false)
            setEditingVariant(null)
            alert(editingVariant ? "Cập nhật variant thành công" : "Thêm variant thành công")
        } catch (err) {
            console.error(err)
            alert("Lưu variant thất bại")
        } finally {
            setSubmittingVariant(false)
        }
    }

    const handleDeleteVariant = async (variantId: number | string) => {
        if (!window.confirm("Xóa variant này?")) return

        try {
            await deleteProductVariant(variantId)
            if (selectedProduct) {
                await loadDetail(selectedProduct.id)
            }
            alert("Xóa variant thành công")
        } catch (err) {
            console.error(err)
            alert("Xóa variant thất bại")
        }
    }

    const openCreateSpec = () => {
        setEditingSpec(null)
        setSpecForm(INITIAL_SPEC_FORM)
        setShowSpecForm(true)
    }

    const openEditSpec = (s: AdminSpecificationItem) => {
        setEditingSpec(s)
        setSpecForm({
            groupName: s.groupName,
            specKey: s.specKey,
            specValue: s.specValue,
            sortOrder: s.sortOrder ?? 0,
        })
        setShowSpecForm(true)
    }

    const handleSubmitSpec = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProduct) return

        try {
            setSubmittingSpec(true)

            if (editingSpec) {
                await updateProductSpecification(editingSpec.id, specForm)
            } else {
                await addProductSpecification(selectedProduct.id, specForm)
            }

            await loadDetail(selectedProduct.id)
            setShowSpecForm(false)
            setEditingSpec(null)
            alert(editingSpec ? "Cập nhật thông số thành công" : "Thêm thông số thành công")
        } catch (err) {
            console.error(err)
            alert("Lưu thông số thất bại")
        } finally {
            setSubmittingSpec(false)
        }
    }

    const handleDeleteSpec = async (specId: number | string) => {
        if (!window.confirm("Xóa thông số này?")) return

        try {
            await deleteProductSpecification(specId)
            if (selectedProduct) {
                await loadDetail(selectedProduct.id)
            }
            alert("Xóa thông số thành công")
        } catch (err) {
            console.error(err)
            alert("Xóa thông số thất bại")
        }
    }

    const getInlineImportForm = (variantId: number | string): VariantImportForm => {
        return inlineImportForms[String(variantId)] ?? DEFAULT_IMPORT_FORM
    }

    const updateInlineImportForm = (
        variantId: number | string,
        patch: Partial<VariantImportForm>
    ) => {
        const key = String(variantId)

        setInlineImportForms((prev) => ({
            ...prev,
            [key]: {
                ...(prev[key] ?? DEFAULT_IMPORT_FORM),
                ...patch,
            },
        }))
    }

    const getInventorySnapshot = (variantId: number | string) => {
        return (
            inventoryItems.find(
                (item) => String(item.variantId ?? "") === String(variantId)
            ) ?? null
        )
    }

    const handleInlineImportStock = async (variant: AdminVariantItem) => {
        const key = String(variant.id)
        const currentForm = getInlineImportForm(variant.id)
        const quantity = Number(currentForm.quantity)

        if (!quantity || quantity < 1) {
            setInlineImportMessages((prev) => ({
                ...prev,
                [key]: {
                    type: "error",
                    text: "Số lượng phải lớn hơn 0",
                },
            }))
            return
        }

        try {
            setInlineImportLoadingId(variant.id)

            await importStock({
                variantId: variant.id,
                quantity,
                note: `Nhập kho nhanh cho ${variant.sku}`,
            })

            await refreshInventory()

            setInlineImportForms((prev) => ({
                ...prev,
                [key]: DEFAULT_IMPORT_FORM,
            }))

            setInlineImportMessages((prev) => ({
                ...prev,
                [key]: {
                    type: "success",
                    text: "Nhập kho thành công",
                },
            }))
        } catch (err) {
            console.error(err)
            setInlineImportMessages((prev) => ({
                ...prev,
                [key]: {
                    type: "error",
                    text: "Nhập kho thất bại",
                },
            }))
        } finally {
            setInlineImportLoadingId(null)
        }
    }

    if (tab === "list") {
        return (
            <div className="space-y-5">
                <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {products.length} sản phẩm · Tạo, chỉnh sửa, quản lý variants & thông số
                        </p>
                    </div>
                    <button
                        onClick={openCreateProduct}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm sản phẩm
                    </button>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Tìm theo tên, thương hiệu, danh mục..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span className="text-sm">Đang tải...</span>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <th className="px-5 py-3.5">Sản phẩm</th>
                                    <th className="px-5 py-3.5">Thương hiệu</th>
                                    <th className="px-5 py-3.5">Danh mục</th>
                                    <th className="px-5 py-3.5">Trạng thái</th>
                                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {filtered.map((item) => (
                                    <tr key={item.id} className="group transition hover:bg-gray-50">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                    {item.thumbnail ? (
                                                        <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                                    <p className="text-xs text-gray-400">{item.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">{item.brand || "—"}</td>
                                        <td className="px-5 py-4 text-gray-600">{item.categoryName || "—"}</td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={item.status} />
                                            {item.featured && (
                                                <span className="ml-2 inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
                                                    ★ Nổi bật
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openDetail(item)}
                                                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                                                >
                                                    Variants / Specs
                                                </button>
                                                <button
                                                    onClick={() => openEditProduct(item)}
                                                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(item)}
                                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-500 hover:bg-red-50"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-16 text-center text-gray-400">
                                            <svg className="mx-auto h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <p className="mt-3 text-sm">Không có sản phẩm nào</p>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    if (tab === "form") {
        return (
            <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
                    <button
                        onClick={() => setTab("list")}
                        className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-50"
                    >
                        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {editingProduct ? `Sửa: ${editingProduct.name}` : "Thêm sản phẩm mới"}
                        </h1>
                        <p className="text-sm text-gray-500">Điền thông tin cơ bản của sản phẩm</p>
                    </div>
                </div>

                <form onSubmit={handleSubmitProduct}>
                    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                        <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-gray-800">Thông tin cơ bản</h2>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Tên sản phẩm *</label>
                                    <input
                                        required
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => handleProductNameChange(e.target.value)}
                                        placeholder="VD: MacBook Air M3 2024"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Slug *</label>
                                    <input
                                        required
                                        type="text"
                                        value={productForm.slug}
                                        onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                                        placeholder="macbook-air-m3-2024"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Thương hiệu *</label>
                                    <input
                                        required
                                        type="text"
                                        value={productForm.brand}
                                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                                        placeholder="Apple, Samsung, Dell..."
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Danh mục *</label>
                                    <select
                                        required
                                        value={productForm.categoryId}
                                        onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Mô tả ngắn</label>
                                    <input
                                        type="text"
                                        value={productForm.shortDescription}
                                        onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                                        placeholder="Mô tả tóm tắt hiển thị trong danh sách"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Mô tả chi tiết</label>
                                    <textarea
                                        rows={4}
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                        placeholder="Mô tả đầy đủ hiển thị trang chi tiết"
                                        className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <h2 className="font-semibold text-gray-800">Ảnh đại diện</h2>
                                <div className="mt-3">
                                    {productForm.thumbnail ? (
                                        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                                            <img src={productForm.thumbnail} alt="thumbnail" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setProductForm({ ...productForm, thumbnail: "" })}
                                                className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-red-500 shadow"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mb-3 flex aspect-square w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-300">
                                            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    <label className="block cursor-pointer">
                                        <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900">
                                            {thumbnailUploading ? "Đang upload..." : "Upload ảnh"}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleThumbnailUpload}
                                            disabled={thumbnailUploading}
                                        />
                                    </label>

                                    <p className="mt-2 text-center text-xs text-gray-400">hoặc nhập URL trực tiếp</p>
                                    <input
                                        type="text"
                                        value={productForm.thumbnail}
                                        onChange={(e) => setProductForm({ ...productForm, thumbnail: e.target.value })}
                                        placeholder="https://..."
                                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <h2 className="font-semibold text-gray-800">Trạng thái</h2>
                                <div className="mt-3 space-y-3">
                                    <select
                                        value={productForm.status}
                                        onChange={(e) => setProductForm({ ...productForm, status: e.target.value as AdminProductPayload["status"] })}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    >
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="DRAFT">Nháp</option>
                                        <option value="INACTIVE">Ẩn</option>
                                    </select>

                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 transition hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(productForm.featured)}
                                            onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                                            className="h-4 w-4 rounded accent-gray-900"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Sản phẩm nổi bật</p>
                                            <p className="text-xs text-gray-400">Hiển thị ở trang chủ</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    type="submit"
                                    disabled={submittingProduct}
                                    className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
                                >
                                    {submittingProduct ? "Đang lưu..." : editingProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTab("list")}
                                    className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        )
    }

    if (tab === "detail" && selectedProduct) {
        return (
            <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
                    <button
                        onClick={() => setTab("list")}
                        className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-50"
                    >
                        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h1>
                        <p className="text-sm text-gray-500">Quản lý variants & thông số kỹ thuật</p>
                    </div>
                    <button
                        onClick={() => openEditProduct(selectedProduct)}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                    >
                        Sửa sản phẩm
                    </button>
                </div>

                <div className="flex gap-1 rounded-2xl bg-white p-1.5 shadow-sm">
                    <button
                        onClick={() => {
                            setDetailTab("variants")
                            setShowVariantForm(false)
                            setShowSpecForm(false)
                        }}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                            detailTab === "variants" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        Variants ({variants.length})
                    </button>
                    <button
                        onClick={() => {
                            setDetailTab("specs")
                            setShowSpecForm(false)
                            setShowVariantForm(false)
                        }}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                            detailTab === "specs" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        Thông số ({specs.length})
                    </button>
                </div>

                {detailLoading ? (
                    <div className="flex items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span className="text-sm">Đang tải...</span>
                        </div>
                    </div>
                ) : detailTab === "variants" ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800">Danh sách variant</h2>
                            <button
                                onClick={openCreateVariant}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-700"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Thêm variant
                            </button>
                        </div>

                        {showVariantForm && (
                            <form
                                onSubmit={handleSubmitVariant}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <h3 className="mb-4 font-semibold text-gray-800">
                                    {editingVariant ? "Sửa variant" : "Thêm variant mới"}
                                </h3>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">SKU *</label>
                                        <input
                                            required
                                            type="text"
                                            value={variantForm.sku}
                                            onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                                            placeholder="APPLE-MBA-M3-8-256"
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Màu sắc</label>
                                        <input
                                            type="text"
                                            value={variantForm.color}
                                            onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
                                            placeholder="Midnight, Silver..."
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">RAM</label>
                                        <input
                                            type="text"
                                            value={variantForm.ram}
                                            onChange={(e) => setVariantForm({ ...variantForm, ram: e.target.value })}
                                            placeholder="8GB, 16GB..."
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Bộ nhớ</label>
                                        <input
                                            type="text"
                                            value={variantForm.storage}
                                            onChange={(e) => setVariantForm({ ...variantForm, storage: e.target.value })}
                                            placeholder="256GB, 512GB..."
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Tên phiên bản</label>
                                        <input
                                            type="text"
                                            value={variantForm.versionName}
                                            onChange={(e) => setVariantForm({ ...variantForm, versionName: e.target.value })}
                                            placeholder="Pro, Ultra..."
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Trạng thái</label>
                                        <select
                                            value={variantForm.status}
                                            onChange={(e) => setVariantForm({ ...variantForm, status: e.target.value as AdminVariantPayload["status"] })}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        >
                                            <option value="ACTIVE">Hoạt động</option>
                                            <option value="OUT_OF_STOCK">Hết hàng</option>
                                            <option value="INACTIVE">Ẩn</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Giá gốc (₫) *</label>
                                        <input
                                            required
                                            type="number"
                                            min={0}
                                            value={variantForm.price}
                                            onChange={(e) => setVariantForm({ ...variantForm, price: Number(e.target.value) })}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Giá sale (₫)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={variantForm.salePrice ?? ""}
                                            onChange={(e) =>
                                                setVariantForm({
                                                    ...variantForm,
                                                    salePrice: e.target.value ? Number(e.target.value) : undefined,
                                                })
                                            }
                                            placeholder="Để trống nếu không sale"
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Tồn kho ban đầu</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={variantForm.stockQuantity}
                                            onChange={(e) => setVariantForm({ ...variantForm, stockQuantity: Number(e.target.value) })}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>

                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Ảnh variant</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={variantForm.imageUrl}
                                                onChange={(e) => setVariantForm({ ...variantForm, imageUrl: e.target.value })}
                                                placeholder="URL ảnh hoặc upload"
                                                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                            />
                                            <label className="cursor-pointer">
                                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-700 transition hover:border-gray-900">
                                                    {variantImgUploading ? "..." : "Upload"}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleVariantImageUpload}
                                                    disabled={variantImgUploading}
                                                />
                                            </label>
                                        </div>

                                        {variantForm.imageUrl && (
                                            <img
                                                src={variantForm.imageUrl}
                                                alt="variant"
                                                className="mt-2 h-16 w-16 rounded-lg object-cover"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    Tồn kho thực tế nên nhập ở bảng variant bên dưới. Ô tồn kho trong form này đang giữ lại để tương thích payload hiện tại của product-service.
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={submittingVariant}
                                        className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                                    >
                                        {submittingVariant ? "Đang lưu..." : editingVariant ? "Cập nhật" : "Thêm variant"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowVariantForm(false)
                                            setEditingVariant(null)
                                        }}
                                        className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        )}

                        {variants.length === 0 && !showVariantForm ? (
                            <div className="rounded-2xl bg-white py-12 text-center text-sm text-gray-400 shadow-sm">
                                Chưa có variant nào. Nhấn "Thêm variant" để bắt đầu.
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            <th className="px-5 py-3.5">SKU / Ảnh</th>
                                            <th className="px-5 py-3.5">Cấu hình</th>
                                            <th className="px-5 py-3.5">Giá</th>
                                            <th className="px-5 py-3.5">Tồn kho</th>
                                            <th className="px-5 py-3.5">Khả dụng</th>
                                            <th className="px-5 py-3.5">Đang giữ</th>
                                            <th className="px-5 py-3.5">Nhập kho</th>
                                            <th className="px-5 py-3.5">Trạng thái</th>
                                            <th className="px-5 py-3.5 text-right">Thao tác</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                        {variants.map((v) => {
                                            const inventory = getInventorySnapshot(v.id)
                                            const importForm = getInlineImportForm(v.id)
                                            const message = inlineImportMessages[String(v.id)]
                                            const displayStock = inventory?.stockQuantity ?? v.stockQuantity ?? 0
                                            const availableStock = inventory?.availableQuantity ?? displayStock
                                            const reservedStock = inventory?.reservedQuantity ?? 0

                                            return (
                                                <tr key={v.id} className="hover:bg-gray-50">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {v.imageUrl ? (
                                                                <img src={v.imageUrl} alt={v.sku} className="h-10 w-10 rounded-lg object-cover" />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-lg bg-gray-100" />
                                                            )}
                                                            <span className="font-mono text-xs font-medium text-gray-700">{v.sku}</span>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-gray-600">
                                                        {[v.color, v.ram, v.storage, v.versionName].filter(Boolean).join(" · ") || "—"}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {v.salePrice != null ? (
                                                            <div>
                                                                <p className="font-semibold text-red-600">{v.salePrice.toLocaleString("vi-VN")}đ</p>
                                                                <p className="text-xs text-gray-400 line-through">{v.price.toLocaleString("vi-VN")}đ</p>
                                                            </div>
                                                        ) : (
                                                            <p className="font-semibold text-gray-900">{v.price.toLocaleString("vi-VN")}đ</p>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 font-semibold text-gray-900">
                                                        {displayStock}
                                                    </td>

                                                    <td className="px-5 py-4 font-semibold text-emerald-600">
                                                        {availableStock}
                                                    </td>

                                                    <td className="px-5 py-4 font-semibold text-amber-600">
                                                        {reservedStock}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    value={importForm.quantity}
                                                                    onChange={(e) =>
                                                                        updateInlineImportForm(v.id, {
                                                                            quantity: Number(e.target.value || 0),
                                                                        })
                                                                    }
                                                                    className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-gray-900"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleInlineImportStock(v)}
                                                                    disabled={inlineImportLoadingId === v.id}
                                                                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                                                                >
                                                                    {inlineImportLoadingId === v.id ? "..." : "Nhập kho"}
                                                                </button>
                                                            </div>

                                                            {message?.text && (
                                                                <p
                                                                    className={`text-xs ${
                                                                        message.type === "success" ? "text-green-600" : "text-red-500"
                                                                    }`}
                                                                >
                                                                    {message.text}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge status={v.status} />
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => openEditVariant(v)}
                                                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-900"
                                                            >
                                                                Sửa
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteVariant(v.id)}
                                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-500 hover:bg-red-50"
                                                            >
                                                                Xóa
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800">Thông số kỹ thuật</h2>
                            <button
                                onClick={openCreateSpec}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-700"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Thêm thông số
                            </button>
                        </div>

                        {showSpecForm && (
                            <form
                                onSubmit={handleSubmitSpec}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <h3 className="mb-4 font-semibold text-gray-800">
                                    {editingSpec ? "Sửa thông số" : "Thêm thông số mới"}
                                </h3>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Nhóm *</label>
                                        <input
                                            required
                                            type="text"
                                            value={specForm.groupName}
                                            onChange={(e) => setSpecForm({ ...specForm, groupName: e.target.value })}
                                            placeholder="Hiệu năng, Màn hình, Pin..."
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Tên thông số *</label>
                                        <input
                                            required
                                            type="text"
                                            value={specForm.specKey}
                                            onChange={(e) => setSpecForm({ ...specForm, specKey: e.target.value })}
                                            placeholder="CPU, RAM, Kích thước màn hình..."
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Giá trị *</label>
                                        <input
                                            required
                                            type="text"
                                            value={specForm.specValue}
                                            onChange={(e) => setSpecForm({ ...specForm, specValue: e.target.value })}
                                            placeholder='Apple M3, 8GB, 13.6"...'
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">Thứ tự sắp xếp</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={specForm.sortOrder}
                                            onChange={(e) => setSpecForm({ ...specForm, sortOrder: Number(e.target.value) })}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={submittingSpec}
                                        className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                                    >
                                        {submittingSpec ? "Đang lưu..." : editingSpec ? "Cập nhật" : "Thêm thông số"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSpecForm(false)
                                            setEditingSpec(null)
                                        }}
                                        className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        )}

                        {specs.length === 0 && !showSpecForm ? (
                            <div className="rounded-2xl bg-white py-12 text-center text-sm text-gray-400 shadow-sm">
                                Chưa có thông số nào. Nhấn "Thêm thông số" để bắt đầu.
                            </div>
                        ) : (
                            (() => {
                                const grouped: Record<string, AdminSpecificationItem[]> = {}

                                specs.forEach((s) => {
                                    if (!grouped[s.groupName]) grouped[s.groupName] = []
                                    grouped[s.groupName].push(s)
                                })

                                return (
                                    <div className="space-y-3">
                                        {Object.entries(grouped).map(([group, groupSpecs]) => (
                                            <div key={group} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                                <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        {group}
                                                    </h3>
                                                </div>
                                                <table className="min-w-full text-sm">
                                                    <tbody className="divide-y divide-gray-50">
                                                    {groupSpecs
                                                        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                                                        .map((s) => (
                                                            <tr key={s.id} className="hover:bg-gray-50">
                                                                <td className="w-1/3 px-5 py-3 font-medium text-gray-700">{s.specKey}</td>
                                                                <td className="px-5 py-3 text-gray-600">{s.specValue}</td>
                                                                <td className="px-5 py-3 text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={() => openEditSpec(s)}
                                                                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-900"
                                                                        >
                                                                            Sửa
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteSpec(s.id)}
                                                                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-500 hover:bg-red-50"
                                                                        >
                                                                            Xóa
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()
                        )}
                    </div>
                )}
            </div>
        )
    }

    return null
}