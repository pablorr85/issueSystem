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
  extra_data: Record<string, unknown>;
}

export interface Issue {
  id: number;
  tenant_id: string;
  status: string;
  description: string;
  photo_url?: string;
  extra_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

