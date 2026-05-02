import {useCallback} from "react"
import {type PromoItem, savePromos, getDefaultPromos} from "../../../utils/storefrontConfig"

const ICON_OPTIONS = ["Gift", "Zap", "Flame", "Timer", "Star", "Heart", "Tag", "Percent", "ShoppingBag", "Award"]
const COLOR_PRESETS = [
    {label: "Tím", bg: "bg-violet-50", text: "text-violet-700"},
    {label: "Vàng", bg: "bg-amber-50", text: "text-amber-700"},
    {label: "Đỏ", bg: "bg-red-50", text: "text-red-700"},
    {label: "Xanh lá", bg: "bg-emerald-50", text: "text-emerald-700"},
    {label: "Xanh dương", bg: "bg-blue-50", text: "text-blue-700"},
    {label: "Hồng", bg: "bg-pink-50", text: "text-pink-700"},
]

interface Props {
    promos: PromoItem[]
    onChange: (promos: PromoItem[]) => void
}

export default function PromoTab({promos, onChange}: Props) {
    const update = useCallback((updated: PromoItem[]) => {
        onChange(updated)
        savePromos(updated)
    }, [onChange])

    const editField = (id: string, field: keyof PromoItem, value: string) => {
        update(promos.map(p => p.id === id ? {...p, [field]: value} : p))
    }

    const setColor = (id: string, bg: string, text: string) => {
        update(promos.map(p => p.id === id ? {...p, colorBg: bg, colorText: text} : p))
    }

    const resetDefaults = () => { const d = getDefaultPromos(); update(d) }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-900">Ưu đãi & Deal</h3>
                    <p className="text-xs text-slate-500">Chỉnh sửa 4 mục ưu đãi trên trang chủ</p>
                </div>
                <button onClick={resetDefaults} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    Reset mặc định
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {promos.map(promo => (
                    <div key={promo.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                        {/* Preview */}
                        <div className={`flex items-center gap-3 rounded-xl border border-slate-100 ${promo.colorBg} ${promo.colorText} px-4 py-3 text-sm font-semibold`}>
                            <span className="text-lg">{getIconEmoji(promo.icon)}</span>
                            {promo.text}
                        </div>

                        <div>
                            <label className="text-[10px] font-semibold text-slate-500 uppercase">Nội dung</label>
                            <input value={promo.text} onChange={e => editField(promo.id, "text", e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase">Icon</label>
                                <select value={promo.icon} onChange={e => editField(promo.id, "icon", e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
                                    {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase">Link URL</label>
                                <input value={promo.linkUrl} onChange={e => editField(promo.id, "linkUrl", e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-semibold text-slate-500 uppercase">Màu sắc</label>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                                {COLOR_PRESETS.map(c => (
                                    <button key={c.label} onClick={() => setColor(promo.id, c.bg, c.text)}
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${c.bg} ${c.text} ${
                                            promo.colorBg === c.bg ? "ring-2 ring-admin-accent ring-offset-1" : ""
                                        }`}>
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function getIconEmoji(name: string): string {
    const map: Record<string, string> = {
        Gift: "🎁", Zap: "⚡", Flame: "🔥", Timer: "⏱️", Star: "⭐",
        Heart: "❤️", Tag: "🏷️", Percent: "💯", ShoppingBag: "🛍️", Award: "🏆",
    }
    return map[name] || "📦"
}
