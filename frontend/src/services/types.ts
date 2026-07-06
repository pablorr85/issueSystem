export interface TenantVisualConfig {
  primary_color?: string;
  secondary_color?: string;
  [key: string]: unknown;
}

export interface CustomFieldOption {
  value: string;
  label: string;
}

export interface CustomField {
  name: string;
  field_type: "text" | "number" | "boolean" | "select";
  required: boolean;
  options: (string | CustomFieldOption)[];
}

export interface TenantConfig {
  id: string;
  name: string;
  logo_url: string | null;
  visual_config: TenantVisualConfig;
  custom_fields: CustomField[];
  is_public_reporting_enabled: boolean;
  default_language: "es" | "en";
}
export interface IssuePayload {
  tenant_id: string;
  description: string;
  photo_url?: string;
  image?: File | null;
  extra_data: Record<string, unknown>;
}

export interface Issue {
  id: number;
  tenant_id: string;
  status: "pending" | "in_progress" | "resolved" | "blocked" | "wont_fix";
  description: string;
  photo_url?: string;
  image?: string | null;
  extra_data: Record<string, unknown>;
  assigned_to: number | null;
  assigned_to_name: string;
  secure_token: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface Operator {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  hub_token?: string | null;
  is_active: boolean;
}

export interface OperatorTask {
  id: number;
  status: "pending" | "in_progress" | "resolved" | "blocked" | "wont_fix";
  description: string;
  photo_url?: string;
  image?: string | null;
  extra_data: Record<string, unknown>;
  assigned_to: number | null;
  assigned_to_name: string;
  secure_token: string;
  operator_hub_token?: string | null;
  tenant_name: string;
  tenant_logo_url: string | null;
  tenant_visual_config: TenantVisualConfig;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface IssueComment {
  id: number;
  issue: number;
  author_name: string;
  role: "manager" | "operator" | "system";
  comment_text: string;
  is_system_log: boolean;
  created_at: string;
}

export interface OperatorWorkload {
  id: number;
  username: string;
  task_count: number;
}

export interface OperatorPerformance {
  id: number;
  username: string;
  resolved_count: number;
}

export interface ZoneHotspot {
  zone: string;
  count: number;
}

export interface IssueStats {
  unassigned_count: number;
  in_progress_count: number;
  blocked_count: number;
  operator_workload: OperatorWorkload[];
  operator_performance: OperatorPerformance[];
  zone_hotspots: ZoneHotspot[];
}

