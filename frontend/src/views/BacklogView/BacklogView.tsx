import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dashboard } from '../../pages/Dashboard';
import { useAuth } from '../../context/AuthContext';
import { getTenantConfig, getIssues, getOperators, toggleOperatorActive } from '../../services/api';
import type { TenantConfig, Issue, Operator } from '../../services/types';
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
  const [prevTenantId, setPrevTenantId] = useState<string | null>(tenantId);
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(!!tenantId);

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const assignedFilter = searchParams.get('assigned') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const [issues, setIssues] = useState<Issue[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [issuesLoading, setIssuesLoading] = useState<boolean>(true);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  const [prevConfigId, setPrevConfigId] = useState<string | null>(null);
  const [prevStatusFilter, setPrevStatusFilter] = useState<string>("");
  const [prevCurrentPage, setPrevCurrentPage] = useState<number>(1);
  const [prevAssignedFilter, setPrevAssignedFilter] = useState<string>("");

  const configId = config?.id || null;

  if (
    configId !== prevConfigId ||
    statusFilter !== prevStatusFilter ||
    currentPage !== prevCurrentPage ||
    assignedFilter !== prevAssignedFilter
  ) {
    setPrevConfigId(configId);
    setPrevStatusFilter(statusFilter);
    setPrevCurrentPage(currentPage);
    setPrevAssignedFilter(assignedFilter);
    if (configId) {
      setIssuesLoading(true);
    }
  }

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
        if (data.default_language && !localStorage.getItem('app_language')) {
          i18n.changeLanguage(data.default_language);
        }
        setLoading(false);
      })
      .catch(err => {
        if (!active) return;
        console.error('Failed to load tenant config for backlog:', err);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tenantId, i18n]);

  useEffect(() => {
    applyTenantTheme(config?.visual_config?.primary_color);
  }, [config]);

  // Fetch operators when config is loaded
  useEffect(() => {
    if (!config) return;
    getOperators()
      .then((res) => setOperators(res))
      .catch((err) => console.error("Failed to fetch operators:", err));
  }, [config]);

  useEffect(() => {
    if (!config) return;
    let active = true;

    getIssues(
      config.id,
      statusFilter || undefined,
      currentPage,
      undefined,
      assignedFilter || undefined
    )
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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
      <PageHeader user={user} onLogout={handleLogout} />

      <AppMain>
        <NavigationTabs activeTab="backlog" />

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
export default BacklogView;
