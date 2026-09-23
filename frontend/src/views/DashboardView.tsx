import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dashboard } from '../pages/Dashboard';
import { useAuth } from '../context/AuthContext';
import {
  useGetTenantConfigQuery,
  useGetOperatorsQuery,
  useGetIssuesQuery,
  useToggleOperatorActiveMutation,
  useAssignIssueMutation,
  apiSlice,
} from '../store/apiSlice';
import { useAppDispatch } from '../store';
import type { Issue } from '../services/types';
import { EditIssueModal } from '../components/EditIssueModal/EditIssueModal';
import { SettingsMenu } from '../components/SettingsMenu';
import {
  AppContainer,
  CenteredLoadingContainer,
  AppMain,
  AppHeader,
  HeaderTopRow,
  AppTitle,
  AppSubtitle,
} from '../App.styles';

export const DashboardView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { tenantId, user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [assignedFilter, setAssignedFilter] = useState<string>('');
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  // RTK Query hooks
  const { data: config, isLoading: configLoading } = useGetTenantConfigQuery(tenantId || '', { skip: !tenantId });
  const { data: operators = [] } = useGetOperatorsQuery(undefined, { skip: !config });
  const { data: issuesData, isLoading: issuesLoading } = useGetIssuesQuery(
    {
      tenantId: config?.id || '',
      status: statusFilter || undefined,
      page: currentPage,
      assigned: assignedFilter || undefined,
    },
    { skip: !config }
  );

  const [toggleOperatorActiveMutation] = useToggleOperatorActiveMutation();
  const [assignIssueMutation] = useAssignIssueMutation();

  const handleAssignOperator = async (issueId: number, operatorIdVal: number | string) => {
    const operatorId = operatorIdVal === '' ? null : Number(operatorIdVal);
    try {
      await assignIssueMutation({ issueId, operatorId }).unwrap();
    } catch (err) {
      console.error("Failed to assign operator:", err);
    }
  };

  const issues = issuesData?.results || [];
  const totalCount = issuesData?.count || 0;

  useEffect(() => {
    if (config?.default_language && !localStorage.getItem('app_language')) {
      i18n.changeLanguage(config.default_language);
    }
  }, [config, i18n]);

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

  const handlePageChange = (page: React.SetStateAction<number>) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleAssignedFilterChange = (assigned: string) => {
    setAssignedFilter(assigned);
    setCurrentPage(1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleOperatorActive = async (operatorId: number, currentStatus: boolean) => {
    try {
      await toggleOperatorActiveMutation({ id: operatorId, is_active: !currentStatus }).unwrap();
    } catch (err) {
      console.error("Failed to toggle operator status:", err);
      alert(t("dashboard.errorToggleOperator", "Failed to update operator status."));
    }
  };

  if (configLoading || !config) {
    return (
      <CenteredLoadingContainer>
        <h2>{t('tenantForm.loading')}</h2>
      </CenteredLoadingContainer>
    );
  }

  return (
    <AppContainer $wide>
      <AppHeader>
        <HeaderTopRow>
          <SettingsMenu user={user} onLogout={handleLogout} />
        </HeaderTopRow>
        <AppTitle>{t('app.appTitle')}</AppTitle>
        <AppSubtitle>{t('app.appSubtitle')}</AppSubtitle>
      </AppHeader>

      <AppMain>

        {config && (
          <Dashboard
            tenant={config}
            issues={issues}
            setIssues={() => {}}
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
            onAssignOperator={handleAssignOperator}
          />
        )}

        {editingIssue && config && (
          <EditIssueModal
            open={!!editingIssue}
            issue={editingIssue}
            tenant={config}
            operators={operators}
            onClose={() => setEditingIssue(null)}
            onSuccess={() => {
              setEditingIssue(null);
              dispatch(apiSlice.util.invalidateTags(['Issue', 'IssueStats']));
            }}
          />
        )}
      </AppMain>
    </AppContainer>
  );
};
