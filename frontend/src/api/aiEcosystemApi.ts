import axiosClient from './axiosClient';

export interface AiSetting {
  key: string;
  value: string;
  description?: string;
}

export interface AiJobLog {
  id: string;
  job_id: string;
  status: string;
  result_json?: string;
  error_message?: string;
  duration_seconds?: number;
  created_at: string;
}

export interface AiDashboard {
  total_jobs: number;
  active_jobs: number;
  total_drafts: number;
  total_articles: number;
  recent_logs: AiJobLog[];
  settings: Record<string, string>;
}

export interface AiJob {
  id: string;
  name: string;
  job_type: string;
  cron_expression?: string;
  interval_minutes?: number;
  is_active: boolean;
  config_json?: string;
  last_run_at?: string;
  next_run_at?: string;
  start_date?: string;
  end_date?: string;
  run_count?: number;
  error_count?: number;
  last_error?: string;
  last_result_json?: string;
}

const BASE_URL = '/ai/v1/ecosystem';

export async function getAiSettings(): Promise<AiSetting[]> {
  const res = await axiosClient.get(BASE_URL + '/settings');
  return res.data;
}

export async function updateAiSetting(key: string, value: string): Promise<AiSetting> {
  const res = await axiosClient.put(BASE_URL + '/settings/' + key, { value });
  return res.data;
}

export async function getAiJobs(): Promise<AiJob[]> {
  const res = await axiosClient.get(BASE_URL + '/jobs');
  return res.data;
}

export async function createAiJob(data: Partial<AiJob>): Promise<AiJob> {
  const res = await axiosClient.post(BASE_URL + '/jobs', data);
  return res.data;
}

export async function updateAiJob(id: string, data: Partial<AiJob>): Promise<AiJob> {
  const res = await axiosClient.put(BASE_URL + '/jobs/' + id, data);
  return res.data;
}

export async function deleteAiJob(id: string): Promise<void> {
  await axiosClient.delete(BASE_URL + '/jobs/' + id);
}

export async function runAiJobNow(id: string): Promise<{ detail: string }> {
  const res = await axiosClient.post(BASE_URL + '/jobs/' + id + '/run-now');
  return res.data;
}

export async function getAiJobLogs(jobId: string, limit = 20): Promise<AiJobLog[]> {
  const res = await axiosClient.get(BASE_URL + '/jobs/' + jobId + '/logs', { params: { limit } });
  return res.data;
}

export async function getAiDashboard(): Promise<AiDashboard> {
  const res = await axiosClient.get(BASE_URL + '/dashboard');
  return res.data;
}
