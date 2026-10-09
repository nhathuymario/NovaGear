import { useEffect, useState } from "react";
import { getAiSettings, updateAiSetting } from "../../../api/aiEcosystemApi";
import { toast } from "../../../utils/toast";

const SETTINGS_SECTIONS = [
  {
    title: "Chức năng chính",
    items: [
      { key: "BOT_CHAT_ENABLED", label: "Bot Chat (Chăm sóc khách hàng)", desc: "Bật/Tắt tính năng Chatbot tự động trả lời khách hàng." },
      { key: "PRODUCT_SUGGESTION_ENABLED", label: "Gợi ý sản phẩm thông minh", desc: "Hiển thị gợi ý sản phẩm liên quan dựa trên ngữ nghĩa." },
      { key: "AI_PRODUCT_GEN_ENABLED", label: "AI tạo sản phẩm tự động", desc: "Cho phép dùng AI để sinh ảnh, mô tả và giá sản phẩm." },
      { key: "AI_ARTICLE_GEN_ENABLED", label: "AI viết bài tự động", desc: "Sử dụng AI để tự động tạo các bài viết chuẩn SEO." },
    ]
  },
  {
    title: "Tính năng tự động",
    items: [
      { key: "AUTO_COMMENT_REPLY_ENABLED", label: "Tự động trả lời comment", desc: "AI tự động trả lời các bình luận của người dùng trên web." },
      { key: "PRICE_UPDATE_ENABLED", label: "Tự động cập nhật giá thị trường", desc: "AI theo dõi và tự động đề xuất giá bán phù hợp." },
      { key: "ARTICLE_AUTO_UPDATE_ENABLED", label: "Tự động cập nhật bài viết", desc: "Tự động làm mới và cập nhật nội dung bài viết định kỳ." },
    ]
  }
];

const DROPDOWN_SETTINGS = [
  {
    title: "Cấu hình ngữ điệu",
    items: [
      { 
        key: "COMMENT_REPLY_TONE", 
        label: "Ngữ điệu trả lời comment", 
        desc: "Cách AI xưng hô và phản hồi khách hàng.",
        options: ["thân thiện", "chuyên nghiệp", "hài hước"]
      }
    ]
  }
];

export default function AdminAiSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getAiSettings();
      const map: Record<string, string> = {};
      data.forEach((s) => (map[s.key] = s.value));
      setSettings(map);
    } catch (e) {
      toast.error("Lỗi khi tải cấu hình AI");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    try {
      await updateAiSetting(key, value);
      setSettings((prev) => ({ ...prev, [key]: value }));
      toast.success("Đã cập nhật cấu hình, trang sẽ tải lại...");
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      toast.error("Không thể cập nhật cấu hình");
    }
  };

  const handleToggle = (key: string) => {
    const current = settings[key] === "true";
    handleUpdate(key, (!current).toString());
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Cấu hình Hệ sinh thái AI</h1>
      
      {SETTINGS_SECTIONS.map((section, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">{section.title}</h2>
          </div>
          <div className="p-6 space-y-6">
            {section.items.map((def) => (
              <div key={def.key} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <h3 className="font-semibold text-slate-800">{def.label}</h3>
                  <p className="text-sm text-slate-500 mt-1">{def.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(def.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings[def.key] === "true" ? "bg-brand-blue" : "bg-slate-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[def.key] === "true" ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {DROPDOWN_SETTINGS.map((section, idx) => (
        <div key={`drop-${idx}`} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">{section.title}</h2>
          </div>
          <div className="p-6 space-y-6">
            {section.items.map((def) => (
              <div key={def.key} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <h3 className="font-semibold text-slate-800">{def.label}</h3>
                  <p className="text-sm text-slate-500 mt-1">{def.desc}</p>
                </div>
                <select
                  value={settings[def.key] || def.options[0]}
                  onChange={(e) => handleUpdate(def.key, e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-blue"
                >
                  {def.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
