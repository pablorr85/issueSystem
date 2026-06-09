import { useState, useEffect } from 'react';
import { getTenantConfig, createIssue } from './services/api';
import type { TenantConfig, IssuePayload } from './services/types';
import { TenantForm } from './components/TenantForm';
import { DynamicIssueForm } from './components/DynamicIssueForm';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Snackbar } from '@mui/material';
import {
  AppContainer,
  AppHeader,
  AppTitle,
  AppSubtitle,
  BrandingSection,
  BrandingCard,
  LogoPlaceholder,
  BrandingTitle,
  BrandingSubtitle,
  PreContainer,
  AppFooter,
  AppMain,
  BrandingHeader,
  BrandingImage,
  BrandingJSONTitle,
  FullWidthAlert,
  TabContainer,
  TabButton,
  AuthStatusContainer,
  LogoutButton,
  RequiredAuthAlert,
  AlertButton,
} from './App.styles';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successOpen, setSuccessOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'report' | 'dashboard' | 'login'>('report');

  // Apply dynamic tenant color configuration to root stylesheet variables
  useEffect(() => {
    if (config?.visual_config?.primary_color) {
      const hex = config.visual_config.primary_color;
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        let r = parseInt(result[1], 16) / 255;
        let g = parseInt(result[2], 16) / 255;
        let b = parseInt(result[3], 16) / 255;
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

  const handleFetchConfig = async (uuid: string) => {
    setLoading(true);
    setError(null);
    setConfig(null);
    setActiveTab('report');

    try {
      const data = await getTenantConfig(uuid);
      setConfig(data);
    } catch (err: unknown) {
      console.error(err);
      const status =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      setError(
        status === 404
          ? 'Tenant not found. Please verify the UUID.'
          : 'Failed to fetch configuration. Check backend status.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (payload: IssuePayload) => {
    setSubmitting(true);
    try {
      await createIssue(payload);
      setSuccessOpen(true);
    } catch (err: unknown) {
      console.error(err);
      let errMsg = 'Failed to submit issue. Please check fields.';
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

  return (
    <AppContainer>
      <AppHeader className="animate-fade-in">
        <AppTitle>Issue Tracker SaaS</AppTitle>
        <AppSubtitle>
          Tenant Dashboard & Dynamic Issue Management
        </AppSubtitle>
      </AppHeader>

      <AppMain>
        {isAuthenticated && (
          <AuthStatusContainer>
            <span>Logged in as <strong>{user}</strong></span>
            <LogoutButton onClick={logout} data-testid="logout-button">Logout</LogoutButton>
          </AuthStatusContainer>
        )}

        <TenantForm onSubmit={handleFetchConfig} loading={loading} error={error} />

        {config && (
          <>
            <BrandingSection className="glass-card animate-fade-in">
              <BrandingHeader>Active Tenant Branding</BrandingHeader>
              <BrandingCard>
                {config.logo_url ? (
                  <BrandingImage src={config.logo_url} alt="Tenant Logo" />
                ) : (
                  <LogoPlaceholder>
                    {config.name.charAt(0)}
                  </LogoPlaceholder>
                )}
                <div>
                  <BrandingTitle>{config.name}</BrandingTitle>
                  <BrandingSubtitle>
                    Branding theme updated dynamically.
                  </BrandingSubtitle>
                </div>
              </BrandingCard>

              <div>
                <BrandingJSONTitle>Visual Config JSON:</BrandingJSONTitle>
                <PreContainer>
                  {JSON.stringify(config.visual_config, null, 2)}
                </PreContainer>
              </div>
            </BrandingSection>

            <TabContainer>
              <TabButton
                $active={activeTab === 'report'}
                onClick={() => setActiveTab('report')}
                data-testid="tab-report"
              >
                Report Issue
              </TabButton>
              <TabButton
                $active={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
                data-testid="tab-dashboard"
              >
                Manager Dashboard
              </TabButton>
              {activeTab === 'login' && (
                <TabButton
                  $active={true}
                  onClick={() => setActiveTab('login')}
                  data-testid="tab-login"
                >
                  Employee Login
                </TabButton>
              )}
            </TabContainer>

            {activeTab === 'report' ? (
              config.is_public_reporting_enabled !== false || isAuthenticated ? (
                <DynamicIssueForm tenant={config} onSubmit={handleCreateIssue} submitting={submitting} />
              ) : (
                <RequiredAuthAlert severity="warning" data-testid="public-disabled-warning">
                  Employee login required to report issues for this location.
                  <AlertButton variant="contained" onClick={() => setActiveTab('login')} data-testid="go-to-login-button">
                    Go to Login
                  </AlertButton>
                </RequiredAuthAlert>
              )
            ) : activeTab === 'dashboard' ? (
              <ProtectedRoute onRedirect={() => setActiveTab('login')}>
                <Dashboard tenant={config} />
              </ProtectedRoute>
            ) : (
              <Login onSuccess={() => setActiveTab('dashboard')} />
            )}
          </>
        )}
      </AppMain>

      <AppFooter>
        Single-DB Multi-Tenancy Architecture • Admin dashboard ready
      </AppFooter>

      <Snackbar
        open={successOpen}
        autoHideDuration={5000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <FullWidthAlert severity="success" variant="filled" onClose={() => setSuccessOpen(false)}>
          Issue submitted successfully!
        </FullWidthAlert>
      </Snackbar>
    </AppContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
