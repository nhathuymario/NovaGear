import { useEffect, useMemo, useState } from "react"
import {
    adjustStock,
    getAllInventory,
    getInventoryTransactions,
    importStock,
} from "../../api/inventoryApi"
import type { InventoryItem, InventoryTransaction } from "../../types/inventory"

export default function AdminInventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
    const [loading, setLoading] = useState(true)

    const [keyword, setKeyword] = useState("")
    const [form, setForm] = useState({
        productId: "",
        variantId: "",
        quantity: 1,
        note: "",
    })

    const loadData = async () => {
        try {
            setLoading(true)
            const [inventoryData, txData] = await Promise.all([
                getAllInventory(),
                getInventoryTransactions(),
            ])
            setItems(inventoryData)
            setTransactions(txData)
        } catch (error) {
            console.error(error)
            setItems([])
            setTransactions([])
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
            const name = item.productName?.toLowerCase() ?? ""
            const sku = item.sku?.toLowerCase() ?? ""
            const color = item.color?.toLowerCase() ?? ""
            return name.includes(q) || sku.includes(q) || color.includes(q)
        })
    }, [items, keyword])

    const handleImportStock = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await importStock({
                productId: form.productId,
                variantId: form.variantId || undefined,
                quantity: Number(form.quantity),
                note: form.note,
            })
            await loadData()
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
                productId: form.productId,
                variantId: form.variantId || undefined,
                quantity: Number(form.quantity),
                note: form.note,
            })
            await loadData()
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
                    Theo dõi số lượng tồn, nhập thêm hàng và xem lịch sử biến động kho.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <section className="space-y-4">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Tìm theo tên sản phẩm / SKU / màu sắc"
                            className="w-full rounded-xl border px-4 py-3 outline-none"
                        />
                    </div>

                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="px-4 py-3">SKU</th>
                                    <th className="px-4 py-3">Variant</th>
                                    <th className="px-4 py-3">Tồn kho</th>
                                    <th className="px-4 py-3">Khả dụng</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{item.productName}</td>
                                        <td className="px-4 py-3">{item.sku || "—"}</td>
                                        <td className="px-4 py-3">
                                            {[item.color, item.ram, item.storage].filter(Boolean).join(" / ") || "—"}
                                        </td>
                                        <td className="px-4 py-3 font-semibold">{item.stockQuantity}</td>
                                        <td className="px-4 py-3">{item.availableQuantity ?? item.stockQuantity}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-bold">Lịch sử kho</h2>
                        <div className="mt-4 space-y-3">
                            {transactions.length === 0 ? (
                                <div className="text-sm text-brand-gray">Chưa có lịch sử kho</div>
                            ) : (
                                transactions.slice(0, 10).map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between rounded-xl border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">{tx.type}</p>
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
                                placeholder="Variant ID (nếu có)"
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
                            Dùng số dương để cộng thêm, số âm để trừ bớt nếu backend hỗ trợ.
                        </p>

                        <button className="mt-4 w-full rounded-xl border border-brand-dark py-3 font-semibold text-brand-dark">
                            Xác nhận điều chỉnh
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    )
}