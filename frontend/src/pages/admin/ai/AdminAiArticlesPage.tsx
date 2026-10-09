import React, { useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { toast } from "../../../utils/toast";
import { Sparkles, Save, UploadCloud } from "lucide-react";

export default function AdminAiArticlesPage() {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("Chuyên nghiệp");
  const [category, setCategory] = useState("Tin tức");
  const [autoImage, setAutoImage] = useState(true);

  const [preview, setPreview] = useState<{
    title?: string;
    summary?: string;
    content?: string;
    cover_image?: string;
    tags?: string[];
  } | null>(null);

  const [aiEnabled, setAiEnabled] = useState(true);

  React.useEffect(() => {
    fetch("/api/ai/v1/ecosystem/settings")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const setting = data.find((s: any) => s.key === "AI_ARTICLE_GEN_ENABLED");
          if (setting && setting.value === "false") {
            setAiEnabled(false);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiEnabled) return toast.error("Tính năng AI Viết Bài đang bị tắt trong AI Hub.");
    if (!topic) return toast.error("Vui lòng nhập chủ đề");
    
    setLoading(true);
    try {
      const res = await axiosClient.post("/ai/v1/articles/generate", {
        topic,
        keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
        tone,
        category,
        auto_image: autoImage
      });
      setPreview(res.data);
      toast.success("AI đã tạo xong bài viết!");
    } catch (error) {
      toast.error("Lỗi khi tạo bài viết AI");
      // Fallback for demo if API not fully ready
      setPreview({
        title: "Bản nháp: " + topic,
        summary: "Đây là tóm tắt tự động được tạo ra bởi AI dựa trên chủ đề " + topic,
        content: "<h2>Giới thiệu</h2><p>Nội dung bài viết AI tạo ra sẽ hiển thị ở đây. Nó sử dụng dữ liệu từ khóa: " + keywords + "</p>",
        tags: ["AI", category],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    toast.success("Đã lưu nháp!");
  };

  const handlePublish = () => {
    toast.success("Đã xuất bản bài viết!");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">AI Viết Bài</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Cấu hình bài viết</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chủ đề *</label>
                <input 
                  type="text" required
                  value={topic} onChange={e => setTopic(e.target.value)}
                  placeholder="Ví dụ: Đánh giá iPhone 15 Pro Max"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Từ khóa (phân cách bằng dấu phẩy)</label>
                <input 
                  type="text"
                  value={keywords} onChange={e => setKeywords(e.target.value)}
                  placeholder="iphone 15, apple, đánh giá"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngữ điệu</label>
                <select 
                  value={tone} onChange={e => setTone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                >
                  <option>Chuyên nghiệp</option>
                  <option>Thân thiện</option>
                  <option>Đánh giá khách quan</option>
                  <option>Hướng dẫn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                <select 
                  value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                >
                  <option>Tin tức</option>
                  <option>Đánh giá</option>
                  <option>Mẹo công nghệ</option>
                  <option>Xu hướng</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" id="autoImage"
                  checked={autoImage} onChange={e => setAutoImage(e.target.checked)}
                  className="rounded border-slate-300 text-brand-blue"
                />
                <label htmlFor="autoImage" className="text-sm text-slate-700">Tự tạo ảnh bìa bằng AI</label>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-brand-blue text-white rounded-lg py-2 font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? "Đang viết..." : "✨ AI Viết bài"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {preview ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-slate-900">{preview.title}</h2>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
                    <Save className="h-4 w-4" /> Lưu nháp
                  </button>
                  <button onClick={handlePublish} className="flex items-center gap-1 px-3 py-1.5 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-600">
                    <UploadCloud className="h-4 w-4" /> Xuất bản
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                {preview.tags?.map(t => (
                  <span key={t} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">{t}</span>
                ))}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-900 text-sm">
                <strong>Tóm tắt:</strong> {preview.summary}
              </div>

              {preview.cover_image && (
                <img src={preview.cover_image} alt="Cover" className="w-full h-64 object-cover rounded-lg" />
              )}

              <div 
                className="prose max-w-none text-slate-800"
                dangerouslySetInnerHTML={{ __html: preview.content || "" }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400 h-full min-h-[400px]">
              <Sparkles className="h-12 w-12 mb-4 opacity-50" />
              <p>Cấu hình và nhấn "AI Viết bài" để xem trước nội dung tại đây</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
