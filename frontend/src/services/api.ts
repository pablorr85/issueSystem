import axios from 'axios';
import type { TenantConfig, IssuePayload, Issue, PaginatedResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTenantConfig = async (tenantId: string): Promise<TenantConfig> => {
  const response = await api.get<TenantConfig>(`/tenant/${tenantId}/config/`);
  return response.data;
};

export const createIssue = async (payload: IssuePayload): Promise<Issue> => {
  const response = await api.post('/issues/create/', payload);
  return response.data;
};

export const getIssues = async (
  tenantId: string,
  status?: string,
  page?: number
): Promise<PaginatedResponse<Issue>> => {
  const params: Record<string, string | number> = { tenant_id: tenantId };
  if (status) params.status = status;
  if (page) params.page = page;

  const response = await api.get<PaginatedResponse<Issue>>('/issues/', { params });
  return response.data;
};

export const updateIssueStatus = async (id: number, status: string): Promise<Issue> => {
  const response = await api.patch<Issue>(`/issues/${id}/status/`, { status });
  return response.data;
};

export default api;
