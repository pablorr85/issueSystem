export interface TenantVisualConfig {
  primary_color?: string;
  secondary_color?: string;
  [key: string]: unknown;
}

export interface CustomField {
  name: string;
  field_type: 'text' | 'number' | 'boolean' | 'select';
  required: boolean;
  options: string[];
}

export interface TenantConfig {
  id: string;
  name: string;
  logo_url: string | null;
  visual_config: TenantVisualConfig;
  custom_fields: CustomField[];
  is_public_reporting_enabled: boolean;
  default_language: 'es' | 'en';
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
  status: string;
  description: string;
  photo_url?: string;
  image?: string | null;
  extra_data: Record<string, unknown>;
  assigned_to: number | null;
  assigned_to_name: string;
  secure_token: string;
  created_at: string;
  updated_at: string;
}

export interface Operator {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  hub_token?: string | null;
}

export interface OperatorTask {
  id: number;
  status: string;
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
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}


