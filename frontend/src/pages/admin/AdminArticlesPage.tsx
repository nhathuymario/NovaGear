import {useCallback, useEffect, useState} from "react"
import {motion} from "framer-motion"
import {
    Calendar, Check, ChevronDown, Edit3, Eye, FileText, Loader2,
    Newspaper, Plus, Sparkles, Trash2, X, Image as ImageIcon, UploadCloud
} from "lucide-react"
import {
    createArticle, deleteArticle, generateArticle, getArticles,
    updateArticle, uploadArticleImage, type ArticleCreateRequest, type ArticleItem, type ArticleImageItem
} from "../../api/articleApi"

const TONE_OPTIONS = [
    {value: "professional", label: "Chuyên nghiệp"},
    {value: "casual", label: "Thân thiện"},
    {value: "review", label: "Đánh giá"},
    {value: "tutorial", label: "Hướng dẫn"},
] as const

const CATEGORY_OPTIONS = ["Công nghệ", "Laptop", "Smartphone", "Review", "Mẹo vặt", "PC Gaming", "Phụ kiện"]

function formatDate(d: string) {
    try { return new Intl.DateTimeFormat("vi-VN", {day: "2-digit", month: "2-digit", year: "numeric"}).format(new Date(d)) }
    catch { return d }
}

type ModalMode = "closed" | "create" | "edit" | "generate"

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<ArticleItem[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(true)
    const [modalMode, setModalMode] = useState<ModalMode>("closed")
    const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    // Form fields
    const [title, setTitle] = useState("")
    const [summary, setSummary] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState("Công nghệ")
    const [tagsStr, setTagsStr] = useState("")
    const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT")
    const [images, setImages] = useState<ArticleImageItem[]>([])
    const [uploading, setUploading] = useState(false)

    // AI generate fields
    const [aiTopic, setAiTopic] = useState("")
    const [aiKeywords, setAiKeywords] = useState("")
    const [aiTone, setAiTone] = useState<"professional" | "casual" | "review" | "tutorial">("professional")
    const [aiCategory, setAiCategory] = useState("Công nghệ")

    const limit = 15

    const fetchArticles = useCallback(() => {
        setLoading(true)
        getArticles(page, limit).then(res => {
            setArticles(res.items)
            setTotal(res.total)
        }).catch(() => { setArticles([]); setTotal(0) })
        .finally(() => setLoading(false))
    }, [page])

    useEffect(() => { fetchArticles() }, [fetchArticles])

    const openCreate = () => {
        setTitle(""); setSummary(""); setContent(""); setCategory("Công nghệ")
        setTagsStr(""); setStatus("DRAFT"); setImages([]); setEditingArticle(null)
        setModalMode("create")
    }

    const openEdit = (a: ArticleItem) => {
        setTitle(a.title); setSummary(a.summary); setContent(a.content)
        setCategory(a.category); setTagsStr(a.tags.join(", ")); setStatus(a.status)
        setImages(a.images || []); setEditingArticle(a); setModalMode("edit")
    }

    const openGenerate = () => {
        setAiTopic(""); setAiKeywords(""); setAiTone("professional"); setAiCategory("Công nghệ")
        setImages([]); setModalMode("generate")
    }

    const closeModal = () => { setModalMode("closed"); setEditingArticle(null) }

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) return
        setSaving(true)
        try {
            const tags = tagsStr.split(",").map(t => t.trim()).filter(Boolean)
            if (modalMode === "edit" && editingArticle) {
                await updateArticle(editingArticle.id, {title, summary, content, category, tags, status, images})
            } else {
                const data: ArticleCreateRequest = {title, summary, content, category, tags, status, images}
                await createArticle(data)
            }
            closeModal(); fetchArticles()
        } catch { /* silently handle */ }
        finally { setSaving(false) }
    }

    const handleGenerate = async () => {
        if (!aiTopic.trim()) return
        setSaving(true)
        try {
            const keywords = aiKeywords.split(",").map(k => k.trim()).filter(Boolean)
            const generated = await generateArticle({topic: aiTopic, keywords, tone: aiTone, category: aiCategory})
            // Open edit mode with generated content
            setTitle(generated.title); setSummary(generated.summary); setContent(generated.content)
            setCategory(generated.category); setTagsStr(generated.tags.join(", ")); setStatus("DRAFT")
            
            const generatedImages = generated.images?.map((img, idx) => ({
                imageUrl: img.imageUrl,
                caption: img.caption,
                displayOrder: idx
            })) || []
            setImages(generatedImages); 
            setEditingArticle(generated); setModalMode("edit")
            fetchArticles()
        } catch { /* silently handle */ }
        finally { setSaving(false) }
    }

    const handleDelete = async (id: string) => {
        try { await deleteArticle(id); fetchArticles() }
        catch { /* silently handle */ }
        finally { setDeleteConfirm(null) }
    }

    const handleToggleStatus = async (a: ArticleItem) => {
        const newStatus = a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
        try { await updateArticle(a.id, {status: newStatus}); fetchArticles() }
        catch { /* silently handle */ }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return
        setUploading(true)
        try {
            const newImages = [...images]
            for (let i = 0; i < e.target.files.length; i++) {
                const url = await uploadArticleImage(e.target.files[i])
                newImages.push({
                    imageUrl: url,
                    displayOrder: newImages.length,
                })
            }
            setImages(newImages)
        } catch (error) {
            console.error("Upload failed", error)
        } finally {
            setUploading(false)
            if (e.target) e.target.value = "" // reset input
        }
    }

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Quản lý bài viết</h2>
                    <p className="text-sm text-slate-500">Tạo và quản lý bài viết công nghệ cho blog</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={openGenerate} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl">
                        <Sparkles className="h-4 w-4" /> AI Tạo bài viết
                    </button>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
                        <Plus className="h-4 w-4" /> Tạo thủ công
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    {label: "Tổng bài viết", value: total, color: "bg-indigo-50 text-indigo-700"},
                    {label: "Đã xuất bản", value: articles.filter(a => a.status === "PUBLISHED").length, color: "bg-emerald-50 text-emerald-700"},
                    {label: "Bản nháp", value: articles.filter(a => a.status === "DRAFT").length, color: "bg-amber-50 text-amber-700"},
                ].map(s => (
                    <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                        <p className={`mt-1 text-2xl font-black ${s.color.split(" ")[1]}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="py-16 text-center">
                        <Newspaper className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-600">Chưa có bài viết nào</p>
                        <p className="text-xs text-slate-400">Hãy tạo bài viết đầu tiên bằng AI!</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-slate-600">Tiêu đề</th>
                                <th className="hidden px-4 py-3 font-semibold text-slate-600 md:table-cell">Danh mục</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
                                <th className="hidden px-4 py-3 font-semibold text-slate-600 md:table-cell">Ngày tạo</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {articles.map(a => (
                                <tr key={a.id} className="transition hover:bg-slate-50/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                                                <FileText className="h-4 w-4 text-indigo-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900">{a.title}</p>
                                                <p className="truncate text-xs text-slate-400">{a.author}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden px-4 py-3 md:table-cell">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{a.category}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleToggleStatus(a)} className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${a.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                            {a.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
                                        </button>
                                    </td>
                                    <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(a.created_at)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <a href={`/tech/${a.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title="Xem">
                                                <Eye className="h-4 w-4" />
                                            </a>
                                            <button onClick={() => openEdit(a)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600" title="Sửa">
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            {deleteConfirm === a.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => handleDelete(a.id)} className="rounded-lg bg-red-500 p-2 text-white"><Check className="h-4 w-4" /></button>
                                                    <button onClick={() => setDeleteConfirm(null)} className="rounded-lg bg-slate-200 p-2 text-slate-600"><X className="h-4 w-4" /></button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setDeleteConfirm(a.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500" title="Xóa">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-1">
                    {Array.from({length: totalPages}).map((_, i) => (
                        <button key={i} onClick={() => setPage(i)} className={`h-8 w-8 rounded-lg text-xs font-semibold ${i === page ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>{i + 1}</button>
                    ))}
                </div>
            )}

            {/* ── Modal ────────────────────────────────────────────── */}
            {modalMode !== "closed" && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16">
                    <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                {modalMode === "generate" ? "🤖 AI Tạo bài viết" : modalMode === "edit" ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
                            </h3>
                            <button onClick={closeModal} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-6">
                            {modalMode === "generate" ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Chủ đề *</label>
                                        <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="VD: RTX 5090 vs RTX 4090 — So sánh hiệu năng" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Từ khóa (cách nhau bằng dấu phẩy)</label>
                                        <input value={aiKeywords} onChange={e => setAiKeywords(e.target.value)} placeholder="GPU, gaming, benchmark" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">Phong cách</label>
                                            <div className="relative">
                                                <select value={aiTone} onChange={e => setAiTone(e.target.value as typeof aiTone)} className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400">
                                                    {TONE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">Danh mục</label>
                                            <div className="relative">
                                                <select value={aiCategory} onChange={e => setAiCategory(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400">
                                                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Tiêu đề *</label>
                                        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Tóm tắt</label>
                                        <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Nội dung (Markdown) *</label>
                                        <textarea value={content} onChange={e => setContent(e.target.value)} rows={12} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">Danh mục</label>
                                            <div className="relative">
                                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400">
                                                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-semibold text-slate-700">Trạng thái</label>
                                            <div className="relative">
                                                <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400">
                                                    <option value="DRAFT">Bản nháp</option>
                                                    <option value="PUBLISHED">Xuất bản</option>
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Tags (cách nhau bằng dấu phẩy)</label>
                                        <input value={tagsStr} onChange={e => setTagsStr(e.target.value)} placeholder="laptop, gaming, review" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                                    </div>
                                    
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">Hình ảnh bài viết</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                            {images.map((img, idx) => (
                                                <div key={idx} className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 aspect-video">
                                                    <img src={`/api/admin/articles${img.imageUrl}`} alt="" className="h-full w-full object-cover" />
                                                    <button 
                                                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                        className="absolute right-2 top-2 rounded-lg bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <input 
                                                            value={img.caption || ""} 
                                                            onChange={e => {
                                                                const newImages = [...images];
                                                                newImages[idx].caption = e.target.value;
                                                                setImages(newImages);
                                                            }}
                                                            placeholder="Chú thích ảnh..." 
                                                            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/60"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 aspect-video transition hover:border-indigo-400 hover:bg-indigo-50">
                                                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                                                {uploading ? (
                                                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                                ) : (
                                                    <>
                                                        <UploadCloud className="mb-2 h-6 w-6 text-slate-400" />
                                                        <span className="text-xs font-medium text-slate-500">Tải ảnh lên</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
                            <button onClick={closeModal} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hủy</button>
                            <button
                                onClick={modalMode === "generate" ? handleGenerate : handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {modalMode === "generate" ? "Tạo bằng AI" : "Lưu bài viết"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
