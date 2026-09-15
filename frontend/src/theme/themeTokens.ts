export interface ColorTokens {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  bgGradient: string;
  bgCard: string;
  bgSurface: string;
  borderCard: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  shadow: string;
  statusPending: { bg: string; text: string; border: string };
  statusInProgress: { bg: string; text: string; border: string };
  statusResolved: { bg: string; text: string; border: string };
  statusBlocked: { bg: string; text: string; border: string };
}

export interface ThemeTokens {
  mode: 'dark' | 'light';
  colors: ColorTokens;
}

export const darkThemeTokens: ThemeTokens = {
  mode: 'dark',
  colors: {
    primary: 'hsl(260, 85%, 60%)',
    primaryHover: 'hsl(260, 85%, 50%)',
    primaryLight: 'hsl(260, 85%, 96%)',
    bgGradient: 'radial-gradient(circle at top right, hsl(260, 25%, 10%) 0%, #0d0b14 100%)',
    bgCard: 'rgba(255, 255, 255, 0.03)',
    bgSurface: 'rgba(255, 255, 255, 0.05)',
    borderCard: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.05)',
    textPrimary: '#ffffff',
    textSecondary: '#a09cb4',
    textMuted: '#6b6780',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    statusPending: {
      bg: 'rgba(234, 179, 8, 0.15)',
      text: '#facc15',
      border: 'rgba(234, 179, 8, 0.3)',
    },
    statusInProgress: {
      bg: 'rgba(59, 130, 246, 0.15)',
      text: '#60a5fa',
      border: 'rgba(59, 130, 246, 0.3)',
    },
    statusResolved: {
      bg: 'rgba(34, 197, 94, 0.15)',
      text: '#4ade80',
      border: 'rgba(34, 197, 94, 0.3)',
    },
    statusBlocked: {
      bg: 'rgba(239, 68, 68, 0.15)',
      text: '#f87171',
      border: 'rgba(239, 68, 68, 0.3)',
    },
  },
};

export const lightThemeTokens: ThemeTokens = {
  mode: 'light',
  colors: {
    primary: 'hsl(260, 80%, 55%)',
    primaryHover: 'hsl(260, 80%, 45%)',
    primaryLight: 'hsl(260, 85%, 96%)',
    bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 50%, #e2e8f0 100%)',
    bgCard: 'rgba(255, 255, 255, 0.85)',
    bgSurface: '#ffffff',
    borderCard: 'rgba(0, 0, 0, 0.08)',
    borderSubtle: 'rgba(0, 0, 0, 0.05)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
    statusPending: {
      bg: '#fef9c3',
      text: '#854d0e',
      border: '#fde047',
    },
    statusInProgress: {
      bg: '#dbeafe',
      text: '#1e40af',
      border: '#93c5fd',
    },
    statusResolved: {
      bg: '#dcfce7',
      text: '#166534',
      border: '#86efac',
    },
    statusBlocked: {
      bg: '#fee2e2',
      text: '#991b1b',
      border: '#fca5a5',
    },
  },
};

export const themeTokensRecord: Record<'dark' | 'light', ThemeTokens> = {
  dark: darkThemeTokens,
  light: lightThemeTokens,
};
