import {useState, useCallback} from "react"
import {Plus, Trash2, GripVertical, Upload, Image as ImageIcon, ChevronUp, ChevronDown} from "lucide-react"
import {type BannerItem, saveBanners, generateId, getDefaultBanners} from "../../../utils/storefrontConfig"
import {uploadBannerImage} from "../../../api/uploadApi"

const GRADIENT_OPTIONS = [
    {label: "Dark Blue", value: "from-slate-900 via-blue-900 to-indigo-900"},
    {label: "Emerald", value: "from-emerald-900 via-teal-800 to-cyan-900"},
    {label: "Purple", value: "from-violet-900 via-purple-800 to-fuchsia-900"},
    {label: "Sunset", value: "from-orange-900 via-red-800 to-rose-900"},
    {label: "Dark", value: "from-slate-900 via-slate-800 to-slate-900"},
]

const ACCENT_OPTIONS = [
    {label: "Vàng", value: "text-brand-yellow"},
    {label: "Trắng", value: "text-white"},
    {label: "Xanh lá", value: "text-emerald-300"},
    {label: "Tím", value: "text-violet-300"},
    {label: "Cam", value: "text-orange-300"},
]

interface Props {
    banners: BannerItem[]
    onChange: (banners: BannerItem[]) => void
}

export default function BannerTab({banners, onChange}: Props) {
    const [uploading, setUploading] = useState<string | null>(null)
    const [error, setError] = useState("")

    const update = useCallback((updated: BannerItem[]) => {
        onChange(updated)
        saveBanners(updated)
    }, [onChange])

    const addBanner = () => {
        update([...banners, {
            id: generateId(), title: "Banner mới", subtitle: "Mô tả ngắn",
            imageUrl: "", linkUrl: "/products",
            bgGradient: GRADIENT_OPTIONS[0].value, accentColor: ACCENT_OPTIONS[0].value,
        }])
    }

    const removeBanner = (id: string) => update(banners.filter(b => b.id !== id))

    const moveBanner = (idx: number, dir: -1 | 1) => {
        const next = [...banners]
        const target = idx + dir
        if (target < 0 || target >= next.length) return;
        [next[idx], next[target]] = [next[target], next[idx]]
        update(next)
    }

    const editField = (id: string, field: keyof BannerItem, value: any) => {
        update(banners.map(b => b.id === id ? {...b, [field]: value} : b))
    }

    const handleUpload = async (id: string, file: File) => {
        setUploading(id)
        setError("")
        try {
            const url = await uploadBannerImage(file)
            editField(id, "imageUrl", url)
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Upload thất bại")
        } finally {
            setUploading(null)
        }
    }

    const resetDefaults = () => {
        const defaults = getDefaultBanners()
        update(defaults)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-900">Quản lý Banner</h3>
                    <p className="text-xs text-slate-500">Thêm, sửa, sắp xếp banner trên trang chủ</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={resetDefaults} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                        Reset mặc định
                    </button>
                    <button onClick={addBanner} className="flex items-center gap-1.5 rounded-lg bg-admin-accent px-3 py-2 text-xs font-semibold text-white hover:bg-admin-accent/90">
                        <Plus className="h-3.5 w-3.5" /> Thêm banner
                    </button>
                </div>
            </div>

            {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>}

            {banners.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">
                    Chưa có banner nào. Nhấn "Thêm banner" để bắt đầu.
                </div>
            ) : (
                <div className="space-y-3">
                    {banners.map((banner, idx) => (
                        <div key={banner.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-start gap-4">
                                {/* Reorder + Preview */}
                                <div className="flex flex-col items-center gap-1 pt-1">
                                    <button onClick={() => moveBanner(idx, -1)} disabled={idx === 0} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                                    <GripVertical className="h-4 w-4 text-slate-300" />
                                    <button onClick={() => moveBanner(idx, 1)} disabled={idx === banners.length - 1} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                                </div>

                                {/* Image preview / upload */}
                                <div className="shrink-0">
                                    <label className="group relative block h-24 w-44 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-slate-200 transition hover:border-admin-accent">
                                        {banner.imageUrl ? (
                                            <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${banner.bgGradient}`}>
                                                <ImageIcon className="h-6 w-6 text-white/50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                                            {uploading === banner.id ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : (
                                                <Upload className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(banner.id, f) }} />
                                    </label>
                                    <input 
                                        type="text" 
                                        value={banner.imageUrl} 
                                        onChange={e => editField(banner.id, "imageUrl", e.target.value)}
                                        placeholder="Hoặc nhập URL ảnh..."
                                        className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-[10px]"
                                    />
                                    {banner.imageUrl && (
                                        <button onClick={() => editField(banner.id, "imageUrl", "")} className="mt-1 text-[10px] text-red-500 hover:underline">Xóa ảnh</button>
                                    )}
                                </div>

                                {/* Fields */}
                                <div className="flex-1 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase">Tiêu đề</label>
                                            <input value={banner.title} onChange={e => editField(banner.id, "title", e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase">Mô tả</label>
                                            <input value={banner.subtitle} onChange={e => editField(banner.id, "subtitle", e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="flex items-center justify-between mb-0.5">
                                                <label className="text-[10px] font-semibold text-slate-500 uppercase">Nội dung nút</label>
                                                <label className="flex items-center gap-1 cursor-pointer">
                                                    <input type="checkbox" checked={banner.hideButton !== true} onChange={e => editField(banner.id, "hideButton", !e.target.checked)} className="h-3 w-3 rounded border-slate-300 text-admin-accent cursor-pointer" />
                                                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Hiện nút</span>
                                                </label>
                                            </div>
                                            <input value={banner.buttonText ?? ""} placeholder="Mua ngay" onChange={e => editField(banner.id, "buttonText", e.target.value)}
                                                disabled={banner.hideButton === true}
                                                className={`w-full rounded-lg border px-3 py-1.5 text-sm ${banner.hideButton === true ? "bg-slate-100 border-transparent text-slate-400" : "border-slate-200"}`} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase">Link URL</label>
                                            <input value={banner.linkUrl} onChange={e => editField(banner.id, "linkUrl", e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase">Gradient nền</label>
                                            <select value={banner.bgGradient} onChange={e => editField(banner.id, "bgGradient", e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
                                                {GRADIENT_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase">Màu chữ</label>
                                            <select value={banner.accentColor} onChange={e => editField(banner.id, "accentColor", e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
                                                {ACCENT_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase">Làm mờ ảnh</label>
                                            <div className="mt-1.5 flex items-center h-8">
                                                <input type="checkbox" checked={banner.dimImage !== false} onChange={e => editField(banner.id, "dimImage", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-admin-accent cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete */}
                                <button onClick={() => removeBanner(banner.id)} className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
