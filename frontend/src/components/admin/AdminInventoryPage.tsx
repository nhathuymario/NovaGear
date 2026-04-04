import {useEffect, useMemo, useState} from "react"
// Đồng nhất sử dụng Type từ API để tránh lỗi Incompatible types
import type {InventoryItem, InventoryTransaction} from "../../api/inventoryApi"
import {adjustStock, getAllInventory, getInventoryTransactions, importStock,} from "../../api/inventoryApi"

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
            // Fix TS2554: Truyền "ALL" hoặc rỗng nếu API hỗ trợ lấy tất cả giao dịch
            // Fix TS2345: Bóc tách .items từ InventoryListResult
            const [inventoryData, txData] = await Promise.all([
                getAllInventory(),
                getInventoryTransactions("ALL"),
            ])

            setItems(inventoryData.items)
            setTransactions(txData)
        } catch (error) {
            console.error("Lỗi tải dữ liệu kho:", error)
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
        if (!form.variantId) {
            alert("Vui lòng nhập Variant ID")
            return
        }
        try {
            await importStock({
                variantId: form.variantId,
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
        if (!form.variantId) {
            alert("Vui lòng nhập Variant ID")
            return
        }
        try {
            await adjustStock({
                variantId: form.variantId,
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

    if (loading) return <div className="p-10 text-center font-bold">Đang tải tồn kho...</div>

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

                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
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
                                    <tr key={item.id} className="border-t hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium">{item.productName}</td>
                                        <td className="px-4 py-3">{item.sku || "—"}</td>
                                        <td className="px-4 py-3">
                                            {[item.color, item.ram, item.storage].filter(Boolean).join(" / ") || "—"}
                                        </td>
                                        <td className="px-4 py-3 font-semibold">{item.stockQuantity}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={item.availableQuantity > 0 ? "text-green-600" : "text-red-500"}>
                                                {item.availableQuantity}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold">Lịch sử giao dịch mới nhất</h2>
                        <div className="mt-4 space-y-3">
                            {transactions.length === 0 ? (
                                <div className="text-sm text-brand-gray italic">Chưa có lịch sử biến động kho</div>
                            ) : (
                                transactions.slice(0, 10).map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between rounded-xl border p-3 bg-gray-50/50"
                                    >
                                        <div>
                                            <p className="font-bold text-sm text-brand-dark">{tx.type ?? "GIAO DỊCH"}</p>
                                            <p className="text-xs text-brand-gray">{tx.note || "Không có ghi chú"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${Number(tx.quantity) > 0 ? "text-green-600" : "text-red-500"}`}>
                                                {Number(tx.quantity) > 0 ? `+${tx.quantity}` : tx.quantity}
                                            </p>
                                            <p className="text-[10px] text-gray-400">{tx.createdAt ? new Date(tx.createdAt).toLocaleString("vi-VN") : ""}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <aside className="space-y-6">
                    {/* Nhập kho */}
                    <form
                        onSubmit={handleImportStock}
                        className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
                    >
                        <h2 className="text-lg font-bold mb-4">Nhập kho nhanh</h2>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Variant ID (Bắt buộc)"
                                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-brand-dark"
                                value={form.variantId}
                                onChange={(e) => setForm({...form, variantId: e.target.value})}
                                required
                            />
                            <input
                                type="number"
                                min={1}
                                placeholder="Số lượng nhập"
                                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-brand-dark"
                                value={form.quantity}
                                onChange={(e) => setForm({...form, quantity: Number(e.target.value)})}
                                required
                            />
                            <textarea
                                placeholder="Ghi chú nhập kho..."
                                className="min-h-[100px] w-full rounded-xl border px-4 py-3 outline-none focus:border-brand-dark"
                                value={form.note}
                                onChange={(e) => setForm({...form, note: e.target.value})}
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-4 w-full rounded-xl bg-brand-dark py-3 font-bold text-white transition-opacity hover:opacity-90"
                        >
                            Xác nhận nhập kho
                        </button>
                    </form>

                    {/* Điều chỉnh */}
                    <form
                        onSubmit={handleAdjustStock}
                        className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
                    >
                        <h2 className="text-lg font-bold">Điều chỉnh tồn kho</h2>
                        <p className="mt-1 text-xs text-brand-gray mb-4">
                            Cập nhật lại số lượng thực tế trong kho.
                        </p>
                        <button
                            type="submit"
                            className="w-full rounded-xl border-2 border-brand-dark py-3 font-bold text-brand-dark transition-all hover:bg-gray-50"
                        >
                            Xác nhận điều chỉnh
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    )
}