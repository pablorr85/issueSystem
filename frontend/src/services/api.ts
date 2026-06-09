import axios from 'axios';
import type { TenantConfig, IssuePayload } from './types';

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

export const createIssue = async (payload: IssuePayload): Promise<any> => {
  const response = await api.post('/issues/create/', payload);
  return response.data;
};

export default api;
