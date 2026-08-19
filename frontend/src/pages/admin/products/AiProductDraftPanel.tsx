import {useState} from "react"
import {AlertTriangle, Bot, CheckCircle2, ExternalLink, LoaderCircle, Search, Sparkles} from "lucide-react"
import {
    type AiCatalogDraftJob,
    createAiCatalogDraft,
    waitForAiCatalogDraft,
} from "../../../api/aiCatalogApi"

type Props = {
    onApply: (job: AiCatalogDraftJob, file: File) => Promise<void>
}

function formatCurrency(value: number, currency = "VND") {
    return new Intl.NumberFormat("vi-VN", {style: "currency", currency}).format(value)
}

export default function AiProductDraftPanel({onApply}: Readonly<Props>) {
    const [file, setFile] = useState<File | null>(null)
    const [hint, setHint] = useState("")
    const [job, setJob] = useState<AiCatalogDraftJob | null>(null)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState("")

    const analyze = async () => {
        if (!file) {
            setError("Vui lòng chọn ảnh sản phẩm trước.")
            return
        }

        try {
            setProcessing(true)
            setError("")
            const queuedJob = await createAiCatalogDraft(file, hint)
            setJob(queuedJob)
            const completedJob = await waitForAiCatalogDraft(queuedJob.id)
            setJob(completedJob)
            if (completedJob.status === "FAILED" || !completedJob.result) {
                throw new Error(completedJob.error_message || "AI không tạo được dữ liệu nháp.")
            }
            await onApply(completedJob, file)
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Phân tích ảnh thất bại")
        } finally {
            setProcessing(false)
        }
    }

    const draft = job?.result

    return (
        <section className="overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-violet-600 p-2 text-white"><Bot className="h-5 w-5"/></div>
                    <div>
                        <h2 className="font-bold text-slate-900">AI Product Draft</h2>
                        <p className="text-xs text-slate-500">Nhận diện ảnh, tham khảo giá và điền bản nháp chờ duyệt</p>
                    </div>
                </div>
                {draft && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5"/> Đã điền form · {Math.round(draft.confidence * 100)}%
                    </span>
                )}
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-[1fr_1fr_auto]">
                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Ảnh sản phẩm</span>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-1.5 file:font-semibold file:text-violet-700"
                    />
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Gợi ý model (không bắt buộc)</span>
                    <input
                        value={hint}
                        onChange={(event) => setHint(event.target.value)}
                        placeholder="VD: ASUS ROG Zephyrus G14"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                    />
                </label>
                <button
                    type="button"
                    onClick={analyze}
                    disabled={processing || !file}
                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>}
                    {processing ? "AI đang nghiên cứu..." : "Phân tích & điền form"}
                </button>
            </div>

            {processing && (
                <div className="mx-5 mb-5 flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs text-cyan-800">
                    <Search className="h-4 w-4"/> Job {job?.id?.slice(0, 8) || "đang tạo"}: nhận diện ảnh và tìm nguồn tham khảo.
                </div>
            )}

            {error && (
                <div className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0"/> {error}
                </div>
            )}

            {draft && (
                <div className="grid gap-4 border-t border-violet-100 p-5 lg:grid-cols-3">
                    <div className="rounded-xl bg-white/80 p-4 ring-1 ring-slate-100">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nhận diện</p>
                        <p className="mt-2 font-bold text-slate-900">{draft.name}</p>
                        <p className="text-xs text-slate-500">{draft.brand} {draft.model_number ? `· ${draft.model_number}` : ""}</p>
                        <p className="mt-2 text-xs text-slate-600">{draft.variants.length} biến thể · {draft.specifications.length} thông số</p>
                    </div>
                    <div className="rounded-xl bg-white/80 p-4 ring-1 ring-slate-100">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Giá tham khảo</p>
                        {draft.price_observations.length ? draft.price_observations.slice(0, 3).map((item) => (
                            <a key={`${item.source_url}-${item.price}`} href={item.source_url} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600 hover:text-violet-700">
                                <span className="truncate">{item.seller || "Nguồn web"}</span>
                                <strong className="whitespace-nowrap">{formatCurrency(item.price, item.currency)}</strong>
                            </a>
                        )) : <p className="mt-2 text-xs text-slate-500">Chưa tìm thấy giá đáng tin cậy.</p>}
                    </div>
                    <div className="rounded-xl bg-white/80 p-4 ring-1 ring-slate-100">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nguồn & cảnh báo</p>
                        {draft.sources.slice(0, 2).map((source) => (
                            <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-xs font-medium text-violet-700 hover:underline">
                                <ExternalLink className="h-3 w-3 shrink-0"/><span className="truncate">{source.publisher || source.title}</span>
                            </a>
                        ))}
                        {draft.warnings.slice(0, 2).map((warning) => (
                            <p key={warning} className="mt-2 flex items-start gap-1 text-xs text-amber-700"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0"/>{warning}</p>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}
