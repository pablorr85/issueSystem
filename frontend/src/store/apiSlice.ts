import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  TenantConfig,
  Issue,
  PaginatedResponse,
  Operator,
  IssueStats,
  TaskLog,
  Zone,
} from "../services/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export interface GetIssuesQueryParams {
  tenantId: string;
  status?: string;
  page?: number;
  assigned?: string;
  operator_id?: string;
  urgency?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  board?: boolean;
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Issue", "Operator", "Tenant", "Zone", "TaskLog", "IssueStats"],
  endpoints: (builder) => ({
    getTenantConfig: builder.query<TenantConfig, string>({
      query: (tenantId) => `/tenant/${tenantId}/config/`,
      providesTags: (_result, _error, id) => [{ type: "Tenant", id }],
    }),

    getIssues: builder.query<PaginatedResponse<Issue>, GetIssuesQueryParams>({
      query: (params) => {
        const query = new URLSearchParams();
        query.append("tenant_id", params.tenantId);
        if (params.status) query.append("status", params.status);
        if (params.page) query.append("page", String(params.page));
        if (params.assigned) query.append("assigned", params.assigned);
        if (params.operator_id) query.append("operator_id", params.operator_id);
        if (params.urgency) query.append("urgency", params.urgency);
        if (params.search) query.append("search", params.search);
        if (params.startDate) query.append("startDate", params.startDate);
        if (params.endDate) query.append("endDate", params.endDate);
        if (params.board) query.append("board", "true");
        return `/issues/?${query.toString()}`;
      },
      providesTags: (result) =>
        result && Array.isArray(result.results)
          ? [
              ...result.results.map(({ id }) => ({ type: "Issue" as const, id })),
              { type: "Issue", id: "LIST" },
            ]
          : [{ type: "Issue", id: "LIST" }],
    }),

    getOperators: builder.query<Operator[], void>({
      query: () => "/operators/",
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Operator" as const, id })),
              { type: "Operator", id: "LIST" },
            ]
          : [{ type: "Operator", id: "LIST" }],
    }),

    getZones: builder.query<Zone[], void>({
      query: () => "/zones/",
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Zone" as const, id })),
              { type: "Zone", id: "LIST" },
            ]
          : [{ type: "Zone", id: "LIST" }],
    }),

    getIssueStats: builder.query<IssueStats, void>({
      query: () => "/issues/stats/",
      providesTags: [{ type: "IssueStats", id: "STATS" }],
    }),

    getTaskLogs: builder.query<TaskLog[], number>({
      query: (taskId) => `/tasks/${taskId}/logs/`,
      providesTags: (_result, _error, taskId) => [{ type: "TaskLog", id: taskId }],
    }),

    updateIssueStatus: builder.mutation<
      Issue,
      { id: number; status: string; description?: string; zone?: number | null; qa_checklist?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/issues/${id}/status/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Issue", id },
        { type: "Issue", id: "LIST" },
        { type: "IssueStats", id: "STATS" },
      ],
    }),

    assignIssue: builder.mutation<
      Issue,
      { issueId: number; operatorId: number | null }
    >({
      query: ({ issueId, operatorId }) => ({
        url: `/issues/${issueId}/assign/`,
        method: "POST",
        body: { operator_id: operatorId },
      }),
      invalidatesTags: (_result, _error, { issueId }) => [
        { type: "Issue", id: issueId },
        { type: "Issue", id: "LIST" },
        { type: "Operator", id: "LIST" },
        { type: "IssueStats", id: "STATS" },
      ],
    }),

    bulkAssignIssues: builder.mutation<
      { status: string; updated_count: number },
      { issue_ids: number[]; operator_id: number | null }
    >({
      query: (body) => ({
        url: "/tasks/bulk-assign/",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Issue", id: "LIST" },
        { type: "Operator", id: "LIST" },
        { type: "IssueStats", id: "STATS" },
      ],
    }),

    toggleOperatorActive: builder.mutation<
      Operator,
      { id: number; is_active: boolean }
    >({
      query: ({ id, is_active }) => ({
        url: `/operators/${id}/status/`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Operator", id },
        { type: "Operator", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTenantConfigQuery,
  useGetIssuesQuery,
  useGetOperatorsQuery,
  useGetZonesQuery,
  useGetIssueStatsQuery,
  useGetTaskLogsQuery,
  useUpdateIssueStatusMutation,
  useAssignIssueMutation,
  useBulkAssignIssuesMutation,
  useToggleOperatorActiveMutation,
} = apiSlice;
