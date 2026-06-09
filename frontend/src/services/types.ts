export interface TenantVisualConfig {
  primary_color?: string;
  secondary_color?: string;
  [key: string]: any;
}

export interface TenantConfig {
  name: string;
  logo_url: string | null;
  visual_config: TenantVisualConfig;
}
