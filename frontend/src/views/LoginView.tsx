import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Login } from '../pages/Login';
import { getTenantConfig } from '../services/api';
import type { TenantConfig } from '../services/types';
import { AppContainer, AppMain, AppHeader, AppTitle, AppSubtitle } from '../App.styles';

export const LoginView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenant_id');
  const navigate = useNavigate();
  const [config, setConfig] = useState<TenantConfig | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    getTenantConfig(tenantId)
      .then(data => {
        setConfig(data);
        if (data.default_language) {
          i18n.changeLanguage(data.default_language);
        }
      })
      .catch(err => {
        console.error('Failed to load tenant config for login page:', err);
      });
  }, [tenantId, i18n]);

  useEffect(() => {
    if (config?.visual_config?.primary_color) {
      const hex = config.visual_config.primary_color;
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        const r = parseInt(result[1], 16) / 255;
        const g = parseInt(result[2], 16) / 255;
        const b = parseInt(result[3], 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);

        document.documentElement.style.setProperty('--primary-hue', `${h}`);
        document.documentElement.style.setProperty('--primary', `hsl(${h}, ${s}%, ${l}%)`);
        document.documentElement.style.setProperty('--primary-hover', `hsl(${h}, ${s}%, ${l - 10}%)`);
      }
    } else {
      document.documentElement.style.setProperty('--primary-hue', '260');
      document.documentElement.style.setProperty('--primary', 'hsl(260, 85%, 60%)');
      document.documentElement.style.setProperty('--primary-hover', 'hsl(260, 85%, 50%)');
    }
  }, [config]);

  return (
    <AppContainer>
      <AppHeader>
        <AppTitle>{t('app.appTitle')}</AppTitle>
        <AppSubtitle>{t('app.appSubtitle')}</AppSubtitle>
      </AppHeader>
      <AppMain>
        <Login onSuccess={() => navigate('/dashboard')} />
      </AppMain>
    </AppContainer>
  );
};
