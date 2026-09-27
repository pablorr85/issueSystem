import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Login } from '../pages/Login';
import { getTenantConfig } from '../services/api';
import type { TenantConfig } from '../services/types';
import { PageHeader } from '../components/PageHeader';
import { applyTenantTheme } from '../utils/theme';
import { AppContainer, AppMain } from '../App.styles';

export const LoginView: React.FC = () => {
  const { i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenant_id');
  const navigate = useNavigate();
  const [config, setConfig] = useState<TenantConfig | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    getTenantConfig(tenantId)
      .then(data => {
        setConfig(data);
        if (data.default_language && !localStorage.getItem('app_language')) {
          i18n.changeLanguage(data.default_language);
        }
      })
      .catch(err => {
        console.error('Failed to load tenant config for login page:', err);
      });
  }, [tenantId, i18n]);

  useEffect(() => {
    applyTenantTheme(config?.visual_config?.primary_color);
  }, [config]);

  return (
    <AppContainer>
      <PageHeader />
      <AppMain>
        <Login onSuccess={() => navigate('/')} />
      </AppMain>
    </AppContainer>
  );
};
