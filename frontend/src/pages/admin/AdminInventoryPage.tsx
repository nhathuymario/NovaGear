import { useCallback, useEffect, useMemo, useState } from "react"
import {
    adjustStock,
    getAllInventory,
    getInventoryTransactions,
    importStock,
    type InventoryItem,
    type InventoryTransaction,
} from "../../api/inventoryApi"

export default function AdminInventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
    const [loading, setLoading] = useState(true)

    const [keyword, setKeyword] = useState("")
    const [selectedVariantId, setSelectedVariantId] = useState<number | string | null>(null)

    const [form, setForm] = useState({
        productId: "",
        variantId: "",
        quantity: 1,
        availableQuantity: 0,
        reservedQuantity: 0,
        note: "",
    })

    const loadData = useCallback(async (nextKeyword = keyword) => {
        try {
            setLoading(true)
            const result = await getAllInventory({
                keyword: nextKeyword,
                page: 0,
                size: 50,
            })
            setItems(result.items)
        } catch (error) {
            console.error(error)
            setItems([])
        } finally {
            setLoading(false)
        }
    }, [keyword])

    useEffect(() => {
        loadData("")
    }, [loadData])

    const filteredItems = useMemo(() => {
        const q = keyword.trim().toLowerCase()
        if (!q) return items

        return items.filter((item) => {
            const productId = String(item.productId ?? "").toLowerCase()
            const variantId = String(item.variantId ?? "").toLowerCase()
            const status = item.status?.toLowerCase() ?? ""
            return productId.includes(q) || variantId.includes(q) || status.includes(q)
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

    const handleImportStock = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await importStock({
                productId: form.productId,
                variantId: form.variantId,
                quantity: Number(form.quantity),
                note: form.note,
            })

            await loadData()
            if (form.variantId) {
                await handleOpenTransactions(form.variantId)
            }

            alert("Nhập kho thành công")
        } catch (error) {
            console.error(error)
            alert("Nhập kho thất bại")
        }
    }

    const handleAdjustStock = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await adjustStock({
                variantId: form.variantId,
                availableQuantity: Number(form.availableQuantity),
                reservedQuantity: Number(form.reservedQuantity),
                note: form.note,
            })

            await loadData()
            if (form.variantId) {
                await handleOpenTransactions(form.variantId)
            }

            alert("Điều chỉnh kho thành công")
        } catch (error) {
            console.error(error)
            alert("Điều chỉnh kho thất bại")
        }
    }

    if (loading) return <div>Đang tải tồn kho...</div>

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-bold">Quản lý tồn kho</h1>
                <p className="mt-1 text-sm text-brand-gray">
                    Backend inventory hiện chạy theo variant, nên thao tác kho nên dùng Variant ID.
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
                                            {[item.color, item.ram, item.storage].filter(Boolean).join(" / ") || "—"}
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

                        <div className="mt-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Product ID"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                                value={form.productId}
                                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Variant ID"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                                value={form.variantId}
                                onChange={(e) => setForm({ ...form, variantId: e.target.value })}
                            />
                            <input
                                type="number"
                                min={1}
                                placeholder="Số lượng"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                                value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                            />
                            <textarea
                                placeholder="Ghi chú"
                                className="min-h-[100px] w-full rounded-xl border px-4 py-3 outline-none"
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                            />
                        </div>

                        <button className="mt-4 w-full rounded-xl bg-brand-dark py-3 font-semibold text-white">
                            Xác nhận nhập kho
                        </button>
                    </form>

                    <form
                        onSubmit={handleAdjustStock}
                        className="rounded-2xl bg-white p-5 shadow-sm"
                    >
                        <h2 className="text-lg font-bold">Điều chỉnh kho</h2>
                        <p className="mt-1 text-sm text-brand-gray">
                            Dùng Variant ID và số lượng điều chỉnh theo backend inventory hiện tại.
                        </p>

                        <div className="mt-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Variant ID"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                                value={form.variantId}
                                onChange={(e) => setForm({ ...form, variantId: e.target.value })}
                            />
                            <input
                                type="number"
                                min={0}
                                placeholder="Available quantity"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                                value={form.availableQuantity}
                                onChange={(e) => setForm({ ...form, availableQuantity: Number(e.target.value) })}
                            />
                            <input
                                type="number"
                                min={0}
                                placeholder="Reserved quantity"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                                value={form.reservedQuantity}
                                onChange={(e) => setForm({ ...form, reservedQuantity: Number(e.target.value) })}
                            />
                        </div>

                        <button className="mt-4 w-full rounded-xl border border-brand-dark py-3 font-semibold text-brand-dark">
                            Xác nhận điều chỉnh
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    )
}