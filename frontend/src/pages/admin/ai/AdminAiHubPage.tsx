import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Bot, Package, Newspaper, ListTodo, Settings, Zap, 
  Brain, TrendingUp, Activity 
} from "lucide-react";
import { getAiDashboard, getAiSettings, updateAiSetting, type AiDashboard } from "../../../api/aiEcosystemApi";
import { toast } from "../../../utils/toast";

export default function AdminAiHubPage() {
  const [dashboard, setDashboard] = useState<AiDashboard | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashData, setData] = await Promise.all([
        getAiDashboard(),
        getAiSettings()
      ]);
      setDashboard(dashData);
      
      const map: Record<string, string> = {};
      setData.forEach((s) => (map[s.key] = s.value));
      setSettings(map);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu Hub");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    const current = settings[key] === "true";
    const newVal = (!current).toString();
    try {
      await updateAiSetting(key, newVal);
      setSettings((prev) => ({ ...prev, [key]: newVal }));
      toast.success("Đã cập nhật cấu hình, trang sẽ tải lại...");
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      toast.error("Không thể cập nhật cấu hình");
    }
  };

  if (loading || !dashboard) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-brand-blue" />
        <h1 className="text-2xl font-bold text-slate-800">AI Hub</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-lg text-white">
            <ListTodo className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tổng Jobs</p>
            <p className="text-2xl font-bold text-slate-800">{dashboard.total_jobs}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-green-500 rounded-lg text-white">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Jobs Hoạt Động</p>
            <p className="text-2xl font-bold text-slate-800">{dashboard.active_jobs}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-purple-500 rounded-lg text-white">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">AI Drafts</p>
            <p className="text-2xl font-bold text-slate-800">{dashboard.total_drafts}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-orange-500 rounded-lg text-white">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">AI Bài Viết</p>
            <p className="text-2xl font-bold text-slate-800">{dashboard.total_articles}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/ai/products" className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-brand-blue transition group flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-brand-blue group-hover:text-white transition">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Tạo Sản Phẩm</p>
                <p className="text-xs text-slate-500">Tạo nháp từ ảnh, link, prompt</p>
              </div>
            </Link>
            <Link to="/admin/ai/articles" className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-brand-blue transition group flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-brand-blue group-hover:text-white transition">
                <Newspaper className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Viết Bài AI</p>
                <p className="text-xs text-slate-500">Auto SEO & Ảnh bìa</p>
              </div>
            </Link>
            <Link to="/admin/ai/jobs" className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-brand-blue transition group flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-brand-blue group-hover:text-white transition">
                <ListTodo className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Quản lý Jobs</p>
                <p className="text-xs text-slate-500">Cập nhật giá, comment...</p>
              </div>
            </Link>
            <Link to="/admin/ai/settings" className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-brand-blue transition group flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-brand-blue group-hover:text-white transition">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Cài đặt AI</p>
                <p className="text-xs text-slate-500">Tùy chỉnh hệ sinh thái</p>
              </div>
            </Link>
          </div>

          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-8">
            <TrendingUp className="h-5 w-5" /> Hoạt Động Gần Đây
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Job ID</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                  <th className="px-4 py-3 font-medium">Lỗi (nếu có)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.recent_logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{log.job_id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                        log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-red-500 text-xs">{log.error_message || '-'}</td>
                  </tr>
                ))}
                {dashboard.recent_logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">Không có hoạt động gần đây</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5" /> Trạng Thái Tính Năng
          </h2>
          <div className="space-y-4">
            {[
              { key: "BOT_CHAT_ENABLED", label: "Bot Chat" },
              { key: "PRODUCT_SUGGESTION_ENABLED", label: "Gợi ý SP thông minh" },
              { key: "AI_PRODUCT_GEN_ENABLED", label: "AI Tạo Sản Phẩm" },
              { key: "AI_ARTICLE_GEN_ENABLED", label: "AI Viết Bài" }
            ].map(def => (
              <div key={def.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm font-medium text-slate-700">{def.label}</span>
                <button
                  onClick={() => handleToggle(def.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings[def.key] === "true" ? "bg-brand-blue" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings[def.key] === "true" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
