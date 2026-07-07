import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import { Dashboard } from '../../pages/Dashboard';
import { useAuth } from '../../context/AuthContext';
import { getTenantConfig, getIssues, getOperators, toggleOperatorActive } from '../../services/api';
import type { TenantConfig, Issue, Operator } from '../../services/types';
import { EditIssueModal } from '../../components/EditIssueModal/EditIssueModal';
import {
  AppContainer,
  CenteredLoadingContainer,
  AppMain,
  AppHeader,
  AppTitle,
  AppSubtitle,
  AuthStatusContainer,
  LogoutButton
} from '../../App.styles';
import { NavContainer, NavLinkButton } from './BacklogView.styles';

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
        if (data.default_language) {
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
      <AppHeader>
        <AppTitle>{t('app.appTitle')}</AppTitle>
        <AppSubtitle>{t('app.appSubtitle')}</AppSubtitle>
      </AppHeader>

      <AppMain>
        <AuthStatusContainer>
          <span>{t('app.loggedInAsPrefix')}<strong>{user}</strong></span>
          <LogoutButton onClick={handleLogout} data-testid="logout-button">{t('app.logout')}</LogoutButton>
        </AuthStatusContainer>

        <NavContainer>
          <NavLinkButton to="/">
            <DashboardIcon fontSize="small" />
            {t('dashboard.dashboardTab')}
          </NavLinkButton>
          <NavLinkButton to="/backlog" $active>
            <ListAltIcon fontSize="small" />
            {t('dashboard.backlogTab')}
          </NavLinkButton>
          <NavLinkButton to="/board">
            <ViewKanbanIcon fontSize="small" />
            {t('dashboard.boardTab')}
          </NavLinkButton>
        </NavContainer>

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
            onClose={() => setEditingIssue(null)}
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
