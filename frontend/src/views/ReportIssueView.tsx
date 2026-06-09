import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantConfig, createIssue } from '../services/api';
import type { TenantConfig, IssuePayload } from '../services/types';
import { DynamicIssueForm } from '../components/DynamicIssueForm';
import { useAuth } from '../context/AuthContext';
import { Snackbar } from '@mui/material';
import {
  AppContainer,
  AppMain,
  BrandingSection,
  BrandingHeader,
  BrandingCard,
  LogoPlaceholder,
  BrandingTitle,
  BrandingSubtitle,
  PreContainer,
  BrandingImage,
  RequiredAuthAlert,
  AlertButton,
  FullWidthAlert
} from '../App.styles';

export const ReportIssueView: React.FC = () => {
  const { tenant_id } = useParams<{ tenant_id: string }>();
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successOpen, setSuccessOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!tenant_id) return;
    setLoading(true);
    setError(null);
    getTenantConfig(tenant_id)
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(t('app.errorTenantNotFound'));
        setLoading(false);
      });
  }, [tenant_id, t]);

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

  useEffect(() => {
    if (config?.default_language) {
      i18n.changeLanguage(config.default_language);
    }
  }, [config?.default_language, i18n]);

  const handleCreateIssue = async (payload: IssuePayload) => {
    setSubmitting(true);
    try {
      await createIssue(payload);
      setSuccessOpen(true);
    } catch (err: unknown) {
      console.error(err);
      let errMsg = t('app.errorSubmitIssue');
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as { response?: { data?: { detail?: string; extra_data?: string } } }).response?.data;
        if (responseData) {
          errMsg = responseData.detail || responseData.extra_data || errMsg;
        }
      }
      alert(errMsg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>{t('tenantForm.loading')}</h2>
      </AppContainer>
    );
  }

  if (error || !config) {
    return (
      <AppContainer style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>{error || t('app.errorTenantNotFound')}</h2>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '1rem',
            padding: '8px 16px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </AppContainer>
    );
  }

  const isPublicEnabled = config.is_public_reporting_enabled !== false || isAuthenticated;

  return (
    <AppContainer style={{ paddingBottom: '2rem' }}>
      <AppMain>
        <BrandingSection className="glass-card animate-fade-in">
          <BrandingHeader>{t('app.tenantBranding')}</BrandingHeader>
          <BrandingCard>
            {config.logo_url ? (
              <BrandingImage src={config.logo_url} alt="Tenant Logo" />
            ) : (
              <LogoPlaceholder>{config.name.charAt(0)}</LogoPlaceholder>
            )}
            <div>
              <BrandingTitle>{config.name}</BrandingTitle>
              <BrandingSubtitle>{t('app.brandingSubtitle')}</BrandingSubtitle>
            </div>
          </BrandingCard>
        </BrandingSection>

        {isPublicEnabled ? (
          <DynamicIssueForm tenant={config} onSubmit={handleCreateIssue} submitting={submitting} />
        ) : (
          <RequiredAuthAlert severity="warning" data-testid="public-disabled-warning">
            {t('app.requiredAuthAlertText')}
            <AlertButton
              variant="contained"
              onClick={() => navigate(`/login?tenant_id=${config.id}`)}
              data-testid="go-to-login-button"
            >
              {t('app.goToLoginButton')}
            </AlertButton>
          </RequiredAuthAlert>
        )}
      </AppMain>

      <Snackbar
        open={successOpen}
        autoHideDuration={5000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <FullWidthAlert severity="success" variant="filled" onClose={() => setSuccessOpen(false)}>
          {t('app.snackbarSuccess')}
        </FullWidthAlert>
      </Snackbar>
    </AppContainer>
  );
};
