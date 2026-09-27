import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dashboard } from '../../pages/Dashboard';
import { useAuth } from '../../context/AuthContext';
import {
  useGetTenantConfigQuery,
  useGetOperatorsQuery,
  useGetIssuesQuery,
  useToggleOperatorActiveMutation,
  apiSlice,
} from '../../store/apiSlice';
import { useAppDispatch } from '../../store';
import type { Issue } from '../../services/types';
import { EditIssueModal } from '../../components/EditIssueModal/EditIssueModal';
import { NavigationTabs } from '../../components/NavigationTabs';
import { PageHeader } from '../../components/PageHeader';
import { applyTenantTheme } from '../../utils/theme';
import {
  AppContainer,
  CenteredLoadingContainer,
  AppMain,
} from '../../App.styles';

export const BacklogView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { tenantId, user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const assignedFilter = searchParams.get('assigned') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

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
    const newPage = typeof page === 'function' ? (page as (prev: number) => number)(currentPage) : page;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  const handleStatusFilterChange = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status) {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleAssignedFilterChange = (assigned: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (assigned) {
      newParams.set('assigned', assigned);
    } else {
      newParams.delete('assigned');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleToggleOperatorActive = async (operatorId: number, currentStatus: boolean) => {
    try {
      await toggleOperatorActiveMutation({ id: operatorId, is_active: !currentStatus }).unwrap();
    } catch (err) {
      console.error("Failed to toggle operator status:", err);
      alert(t("dashboard.errorToggleOperator", "Failed to update operator status."));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        <NavigationTabs activeTab="backlog" />

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
export default BacklogView;
