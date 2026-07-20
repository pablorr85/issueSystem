import axios from "axios";
import type {
  TenantConfig,
  IssuePayload,
  Issue,
  PaginatedResponse,
  Operator,
  OperatorTask,
  IssueComment,
  IssueStats,
  TaskLog,
  Zone,
} from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.config &&
      (error.config.url?.includes('/tasks/') || error.config.url?.includes('/operator/hub/'))
    ) {
      window.location.href = '/access-denied';
      return new Promise(() => {});
    }
    return Promise.reject(error);
  }
);

export const getTenantConfig = async (
  tenantId: string,
): Promise<TenantConfig> => {
  const response = await api.get<TenantConfig>(`/tenant/${tenantId}/config/`);
  return response.data;
};

export const getZones = async (): Promise<Zone[]> => {
  const response = await api.get<Zone[]>("/zones/");
  return response.data;
};

export const createZone = async (name: string): Promise<Zone> => {
  const response = await api.post<Zone>("/zones/", { name });
  return response.data;
};

export const createIssue = async (payload: IssuePayload): Promise<Issue> => {
  const formData = new FormData();
  formData.append("tenant_id", payload.tenant_id);
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("extra_data", JSON.stringify(payload.extra_data));

  if (payload.zone !== undefined && payload.zone !== null) {
    formData.append("zone", String(payload.zone));
  }
  if (payload.qa_checklist !== undefined) {
    formData.append("qa_checklist", payload.qa_checklist);
  }

  if (payload.photo_url) {
    formData.append("photo_url", payload.photo_url);
  }
  if (payload.image) {
    formData.append("image", payload.image);
  }

  const response = await api.post<Issue>("/issues/create/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getIssues = async (
  tenantId: string,
  status?: string,
  page?: number,
  board?: boolean,
  assigned?: string,
): Promise<PaginatedResponse<Issue>> => {
  const params: Record<string, string | number | boolean> = { tenant_id: tenantId };
  if (status) params.status = status;
  if (page) params.page = page;
  if (board) params.board = board;
  if (assigned) params.assigned = assigned;

  const response = await api.get<PaginatedResponse<Issue>>("/issues/", {
    params,
  });
  return response.data;
};

export const getIssue = async (id: number): Promise<Issue> => {
  const response = await api.get<Issue>(`/issues/${id}/`);
  return response.data;
};

export const getIssuesStats = async (): Promise<IssueStats> => {
  const response = await api.get<IssueStats>("/issues/stats/");
  return response.data;
};


export const updateIssueStatus = async (
  id: number,
  status: string,
): Promise<Issue> => {
  const response = await api.patch<Issue>(`/issues/${id}/status/`, { status });
  return response.data;
};

export const updateIssue = async (
  id: number,
  payload: {
    title?: string;
    description?: string;
    status?: string;
    assigned_to?: number | null;
    extra_data?: Record<string, unknown>;
    image?: File | null;
    zone?: number | null;
    qa_checklist?: string;
  },
): Promise<Issue> => {
  const isOnlyStatusUpdate =
    payload.status !== undefined &&
    payload.title === undefined &&
    payload.description === undefined &&
    payload.assigned_to === undefined &&
    payload.extra_data === undefined &&
    payload.image === undefined &&
    payload.zone === undefined &&
    payload.qa_checklist === undefined;

  if (isOnlyStatusUpdate) {
    const response = await api.patch<Issue>(`/issues/${id}/status/`, {
      status: payload.status,
    });
    return response.data;
  }

  const formData = new FormData();
  if (payload.title !== undefined) {
    formData.append("title", payload.title);
  }
  if (payload.description !== undefined) {
    formData.append("description", payload.description);
  }
  if (payload.status !== undefined) {
    formData.append("status", payload.status);
  }
  if (payload.zone !== undefined) {
    formData.append("zone", payload.zone !== null ? String(payload.zone) : "");
  }
  if (payload.qa_checklist !== undefined) {
    formData.append("qa_checklist", payload.qa_checklist);
  }
  if (payload.assigned_to !== undefined) {
    formData.append(
      "assigned_to",
      payload.assigned_to !== null ? String(payload.assigned_to) : "",
    );
  }
  if (payload.extra_data !== undefined) {
    formData.append("extra_data", JSON.stringify(payload.extra_data));
  }
  if (payload.image !== undefined) {
    if (payload.image !== null) {
      formData.append("image", payload.image);
    } else {
      formData.append("image", "");
    }
  }

  const response = await api.patch<Issue>(`/issues/${id}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getOperators = async (): Promise<Operator[]> => {
  const response = await api.get<Operator[]>("/operators/");
  return response.data;
};

export const assignIssue = async (
  id: number,
  operatorId: number | null,
  status?: string,
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
  status: string,
): Promise<OperatorTask> => {
  const response = await api.patch<OperatorTask>(`/tasks/${token}/`, {
    status,
  });
  return response.data;
};

export const getOperatorHub = async (
  token: string,
): Promise<OperatorTask[]> => {
  const response = await api.get<OperatorTask[]>("/operator/hub/", {
    params: { token },
  });
  return response.data;
};

export const reorderIssues = async (
  orderedIds: number[],
): Promise<{ status: string }> => {
  const response = await api.post<{ status: string }>("/issues/reorder/", {
    ordered_ids: orderedIds,
  });
  return response.data;
};

export const getIssueComments = async (
  issueId: number,
  token?: string,
): Promise<IssueComment[]> => {
  const params: Record<string, string> = {};
  if (token) params.token = token;

  const response = await api.get<IssueComment[]>(
    `/issues/${issueId}/comments/`,
    { params },
  );
  return response.data;
};

export const addIssueComment = async (
  issueId: number,
  commentText: string,
  token?: string,
): Promise<IssueComment> => {
  const params: Record<string, string> = {};
  if (token) params.token = token;

  const response = await api.post<IssueComment>(
    `/issues/${issueId}/comments/`,
    { comment_text: commentText },
    { params },
  );
  return response.data;
};

export const bulkAssignIssues = async (
  taskIds: number[],
  assigneeId: number | null
): Promise<{ status: string; updated_count: number }> => {
  const response = await api.post<{ status: string; updated_count: number }>(
    "/tasks/bulk-assign/",
    {
      task_ids: taskIds,
      assignee_id: assigneeId,
    }
  );
  return response.data;
};

export const toggleOperatorActive = async (
  id: number,
  isActive: boolean
): Promise<{ id: number; username: string; is_active: boolean }> => {
  const response = await api.post<{ id: number; username: string; is_active: boolean }>(
    `/operators/${id}/toggle-active/`,
    { is_active: isActive }
  );
  return response.data;
};

export const getTaskLogs = async (
  issueId: number,
  token?: string,
): Promise<TaskLog[]> => {
  const params: Record<string, string> = {};
  if (token) params.token = token;

  const response = await api.get<TaskLog[]>(`/issues/${issueId}/logs/`, {
    params,
  });
  return response.data;
};

export const addTaskLog = async (
  issueId: number,
  data: {
    text: string;
    cost?: number;
    time_spent_hours?: number;
    image?: File | null;
    close_task?: boolean;
  },
  token?: string,
): Promise<TaskLog> => {
  const params: Record<string, string> = {};
  if (token) params.token = token;

  const formData = new FormData();
  formData.append("text", data.text);
  if (data.cost !== undefined && data.cost !== null) {
    formData.append("cost", String(data.cost));
  }
  if (data.time_spent_hours !== undefined && data.time_spent_hours !== null) {
    formData.append("time_spent_hours", String(data.time_spent_hours));
  }
  if (data.image) {
    formData.append("image", data.image);
  }
  if (data.close_task !== undefined && data.close_task !== null) {
    formData.append("close_task", String(data.close_task));
  }

  const response = await api.post<TaskLog>(
    `/issues/${issueId}/logs/`,
    formData,
    {
      params,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export default api;

