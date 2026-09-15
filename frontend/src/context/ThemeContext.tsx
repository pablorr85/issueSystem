import React, { createContext, useContext, useEffect, useState } from 'react';
import { type ThemeTokens, themeTokensRecord } from '../theme/themeTokens';

export type ThemeMode = 'dark' | 'light';

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  tokens: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark';
  });

  const tokens = themeTokensRecord[theme];

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(LOCAL_STORAGE_KEY, mode);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    root.style.setProperty('--primary', tokens.colors.primary);
    root.style.setProperty('--primary-hover', tokens.colors.primaryHover);
    root.style.setProperty('--primary-light', tokens.colors.primaryLight);
    root.style.setProperty('--bg-gradient', tokens.colors.bgGradient);
    root.style.setProperty('--bg-card', tokens.colors.bgCard);
    root.style.setProperty('--bg-surface', tokens.colors.bgSurface);
    root.style.setProperty('--border-card', tokens.colors.borderCard);
    root.style.setProperty('--border-subtle', tokens.colors.borderSubtle);
    root.style.setProperty('--text-primary', tokens.colors.textPrimary);
    root.style.setProperty('--text-secondary', tokens.colors.textSecondary);
    root.style.setProperty('--text-muted', tokens.colors.textMuted);
    root.style.setProperty('--shadow', tokens.colors.shadow);

    root.style.setProperty('--status-pending-bg', tokens.colors.statusPending.bg);
    root.style.setProperty('--status-pending-text', tokens.colors.statusPending.text);
    root.style.setProperty('--status-pending-border', tokens.colors.statusPending.border);

    root.style.setProperty('--status-in-progress-bg', tokens.colors.statusInProgress.bg);
    root.style.setProperty('--status-in-progress-text', tokens.colors.statusInProgress.text);
    root.style.setProperty('--status-in-progress-border', tokens.colors.statusInProgress.border);

    root.style.setProperty('--status-resolved-bg', tokens.colors.statusResolved.bg);
    root.style.setProperty('--status-resolved-text', tokens.colors.statusResolved.text);
    root.style.setProperty('--status-resolved-border', tokens.colors.statusResolved.border);

    root.style.setProperty('--status-blocked-bg', tokens.colors.statusBlocked.bg);
    root.style.setProperty('--status-blocked-text', tokens.colors.statusBlocked.text);
    root.style.setProperty('--status-blocked-border', tokens.colors.statusBlocked.border);
  }, [theme, tokens]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      toggleTheme: () => {},
      setTheme: () => {},
      tokens: themeTokensRecord['dark'],
    };
  }
  return context;
};
