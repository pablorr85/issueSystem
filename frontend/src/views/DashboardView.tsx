import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dashboard } from '../pages/Dashboard';
import { useAuth } from '../context/AuthContext';
import { getTenantConfig, getIssues, getOperators, toggleOperatorActive } from '../services/api';
import type { TenantConfig, Issue, Operator } from '../services/types';
import { EditIssueModal } from '../components/EditIssueModal/EditIssueModal';
import {
  AppContainer,
  CenteredLoadingContainer,
  AppMain,
  AppHeader,
  AppTitle,
  AppSubtitle,
  AuthStatusContainer,
  LogoutButton
} from '../App.styles';

export const DashboardView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { tenantId, user, logout } = useAuth();
  const navigate = useNavigate();
  const [prevTenantId, setPrevTenantId] = useState<string | null>(tenantId);
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(!!tenantId);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [issuesLoading, setIssuesLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [assignedFilter, setAssignedFilter] = useState<string>('');
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  if (tenantId !== prevTenantId) {
    setPrevTenantId(tenantId);
    setConfig(null);
    setLoading(!!tenantId);
    setIssuesLoading(true);
  }

  useEffect(() => {
    if (!tenantId) {
      return;
    }
    let active = true;
    getTenantConfig(tenantId)
      .then(data => {
        if (!active) return;
        setConfig(data);
        if (data.default_language) {
          i18n.changeLanguage(data.default_language);
        }
        setLoading(false);
      })
      .catch(err => {
        if (!active) return;
        console.error('Failed to load tenant config for dashboard:', err);
        setLoading(false);
      });
    return () => {
      active = false;
    };
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

  // Fetch operators when config is loaded
  useEffect(() => {
    if (!config) return;
    getOperators()
      .then((res) => setOperators(res))
      .catch((err) => console.error("Failed to fetch operators:", err));
  }, [config]);

  // Fetch issues whenever tenant config, page, status filter, or assigned filter changes
  useEffect(() => {
    if (!config) return;
    let active = true;

    getIssues(config.id, statusFilter || undefined, currentPage, undefined, assignedFilter || undefined)
      .then((res) => {
        if (!active) return;
        setIssues(res.results || []);
        setTotalCount(res.count || 0);
        setIssuesLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to fetch issues:", err);
        setIssues([]);
        setTotalCount(0);
        setIssuesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [config, currentPage, statusFilter, assignedFilter]);

  const handlePageChange = (page: React.SetStateAction<number>) => {
    setCurrentPage(page);
    setIssuesLoading(true);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setIssuesLoading(true);
  };

  const handleAssignedFilterChange = (assigned: string) => {
    setAssignedFilter(assigned);
    setCurrentPage(1);
    setIssuesLoading(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleOperatorActive = async (operatorId: number, currentStatus: boolean) => {
    try {
      const res = await toggleOperatorActive(operatorId, !currentStatus);
      setOperators((prev) =>
        prev.map((op) =>
          op.id === operatorId ? { ...op, is_active: res.is_active } : op
        )
      );
    } catch (err) {
      console.error("Failed to toggle operator status:", err);
      alert(t("dashboard.errorToggleOperator", "Failed to update operator status."));
    }
  };

  if (loading) {
    return (
      <CenteredLoadingContainer>
        <h2>{t('tenantForm.loading')}</h2>
      </CenteredLoadingContainer>
    );
  }

  return (
    <AppContainer $wide>
      <AppHeader>
        <AppTitle>{t('app.appTitle')}</AppTitle>
        <AppSubtitle>{t('app.appSubtitle')}</AppSubtitle>
      </AppHeader>

      <AppMain>
        <AuthStatusContainer>
          <span>{t('app.loggedInAsPrefix')}<strong>{user}</strong></span>
          <LogoutButton onClick={handleLogout} data-testid="logout-button">{t('app.logout')}</LogoutButton>
        </AuthStatusContainer>

        {config && (
          <Dashboard
            tenant={config}
            issues={issues}
            setIssues={setIssues}
            operators={operators}
            loading={issuesLoading}
            totalCount={totalCount}
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
            statusFilter={statusFilter}
            setStatusFilter={handleStatusFilterChange}
            assignedFilter={assignedFilter}
            onAssignedFilterChange={handleAssignedFilterChange}
            onEditIssue={setEditingIssue}
            onToggleOperatorActive={handleToggleOperatorActive}
          />
        )}

        {editingIssue && config && (
          <EditIssueModal
            open={!!editingIssue}
            issue={editingIssue}
            tenant={config}
            operators={operators}
            onClose={(updatedIssue) => {
              if (updatedIssue && updatedIssue.id) {
                setIssues((prev) =>
                  prev.map((item) =>
                    item.id === updatedIssue.id ? updatedIssue : item
                  )
                );
              }
              setEditingIssue(null);
            }}
            onSuccess={(updatedIssue) => {
              setIssues((prev) =>
                prev.map((item) =>
                  item.id === updatedIssue.id ? updatedIssue : item
                )
              );
              setEditingIssue(null);
            }}
          />
        )}
      </AppMain>
    </AppContainer>
  );
};
