import { useState, useEffect } from 'react';
import { getTenantConfig } from './services/api';
import type { TenantConfig } from './services/types';
import { TenantForm } from './components/TenantForm';
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
} from './App.styles';

function App() {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const data = await getTenantConfig(uuid);
      setConfig(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.status === 404
          ? 'Tenant not found. Please verify the UUID.'
          : 'Failed to fetch configuration. Check backend status.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <AppHeader className="animate-fade-in">
        <AppTitle>Issue Tracker SaaS</AppTitle>
        <AppSubtitle>
          Sprint 4: TS strict, MUI components & Test Suite Setup
        </AppSubtitle>
      </AppHeader>

      <main style={{ display: 'flex', flexDirection: 'column' }}>
        <TenantForm onSubmit={handleFetchConfig} loading={loading} error={error} />

        {config && (
          <BrandingSection className="glass-card animate-fade-in">
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 10px 0' }}>Active Tenant Branding</h2>
            <BrandingCard>
              {config.logo_url ? (
                <img src={config.logo_url} alt="Tenant Logo" style={{ height: '50px', objectFit: 'contain' }} />
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
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>Visual Config JSON:</h4>
              <PreContainer>
                {JSON.stringify(config.visual_config, null, 2)}
              </PreContainer>
            </div>
          </BrandingSection>
        )}
      </main>

      <AppFooter>
        Single-DB Multi-Tenancy Architecture • Admin dashboard ready
      </AppFooter>
    </AppContainer>
  );
}

export default App;
