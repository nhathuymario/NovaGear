import {type FormEvent, useCallback, useEffect, useMemo, useState} from "react"
import {
    adjustStock,
    getAllInventory,
    getInventoryTransactions,
    importStock,
    type InventoryItem,
    type InventoryTransaction,
} from "../../api/inventoryApi"
import {type AdminProductItem, getAdminProductDetail, getAdminProducts,} from "../../api/adminProductApi"
import {type AdminVariantItem, getProductVariants} from "../../api/adminProductDetailApi"

type ProductVariantLookup = {
    productName?: string
    sku?: string
    color?: string
    ram?: string
    storage?: string
    versionName?: string
}

export default function AdminInventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [optionLoading, setOptionLoading] = useState(true)
    const [variantLoading, setVariantLoading] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [isAdjusting, setIsAdjusting] = useState(false)

    const [keyword, setKeyword] = useState("")
    const [selectedVariantId, setSelectedVariantId] = useState<number | string | null>(null)
    const [selectedAdjustItem, setSelectedAdjustItem] = useState<InventoryItem | null>(null)
    const [products, setProducts] = useState<AdminProductItem[]>([])
    const [variants, setVariants] = useState<AdminVariantItem[]>([])

    const [importForm, setImportForm] = useState({
        productId: "",
        variantId: "",
        quantity: 1,
        note: "",
    })

    const [adjustForm, setAdjustForm] = useState({
        variantId: "",
        availableQuantity: 0,
        reservedQuantity: 0,
        note: "",
    })

    const enrichInventoryItems = useCallback(async (rows: InventoryItem[]): Promise<InventoryItem[]> => {
        const missingVariantRows = rows.filter(
            (item) => item.variantId && item.productId && Number(item.productId) > 0 && (!item.productName || !item.sku)
        )

        if (missingVariantRows.length === 0) {
            return rows
        }

        const productIds = Array.from(
            new Set(
                missingVariantRows
                    .map((item) => String(item.productId ?? "").trim())
                    .filter(Boolean)
            )
        )

        if (productIds.length === 0) {
            return rows
        }

        const productDetails = await Promise.all(
            productIds.map(async (productId) => {
                try {
                    return await getAdminProductDetail(productId)
                } catch (error) {
                    console.error(error)
                    return null
                }
            })
        )

        const variantLookup = new Map<string, ProductVariantLookup>()
        for (const product of productDetails) {
            if (!product) continue

            const productName = String(product.name ?? "")
            const variants = Array.isArray(product.variants) ? product.variants : []

            for (const variant of variants) {
                const variantId = String(variant?.id ?? "").trim()
                if (!variantId) continue

                variantLookup.set(variantId, {
                    productName,
                    sku: String(variant?.sku ?? ""),
                    color: String(variant?.color ?? ""),
                    ram: String(variant?.ram ?? ""),
                    storage: String(variant?.storage ?? ""),
                    versionName: String(variant?.versionName ?? ""),
                })
            }
        }

        return rows.map((item) => {
            const key = String(item.variantId ?? "").trim()
            const found = variantLookup.get(key)
            if (!found) return item

            return {
                ...item,
                productName: item.productName || found.productName || "",
                sku: item.sku || found.sku || "",
                color: item.color || found.color || "",
                ram: item.ram || found.ram || "",
                storage: item.storage || found.storage || "",
                versionName: item.versionName || found.versionName || "",
            }
        })
    }, [])

    const loadData = useCallback(async (nextKeyword = keyword) => {
        try {
            setLoading(true)
            const result = await getAllInventory({
                keyword: nextKeyword,
                page: 0,
                size: 50,
            })
            const enrichedItems = await enrichInventoryItems(result.items)
            setItems(enrichedItems)
        } catch (error) {
            console.error(error)
            setItems([])
        } finally {
            setLoading(false)
        }
    }, [enrichInventoryItems, keyword])

    const loadProducts = useCallback(async () => {
        try {
            setOptionLoading(true)
            const data = await getAdminProducts()
            setProducts(data)
        } catch (error) {
            console.error(error)
            setProducts([])
            alert("Không tải được danh sách sản phẩm")
        } finally {
            setOptionLoading(false)
        }
    }, [])

    const loadVariantsByProduct = useCallback(async (productId: string) => {
        const normalized = String(productId ?? "").trim()
        if (!normalized) {
            setVariants([])
            return
        }

        try {
            setVariantLoading(true)
            const data = await getProductVariants(normalized)
            setVariants(data)
        } catch (error) {
            console.error(error)
            setVariants([])
            alert("Không tải được danh sách biến thể")
        } finally {
            setVariantLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData("")
    }, [loadData])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    const filteredItems = useMemo(() => {
        const q = keyword.trim().toLowerCase()
        if (!q) return items

        return items.filter((item) => {
            const productId = String(item.productId ?? "").toLowerCase()
            const variantId = String(item.variantId ?? "").toLowerCase()
            const productName = String(item.productName ?? "").toLowerCase()
            const sku = String(item.sku ?? "").toLowerCase()
            const status = item.status?.toLowerCase() ?? ""
            return (
                productId.includes(q) ||
                variantId.includes(q) ||
                productName.includes(q) ||
                sku.includes(q) ||
                status.includes(q)
            )
        })
    }, [items, keyword])

    const handleOpenTransactions = async (variantId?: number | string) => {
        if (!variantId) return

        try {
            setSelectedVariantId(variantId)
            const data = await getInventoryTransactions(variantId)
            setTransactions(data)
        } catch (error) {
            console.error(error)
            setTransactions([])
            alert("Không tải được lịch sử kho")
        }
    }

    const handleSelectInventoryItem = async (item: InventoryItem) => {
        setSelectedAdjustItem(item)
        setAdjustForm({
            variantId: String(item.variantId ?? ""),
            availableQuantity: Number(item.availableQuantity ?? Math.max(Number(item.stockQuantity ?? 0) - Number(item.reservedQuantity ?? 0), 0)),
            reservedQuantity: Number(item.reservedQuantity ?? 0),
            note: "",
        })

        if (item.variantId) {
            await handleOpenTransactions(item.variantId)
        }
    }

    const handleChangeImportProduct = async (productId: string) => {
        setImportForm((prev) => ({
            ...prev,
            productId,
            variantId: "",
        }))
        await loadVariantsByProduct(productId)
    }

    const handleChangeImportVariant = (variantId: string) => {
        setImportForm((prev) => ({
            ...prev,
            variantId,
        }))
    }

    const handleImportStock = async (e: FormEvent) => {
        e.preventDefault()

        if (!importForm.productId || !importForm.variantId) {
            alert("Vui lòng chọn sản phẩm và biến thể")
            return
        }

        if (Number(importForm.quantity) < 1) {
            alert("Số lượng nhập phải lớn hơn 0")
            return
        }

        try {
            setIsImporting(true)
            await importStock({
                productId: importForm.productId,
                variantId: importForm.variantId,
                quantity: Number(importForm.quantity),
                note: importForm.note,
            })

            await loadData()
            if (importForm.variantId) {
                await handleOpenTransactions(importForm.variantId)
            }

            setImportForm((prev) => ({
                ...prev,
                quantity: 1,
                note: "",
            }))

            alert("Nhập kho thành công")
        } catch (error) {
            console.error(error)
            alert("Nhập kho thất bại")
        } finally {
            setIsImporting(false)
        }
    }

    const handleAdjustStock = async (e: FormEvent) => {
        e.preventDefault()

        if (!adjustForm.variantId) {
            alert("Vui lòng chọn một dòng tồn kho từ bảng hoặc nhập Variant ID để điều chỉnh")
            return
        }

        try {
            setIsAdjusting(true)
            await adjustStock({
                variantId: adjustForm.variantId,
                availableQuantity: Number(adjustForm.availableQuantity),
                reservedQuantity: Number(adjustForm.reservedQuantity),
                note: adjustForm.note,
            })

            await loadData()
            if (adjustForm.variantId) {
                await handleOpenTransactions(adjustForm.variantId)
            }

            alert("Điều chỉnh kho thành công")
        } catch (error) {
            console.error(error)
            alert("Điều chỉnh kho thất bại")
        } finally {
            setIsAdjusting(false)
        }
    }

    const selectedImportVariant = useMemo(() => {
        const key = importForm.variantId.trim()
        if (!key) return null
        return variants.find((variant) => String(variant.id) === key) ?? null
    }, [importForm.variantId, variants])

    const importVariantPlaceholder = useMemo(() => {
        if (!importForm.productId) {
            return "Chọn sản phẩm trước"
        }

        if (variantLoading) {
            return "Đang tải biến thể..."
        }

        return "Chọn biến thể"
    }, [importForm.productId, variantLoading])

    const importSubmitDisabled =
        isImporting ||
        optionLoading ||
        variantLoading ||
        !importForm.productId ||
        !importForm.variantId ||
        Number(importForm.quantity) < 1

    const adjustSubmitDisabled =
        isAdjusting ||
        !adjustForm.variantId ||
        Number(adjustForm.availableQuantity) < 0 ||
        Number(adjustForm.reservedQuantity) < 0

    if (loading) return <div>Đang tải tồn kho...</div>

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-bold">Quản lý tồn kho</h1>
                <p className="mt-1 text-sm text-brand-gray">
                    Chọn sản phẩm và biến thể để nhập kho nhanh, không cần nhớ Variant ID.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <section className="space-y-4">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex gap-3">
                            <input
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Tìm theo Product ID / Variant ID / trạng thái"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                            />
                            <button
                                onClick={() => loadData(keyword)}
                                className="rounded-xl bg-brand-dark px-4 py-3 font-semibold text-white"
                            >
                                Tìm
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-4 py-3">Variant ID</th>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="px-4 py-3">SKU</th>
                                    <th className="px-4 py-3">Variant</th>
                                    <th className="px-4 py-3">Tồn kho</th>
                                    <th className="px-4 py-3">Khả dụng</th>
                                    <th className="px-4 py-3">Đang giữ</th>
                                    <th className="px-4 py-3">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">
                                            {item.variantId || "—"}
                                        </td>
                                        <td className="px-4 py-3">{item.productName || "—"}</td>
                                        <td className="px-4 py-3">{item.sku || "—"}</td>
                                        <td className="px-4 py-3">
                                            {[item.color, item.ram, item.storage, item.versionName]
                                                .filter(Boolean)
                                                .join(" / ") || "—"}
                                        </td>
                                        <td className="px-4 py-3 font-semibold">{item.stockQuantity}</td>
                                        <td className="px-4 py-3">{item.availableQuantity}</td>
                                        <td className="px-4 py-3">{item.reservedQuantity}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleOpenTransactions(item.variantId)}
                                                className="rounded-lg border px-3 py-1 font-medium"
                                            >
                                                Xem lịch sử
                                            </button>
                                            <button
                                                onClick={() => void handleSelectInventoryItem(item)}
                                                className="ml-2 rounded-lg border border-brand-dark px-3 py-1 font-medium text-brand-dark"
                                            >
                                                Điều chỉnh
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-brand-gray">
                                            Không có dữ liệu tồn kho
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Lịch sử kho</h2>
                            {selectedVariantId && (
                                <span className="text-sm text-brand-gray">
                                    Variant ID: {selectedVariantId}
                                </span>
                            )}
                        </div>

                        <div className="mt-4 space-y-3">
                            {transactions.length === 0 ? (
                                <div className="text-sm text-brand-gray">Chưa có lịch sử kho</div>
                            ) : (
                                transactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between rounded-xl border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">{tx.type || "TRANSACTION"}</p>
                                            <p className="text-xs text-brand-gray">{tx.note || "Không có ghi chú"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{tx.quantity}</p>
                                            <p className="text-xs text-brand-gray">{tx.createdAt || ""}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <aside className="space-y-6">
                    <form
                        onSubmit={handleImportStock}
                        className="rounded-2xl bg-white p-5 shadow-sm"
                    >
                        <h2 className="text-lg font-bold">Nhập kho</h2>
                        <p className="mt-1 text-sm text-brand-gray">
                            Chọn sản phẩm trước, sau đó chọn biến thể cần nhập kho. Lưu ý: nhập kho chỉ cộng
                            vào <b>availableQuantity</b>.
                        </p>

                        <div className="mt-4 space-y-3">
                            <select
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                                value={importForm.productId}
                                onChange={(e) => {
                                    void handleChangeImportProduct(e.target.value)
                                }}
                                disabled={optionLoading || isImporting}
                            >
                                <option value="">
                                    {optionLoading ? "Đang tải sản phẩm..." : "Chọn sản phẩm"}
                                </option>
                                {products.map((product) => (
                                    <option key={product.id} value={String(product.id)}>
                                        {product.name} ({product.brand || "N/A"})
                                    </option>
                                ))}
                            </select>

                            <select
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                                value={importForm.variantId}
                                onChange={(e) => handleChangeImportVariant(e.target.value)}
                                disabled={!importForm.productId || variantLoading || isImporting}
                            >
                                <option value="">{importVariantPlaceholder}</option>
                                {variants.map((variant) => {
                                    const variantName = [variant.color, variant.ram, variant.storage, variant.versionName]
                                        .filter(Boolean)
                                        .join(" / ")

                                    return (
                                        <option key={variant.id} value={String(variant.id)}>
                                            SKU: {variant.sku || "N/A"}
                                            {variantName ? ` - ${variantName}` : ""}
                                        </option>
                                    )
                                })}
                            </select>

                            {selectedImportVariant && (
                                <div className="rounded-xl border border-dashed px-4 py-3 text-sm text-brand-gray">
                                    <p>
                                        <span className="font-semibold text-brand-dark">Variant ID:</span>{" "}
                                        {selectedImportVariant.id}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-brand-dark">SKU:</span>{" "}
                                        {selectedImportVariant.sku || "N/A"}
                                    </p>
                                </div>
                            )}

                            <input
                                type="number"
                                min={1}
                                placeholder="Số lượng"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                                value={importForm.quantity}
                                onChange={(e) => setImportForm({...importForm, quantity: Number(e.target.value)})}
                                disabled={isImporting}
                            />
                            <textarea
                                placeholder="Ghi chú"
                                className="min-h-[100px] w-full rounded-xl border px-4 py-3 outline-none"
                                value={importForm.note}
                                onChange={(e) => setImportForm({...importForm, note: e.target.value})}
                                disabled={isImporting}
                            />
                            <div
                                className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                <p className="font-semibold">Số đang giữ là gì?</p>
                                <p className="mt-1 text-xs leading-5">
                                    Là số lượng đang bị giữ cho đơn hàng chờ xử lý / chờ thanh toán.
                                    Thông thường hệ thống tự tăng/giảm ở luồng đặt hàng, nếu cần đối soát thủ công thì
                                    dùng khối <b>Điều chỉnh kho</b> bên dưới.
                                </p>
                            </div>
                        </div>

                        <button
                            disabled={importSubmitDisabled}
                            className="mt-4 w-full rounded-xl bg-brand-dark py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isImporting ? "Đang nhập kho..." : "Xác nhận nhập kho"}
                        </button>
                    </form>

                    <form
                        onSubmit={handleAdjustStock}
                        className="rounded-2xl bg-white p-5 shadow-sm"
                    >
                        <h2 className="text-lg font-bold">Điều chỉnh kho</h2>
                        <p className="mt-1 text-sm text-brand-gray">
                            Chọn dòng tồn kho ở bảng bên trái để nạp sẵn Variant, rồi
                            chỉnh <b>available</b> và <b>reserved</b> khi cần đối soát.
                        </p>

                        {selectedAdjustItem && (
                            <div
                                className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                <p className="font-semibold text-brand-dark">
                                    {selectedAdjustItem.productName || "—"}
                                </p>
                                <p className="mt-1 text-xs">
                                    Variant ID: {selectedAdjustItem.variantId || "—"} ·
                                    SKU: {selectedAdjustItem.sku || "—"}
                                </p>
                                <p className="mt-1 text-xs">
                                    Tổng: {selectedAdjustItem.stockQuantity} · Khả
                                    dụng: {selectedAdjustItem.availableQuantity} · Đang
                                    giữ: {selectedAdjustItem.reservedQuantity}
                                </p>
                            </div>
                        )}

                        <div className="mt-4 space-y-3">
                            <input
                                type="text"
                                readOnly
                                placeholder="Chọn một dòng trong bảng để tự điền Variant"
                                className="w-full rounded-xl border px-4 py-3 outline-none bg-slate-50"
                                value={adjustForm.variantId}
                            />
                            <input
                                type="number"
                                min={0}
                                placeholder="Available quantity"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                                value={adjustForm.availableQuantity}
                                onChange={(e) => setAdjustForm({
                                    ...adjustForm,
                                    availableQuantity: Number(e.target.value)
                                })}
                                disabled={isAdjusting}
                            />
                            <input
                                type="number"
                                min={0}
                                placeholder="Reserved quantity"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                                value={adjustForm.reservedQuantity}
                                onChange={(e) => setAdjustForm({
                                    ...adjustForm,
                                    reservedQuantity: Number(e.target.value)
                                })}
                                disabled={isAdjusting}
                            />
                            <textarea
                                placeholder="Ghi chú"
                                className="min-h-[80px] w-full rounded-xl border px-4 py-3 outline-none"
                                value={adjustForm.note}
                                onChange={(e) => setAdjustForm({...adjustForm, note: e.target.value})}
                                disabled={isAdjusting}
                            />
                        </div>

                        <button
                            disabled={adjustSubmitDisabled}
                            className="mt-4 w-full rounded-xl border border-brand-dark py-3 font-semibold text-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isAdjusting ? "Đang điều chỉnh..." : "Xác nhận điều chỉnh"}
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    )
}