import {useState} from "react"
import {Upload, Trash2, RotateCcw} from "lucide-react"
import {uploadLogoImage} from "../../../api/uploadApi"

interface Props {
    logoUrl: string
    onChange: (url: string) => void
}

export default function LogoTab({logoUrl, onChange}: Props) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")

    const handleUpload = async (file: File) => {
        setUploading(true)
        setError("")
        try {
            const url = await uploadLogoImage(file)
            onChange(url)
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Upload thất bại")
        } finally {
            setUploading(false)
        }
    }

    const removeLogo = () => { onChange("") }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-bold text-slate-900">Logo Shop</h3>
                <p className="text-xs text-slate-500">Upload logo hiển thị ở Header và Footer thay vì text "NG"</p>
            </div>

            {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                    {/* Preview */}
                    <div className="space-y-3 text-center">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Preview Header</p>
                        <div className="inline-flex items-center gap-2 rounded-xl bg-brand-yellow px-4 py-3">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded-xl object-contain" />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark text-sm font-black text-brand-yellow shadow-md">NG</div>
                            )}
                            <div>
                                <span className="block text-lg font-black leading-tight text-brand-dark">NovaGear</span>
                                <span className="block text-[10px] font-semibold leading-tight text-brand-dark/60">Premium Tech Store</span>
                            </div>
                        </div>

                        <p className="text-xs font-semibold text-slate-500 uppercase mt-4">Preview Footer</p>
                        <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-9 w-9 rounded-xl object-contain" />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-yellow text-sm font-black text-brand-dark">NG</div>
                            )}
                            <span className="text-lg font-black text-slate-900">NovaGear</span>
                        </div>
                    </div>

                    {/* Upload area */}
                    <div className="flex-1">
                        <label className="group block cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition hover:border-admin-accent hover:bg-admin-accent/5">
                            {uploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-admin-accent border-t-transparent" />
                                    <p className="text-sm text-slate-500">Đang upload...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-8 w-8 text-slate-400 group-hover:text-admin-accent" />
                                    <p className="text-sm font-semibold text-slate-700">Nhấn để chọn logo</p>
                                    <p className="text-xs text-slate-400">PNG, WEBP, JPG • Tối thiểu 64x64px</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
                        </label>

                        <div className="mt-3 flex gap-2">
                            {logoUrl && (
                                <button onClick={removeLogo} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-3.5 w-3.5" /> Xóa logo
                                </button>
                            )}
                            <button onClick={removeLogo} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                                <RotateCcw className="h-3.5 w-3.5" /> Dùng logo mặc định
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
