import {useState, useEffect, useMemo} from "react"
import {Search, Shuffle, Lock} from "lucide-react"
import type {FlashSaleConfig} from "../../../types/storefront"
import {getProducts} from "../../../api/productApi"
import type {Product} from "../../../types/product"

interface Props {
    config: FlashSaleConfig
    onChange: (config: FlashSaleConfig) => void
}

export default function FlashSaleTab({config, onChange}: Props) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState("")

    useEffect(() => {
        getProducts().then(setProducts).finally(() => setLoading(false))
    }, [])

    const filtered = useMemo(() => {
        if (!keyword.trim()) return products
        const kw = keyword.toLowerCase()
        return products.filter(p => p.name.toLowerCase().includes(kw) || p.category?.toLowerCase().includes(kw))
    }, [products, keyword])

    const update = (partial: Partial<FlashSaleConfig>) => {
        const next = {...config, ...partial}
        onChange(next)
    }

    const toggleProduct = (id: string) => {
        const ids = config.productIds.includes(id)
            ? config.productIds.filter(i => i !== id)
            : [...config.productIds, id]
        update({productIds: ids})
    }

    const selectAll = () => update({productIds: products.filter(p => p.salePrice != null && p.salePrice < p.price).map(p => String(p.id))})
    const clearAll = () => update({productIds: []})
    const resetDefaults = () => { onChange({mode: "fixed", productIds: [], displayCount: 8, countdownHour: 23, countdownMinute: 59}) }

    const fmt = (v: number) => v.toLocaleString("vi-VN") + "₫"

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-900">Quản lý Flash Sale</h3>
                    <p className="text-xs text-slate-500">Chọn sản phẩm và chế độ hiển thị flash sale</p>
                </div>
                <button onClick={resetDefaults} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Reset</button>
            </div>

            {/* Mode selector */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-sm font-bold text-slate-900">Chế độ hiển thị</p>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => update({mode: "fixed"})}
                        className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${config.mode === "fixed" ? "border-admin-accent bg-admin-accent/5" : "border-slate-200 hover:border-slate-300"}`}>
                        <Lock className={`h-5 w-5 ${config.mode === "fixed" ? "text-admin-accent" : "text-slate-400"}`} />
                        <div>
                            <p className="text-sm font-bold text-slate-900">Cố định</p>
                            <p className="text-[11px] text-slate-500">Luôn hiển thị các sản phẩm đã chọn</p>
                        </div>
                    </button>
                    <button onClick={() => update({mode: "random"})}
                        className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${config.mode === "random" ? "border-admin-accent bg-admin-accent/5" : "border-slate-200 hover:border-slate-300"}`}>
                        <Shuffle className={`h-5 w-5 ${config.mode === "random" ? "text-admin-accent" : "text-slate-400"}`} />
                        <div>
                            <p className="text-sm font-bold text-slate-900">Random</p>
                            <p className="text-[11px] text-slate-500">Random sản phẩm mỗi lần countdown kết thúc</p>
                        </div>
                    </button>
                </div>

                {config.mode === "random" && (
                    <div className="mt-3 flex items-center gap-3">
                        <label className="text-xs font-semibold text-slate-600">Số SP hiển thị mỗi lần:</label>
                        <input type="number" min={1} max={20} value={config.displayCount}
                            onChange={e => update({displayCount: Math.max(1, Number(e.target.value))})}
                            className="w-20 rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                    </div>
                )}
            </div>

            {/* Product selection */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Chọn sản phẩm ({config.productIds.length} đã chọn)</p>
                    <div className="flex gap-2">
                        <button onClick={selectAll} className="text-[11px] font-semibold text-admin-accent hover:underline">Chọn tất cả SP sale</button>
                        <button onClick={clearAll} className="text-[11px] font-semibold text-red-500 hover:underline">Bỏ chọn tất cả</button>
                    </div>
                </div>

                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tìm sản phẩm..."
                        className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm" />
                </div>

                {loading ? (
                    <div className="py-8 text-center text-sm text-slate-500">Đang tải sản phẩm...</div>
                ) : (
                    <div className="max-h-80 space-y-1 overflow-y-auto">
                        {filtered.map(p => {
                            const checked = config.productIds.includes(String(p.id))
                            const hasSale = p.salePrice != null && p.salePrice < p.price
                            return (
                                <label key={p.id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition ${checked ? "bg-admin-accent/5" : "hover:bg-slate-50"}`}>
                                    <input type="checkbox" checked={checked} onChange={() => toggleProduct(String(p.id))}
                                        className="h-4 w-4 rounded border-slate-300 text-admin-accent" />
                                    {p.imageUrl && <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover border border-slate-100" />}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                                        <p className="text-[11px] text-slate-500">{p.category}</p>
                                    </div>
                                    <div className="text-right">
                                        {hasSale ? (
                                            <>
                                                <p className="text-xs font-bold text-red-600">{fmt(p.salePrice!)}</p>
                                                <p className="text-[10px] text-slate-400 line-through">{fmt(p.price)}</p>
                                            </>
                                        ) : (
                                            <p className="text-xs font-semibold text-slate-700">{fmt(p.price)}</p>
                                        )}
                                    </div>
                                </label>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
