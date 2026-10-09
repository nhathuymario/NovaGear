import { useState } from "react";
import { 
  createAiCatalogDraft, 
  createAiCatalogDraftFromPrompt, 
  createAiCatalogDraftFromUrl,
  approveAiCatalogDraft,
  rejectAiCatalogDraft,
  type AiCatalogDraftJob
} from "../../../api/aiCatalogApi";
import { toast } from "../../../utils/toast";
import { Image, Type, Link as LinkIcon, X, Check, Eye } from "lucide-react";

export default function AdminAiProductsPage() {
  const [activeTab, setActiveTab] = useState<"image" | "prompt" | "url">("image");
  const [drafts, setDrafts] = useState<AiCatalogDraftJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<AiCatalogDraftJob | null>(null);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [hint, setHint] = useState("");
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [aiEnabled, setAiEnabled] = useState(true);

  React.useEffect(() => {
    fetch("/api/ai/v1/ecosystem/settings")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const setting = data.find((s: any) => s.key === "AI_PRODUCT_GEN_ENABLED");
          if (setting && setting.value === "false") {
            setAiEnabled(false);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleCreateFromImage = async () => {
    if (!aiEnabled) return toast.error("Tính năng AI Tạo Sản Phẩm đang bị tắt trong AI Hub.");
    if (!file) return toast.error("Vui lòng chọn ảnh");
    setLoading(true);
    try {
      const job = await createAiCatalogDraft(file, hint);
      setDrafts(prev => [job, ...prev]);
      toast.success("Đã gửi yêu cầu tạo từ ảnh");
      setFile(null);
      setHint("");
    } catch (e) {
      toast.error("Lỗi tạo sản phẩm từ ảnh");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromPrompt = async () => {
    if (!aiEnabled) return toast.error("Tính năng AI Tạo Sản Phẩm đang bị tắt trong AI Hub.");
    if (!prompt) return toast.error("Vui lòng nhập prompt");
    setLoading(true);
    try {
      const job = await createAiCatalogDraftFromPrompt(prompt);
      setDrafts(prev => [job, ...prev]);
      toast.success("Đã gửi yêu cầu tạo từ prompt");
      setPrompt("");
    } catch (e) {
      toast.error("Lỗi tạo sản phẩm từ prompt");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromUrl = async () => {
    if (!aiEnabled) return toast.error("Tính năng AI Tạo Sản Phẩm đang bị tắt trong AI Hub.");
    if (!url) return toast.error("Vui lòng nhập URL");
    setLoading(true);
    try {
      const job = await createAiCatalogDraftFromUrl(url, hint);
      setDrafts(prev => [job, ...prev]);
      toast.success("Đã gửi yêu cầu tạo từ URL");
      setUrl("");
      setHint("");
    } catch (e) {
      toast.error("Lỗi tạo sản phẩm từ URL");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId: string) => {
    try {
      // Giả sử productId = 1 cho demo
      await approveAiCatalogDraft(jobId, 1);
      toast.success("Đã duyệt sản phẩm");
      setDrafts(prev => prev.map(d => d.id === jobId ? { ...d, status: "APPROVED" as any } : d));
      setSelectedDraft(null);
    } catch (e) {
      toast.error("Lỗi khi duyệt");
    }
  };

  const handleReject = async (jobId: string) => {
    try {
      await rejectAiCatalogDraft(jobId, "Từ chối bởi Admin");
      toast.success("Đã từ chối sản phẩm");
      setDrafts(prev => prev.map(d => d.id === jobId ? { ...d, status: "REJECTED" as any } : d));
      setSelectedDraft(null);
    } catch (e) {
      toast.error("Lỗi khi từ chối");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">AI Tạo Sản Phẩm</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button 
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'image' ? 'bg-slate-50 text-brand-blue border-b-2 border-brand-blue' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('image')}
          >
            <Image className="h-4 w-4" /> Tạo từ Ảnh
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'prompt' ? 'bg-slate-50 text-brand-blue border-b-2 border-brand-blue' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('prompt')}
          >
            <Type className="h-4 w-4" /> Tạo từ Prompt
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'url' ? 'bg-slate-50 text-brand-blue border-b-2 border-brand-blue' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('url')}
          >
            <LinkIcon className="h-4 w-4" /> Tạo từ URL
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'image' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
                <Image className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 font-medium">{file ? file.name : "Kéo thả ảnh hoặc click để chọn"}</p>
              </div>
              <input 
                type="text" 
                placeholder="Gợi ý thêm (ví dụ: Đây là iPhone 15 Pro Max)" 
                className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                value={hint} onChange={e => setHint(e.target.value)}
              />
              <button disabled={loading} onClick={handleCreateFromImage} className="w-full bg-brand-blue text-white rounded-lg py-2 font-medium hover:bg-blue-600 disabled:opacity-50">
                {loading ? "Đang xử lý..." : "✨ AI Tạo Sản Phẩm"}
              </button>
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <textarea 
                placeholder="Nhập mô tả sản phẩm (ví dụ: Tạo sản phẩm MacBook Air M2 2022, 8GB RAM, 256GB SSD...)" 
                className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[120px]"
                value={prompt} onChange={e => setPrompt(e.target.value)}
              />
              <button disabled={loading} onClick={handleCreateFromPrompt} className="w-full bg-brand-blue text-white rounded-lg py-2 font-medium hover:bg-blue-600 disabled:opacity-50">
                {loading ? "Đang xử lý..." : "✨ AI Tạo Sản Phẩm"}
              </button>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <input 
                type="url" 
                placeholder="Nhập đường dẫn trang sản phẩm (ví dụ: https://thegioididong.com/...)" 
                className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                value={url} onChange={e => setUrl(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Gợi ý thêm" 
                className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                value={hint} onChange={e => setHint(e.target.value)}
              />
              <button disabled={loading} onClick={handleCreateFromUrl} className="w-full bg-brand-blue text-white rounded-lg py-2 font-medium hover:bg-blue-600 disabled:opacity-50">
                {loading ? "Đang xử lý..." : "✨ AI Tạo Sản Phẩm"}
              </button>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mt-8 mb-4">Danh Sách Bản Nháp (Drafts)</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium">Tên file / Nguồn</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Người tạo</th>
              <th className="px-4 py-3 font-medium">Thời gian</th>
              <th className="px-4 py-3 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drafts.map(draft => (
              <tr key={draft.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">{draft.original_filename || 'N/A'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    draft.status === 'QUEUED' ? 'bg-gray-100 text-gray-700' :
                    draft.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                    draft.status === 'NEEDS_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                    draft.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {draft.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{draft.requested_by || 'Admin'}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(draft.created_at).toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedDraft(draft)} className="text-brand-blue hover:underline flex items-center gap-1 text-xs">
                    <Eye className="h-3 w-3" /> Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
            {drafts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">Chưa có bản nháp nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Draft Details Modal */}
      {selectedDraft && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6 shadow-xl animate-fade-in-right relative">
            <button onClick={() => setSelectedDraft(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">Chi tiết bản nháp</h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Trạng thái:</p>
                <p className="font-semibold">{selectedDraft.status}</p>
              </div>
              
              {selectedDraft.result ? (
                <>
                  <div>
                    <p className="text-slate-500 mb-1">Tên sản phẩm:</p>
                    <p className="font-semibold text-lg">{selectedDraft.result.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Thương hiệu:</p>
                    <p>{selectedDraft.result.brand}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Mô tả ngắn:</p>
                    <p className="text-slate-700">{selectedDraft.result.short_description}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Biến thể ({selectedDraft.result.variants.length}):</p>
                    <ul className="list-disc pl-5 text-slate-700">
                      {selectedDraft.result.variants.map((v, i) => (
                        <li key={i}>{v.sku} - {v.color} - {v.ram}/{v.storage} - {v.price}đ</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-slate-500 italic">Chưa có kết quả AI.</p>
              )}
            </div>

            {selectedDraft.status === 'NEEDS_REVIEW' && (
              <div className="flex gap-3 mt-8">
                <button onClick={() => handleApprove(selectedDraft.id)} className="flex-1 bg-brand-green text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-600">
                  <Check className="h-4 w-4" /> Duyệt & Tạo SP
                </button>
                <button onClick={() => handleReject(selectedDraft.id)} className="flex-1 bg-brand-red text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-600">
                  <X className="h-4 w-4" /> Từ chối
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
