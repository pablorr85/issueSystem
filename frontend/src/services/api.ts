import axios from 'axios';
import type { TenantConfig, IssuePayload, Issue, PaginatedResponse, Operator, OperatorTask } from './types';

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
  const formData = new FormData();
  formData.append('tenant_id', payload.tenant_id);
  formData.append('description', payload.description);
  if (payload.photo_url) {
    formData.append('photo_url', payload.photo_url);
  }
  if (payload.image) {
    formData.append('image', payload.image);
  }
  formData.append('extra_data', JSON.stringify(payload.extra_data));

  const response = await api.post<Issue>('/issues/create/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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

export const updateIssue = async (
  id: number,
  payload: {
    description?: string;
    status?: string;
    assigned_to?: number | null;
    extra_data?: Record<string, unknown>;
    image?: File | null;
  }
): Promise<Issue> => {
  if (payload.image === undefined) {
    const response = await api.patch<Issue>(`/issues/${id}/`, payload);
    return response.data;
  }

  const formData = new FormData();
  if (payload.description !== undefined) {
    formData.append('description', payload.description);
  }
  if (payload.status !== undefined) {
    formData.append('status', payload.status);
  }
  if (payload.assigned_to !== undefined) {
    formData.append('assigned_to', payload.assigned_to !== null ? String(payload.assigned_to) : '');
  }
  if (payload.extra_data !== undefined) {
    formData.append('extra_data', JSON.stringify(payload.extra_data));
  }
  if (payload.image !== null) {
    formData.append('image', payload.image);
  } else {
    formData.append('image', '');
  }

  const response = await api.patch<Issue>(`/issues/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getOperators = async (): Promise<Operator[]> => {
  const response = await api.get<Operator[]>('/operators/');
  return response.data;
};

export const assignIssue = async (
  id: number,
  operatorId: number | null,
  status?: string
): Promise<Issue> => {
  const data: { assigned_to: number | null; status?: string } = {
    assigned_to: operatorId,
  };
  if (status) {
    data.status = status;
  }
  const response = await api.patch<Issue>(`/issues/${id}/assign/`, data);
  return response.data;
};

export const getOperatorTask = async (token: string): Promise<OperatorTask> => {
  const response = await api.get<OperatorTask>(`/tasks/${token}/`);
  return response.data;
};

export const updateOperatorTaskStatus = async (
  token: string,
  status: string
): Promise<OperatorTask> => {
  const response = await api.patch<OperatorTask>(`/tasks/${token}/`, { status });
  return response.data;
};

export const getOperatorHub = async (token: string): Promise<OperatorTask[]> => {
  const response = await api.get<OperatorTask[]>('/operator/hub/', {
    params: { token },
  });
  return response.data;
};

export default api;

