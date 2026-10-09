import { useEffect, useState } from "react";
import { getAiJobs, createAiJob, updateAiJob, deleteAiJob, runAiJobNow, getAiJobLogs, type AiJob, type AiJobLog } from "../../../api/aiEcosystemApi";
import { toast } from "../../../utils/toast";
import { Plus, Trash, Play, FileText, X, Clock, Calendar, Edit } from "lucide-react";

export default function AdminAiJobsPage() {
  const [jobs, setJobs] = useState<AiJob[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<AiJob>>({});
  
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [logs, setLogs] = useState<AiJobLog[]>([]);
  const [currentJobId, setCurrentJobId] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getAiJobs();
      setJobs(data);
    } catch (e) {
      toast.error("Lỗi khi tải danh sách Jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async () => {
    if (!editingJob.name || !editingJob.job_type) {
      return toast.error("Vui lòng điền tên và loại Job");
    }
    try {
      if (editingJob.id) {
        await updateAiJob(editingJob.id, editingJob);
        toast.success("Đã cập nhật Job");
      } else {
        await createAiJob(editingJob);
        toast.success("Đã tạo Job mới");
      }
      setIsEditModalOpen(false);
      fetchJobs();
    } catch (e) {
      toast.error("Lỗi khi lưu Job");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa Job này?")) return;
    try {
      await deleteAiJob(id);
      toast.success("Đã xóa Job");
      fetchJobs();
    } catch (e) {
      toast.error("Lỗi khi xóa Job");
    }
  };

  const handleRunNow = async (id: string) => {
    try {
      await runAiJobNow(id);
      toast.success("Đã gửi lệnh chạy Job");
    } catch (e) {
      toast.error("Lỗi khi chạy Job");
    }
  };

  const openLogs = async (id: string) => {
    setCurrentJobId(id);
    setIsLogsModalOpen(true);
    setLogs([]);
    try {
      const data = await getAiJobLogs(id);
      setLogs(data);
    } catch (e) {
      toast.error("Lỗi khi tải lịch sử chạy");
    }
  };

  const handleToggleActive = async (job: AiJob) => {
    try {
      await updateAiJob(job.id, { is_active: !job.is_active });
      fetchJobs();
    } catch (e) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý AI Jobs</h1>
        <button 
          onClick={() => { setEditingJob({ is_active: true, job_type: 'PRICE_UPDATE' }); setIsEditModalOpen(true); }}
          className="bg-brand-blue text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" /> Tạo Job Mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium">Tên Job / Loại</th>
              <th className="px-4 py-3 font-medium">Lịch trình</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Lần chạy / Lỗi</th>
              <th className="px-4 py-3 font-medium">Lần cuối</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">{job.name}</p>
                  <p className="text-xs text-slate-500">{job.job_type}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {job.cron_expression ? (
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {job.cron_expression}</span>
                  ) : job.interval_minutes ? (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.interval_minutes} phút/lần</span>
                  ) : 'Không lặp lại'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleActive(job)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${job.is_active ? 'bg-brand-blue' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${job.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {job.run_count || 0} lần / <span className="text-red-500">{job.error_count || 0} lỗi</span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {job.last_run_at ? new Date(job.last_run_at).toLocaleString('vi-VN') : 'Chưa chạy'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleRunNow(job.id)} title="Chạy ngay" className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Play className="h-4 w-4" /></button>
                    <button onClick={() => openLogs(job.id)} title="Lịch sử" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"><FileText className="h-4 w-4" /></button>
                    <button onClick={() => { setEditingJob(job); setIsEditModalOpen(true); }} title="Sửa" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(job.id)} title="Xóa" className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Chưa có Job nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Cập nhật / Tạo Job */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">{editingJob.id ? 'Sửa Job' : 'Tạo Job Mới'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên Job</label>
                <input type="text" className="w-full border rounded-lg p-2 text-sm" value={editingJob.name || ''} onChange={e => setEditingJob({...editingJob, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Loại Job</label>
                <select className="w-full border rounded-lg p-2 text-sm" value={editingJob.job_type || ''} onChange={e => setEditingJob({...editingJob, job_type: e.target.value})}>
                  <option value="PRICE_UPDATE">Cập nhật giá thị trường</option>
                  <option value="ARTICLE_GEN">Tạo bài viết AI</option>
                  <option value="ARTICLE_UPDATE">Cập nhật bài viết</option>
                  <option value="COMMENT_REPLY">Trả lời Comment tự động</option>
                  <option value="PRODUCT_ENRICH">Làm giàu dữ liệu sản phẩm</option>
                </select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={!!editingJob.interval_minutes || (!editingJob.interval_minutes && !editingJob.cron_expression)} onChange={() => setEditingJob({...editingJob, cron_expression: '', interval_minutes: 60})} /> Khoảng thời gian
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={!!editingJob.cron_expression} onChange={() => setEditingJob({...editingJob, interval_minutes: undefined, cron_expression: '0 0 * * *'})} /> Cron expression
                </label>
              </div>

              {editingJob.cron_expression !== undefined && editingJob.cron_expression !== '' ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Cron Expression</label>
                  <input type="text" className="w-full border rounded-lg p-2 text-sm" value={editingJob.cron_expression || ''} onChange={e => setEditingJob({...editingJob, cron_expression: e.target.value})} placeholder="0 0 * * *" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">Chu kỳ (phút)</label>
                  <input type="number" className="w-full border rounded-lg p-2 text-sm" value={editingJob.interval_minutes || ''} onChange={e => setEditingJob({...editingJob, interval_minutes: parseInt(e.target.value)})} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày bắt đầu (Tùy chọn)</label>
                  <input type="datetime-local" className="w-full border rounded-lg p-2 text-sm" value={editingJob.start_date || ''} onChange={e => setEditingJob({...editingJob, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày kết thúc (Tùy chọn)</label>
                  <input type="datetime-local" className="w-full border rounded-lg p-2 text-sm" value={editingJob.end_date || ''} onChange={e => setEditingJob({...editingJob, end_date: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Config JSON (Tùy chọn)</label>
                <textarea className="w-full border rounded-lg p-2 text-sm" rows={3} value={editingJob.config_json || ''} onChange={e => setEditingJob({...editingJob, config_json: e.target.value})} placeholder='{"category": "laptop"}' />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                <button onClick={handleSaveJob} className="px-4 py-2 text-sm bg-brand-blue text-white rounded-lg hover:bg-blue-600">Lưu Job</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Logs */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button onClick={() => setIsLogsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Lịch sử chạy Job</h2>
            
            <div className="overflow-y-auto flex-1 min-h-[300px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-medium">Thời gian</th>
                    <th className="px-4 py-2 font-medium">Trạng thái</th>
                    <th className="px-4 py-2 font-medium">Thời lượng</th>
                    <th className="px-4 py-2 font-medium">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className="px-4 py-2 text-xs text-slate-600">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">{log.duration_seconds ? `${log.duration_seconds}s` : '-'}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 max-w-[200px] truncate" title={log.error_message || log.result_json}>
                        {log.error_message || log.result_json || '-'}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-500">Chưa có lịch sử</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
