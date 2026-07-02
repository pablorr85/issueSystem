import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { TenantForm } from '../components/TenantForm';
import { getTenantConfig } from '../services/api';
import { AppContainer, AppMain, AppHeader, AppTitle, AppSubtitle } from '../App.styles';

export const HomeView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleFetchConfig = async (uuid: string) => {
    setLoading(true);
    setError(null);
    try {
      await getTenantConfig(uuid);
      navigate(`/${uuid}/report`);
    } catch (err: unknown) {
      console.error(err);
      const status =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      setError(
        status === 404
          ? t('app.errorTenantNotFound')
          : t('app.errorFetchConfig')
      );
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <AppContainer>
      <AppHeader>
        <AppTitle>{t('app.appTitle')}</AppTitle>
        <AppSubtitle>{t('app.appSubtitle')}</AppSubtitle>
      </AppHeader>
      <AppMain>
        <TenantForm onSubmit={handleFetchConfig} loading={loading} error={error} />
      </AppMain>
    </AppContainer>
  );
};

