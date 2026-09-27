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
import { PageHeader } from '../components/PageHeader';
import { applyTenantTheme } from '../utils/theme';
import {
  AppContainer,
  CenteredLoadingContainer,
  AppMain,
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
    applyTenantTheme(config?.visual_config?.primary_color);
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
      <PageHeader user={user} onLogout={handleLogout} />

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
