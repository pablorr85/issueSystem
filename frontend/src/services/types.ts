export interface TenantVisualConfig {
  primary_color?: string;
  secondary_color?: string;
  [key: string]: any;
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
}

export interface IssuePayload {
  tenant_id: string;
  description: string;
  photo_url?: string;
  extra_data: Record<string, any>;
}
