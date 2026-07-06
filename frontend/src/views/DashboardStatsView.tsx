import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import AssignmentAlertIcon from '@mui/icons-material/AssignmentLate';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { getTenantConfig, getIssuesStats } from '../services/api';
import type { TenantConfig, IssueStats } from '../services/types';
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

const NavContainer = styled.nav`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.02);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

interface NavLinkProps {
  $active?: boolean;
}

const NavLinkButton = styled(Link)<NavLinkProps>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? 'var(--primary)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#ffffff' : 'var(--text-secondary, #c5c2d9)')} !important;
  border: 1px solid ${({ $active }) => ($active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)')};

  &:hover {
    background: ${({ $active }) => ($active ? 'var(--primary-hover)' : 'rgba(255, 255, 255, 0.06)')};
    color: #ffffff !important;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(Link)`
  text-decoration: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
    border-color: var(--primary);
  }
`;

const StatIconWrapper = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color};
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatNumber = styled.span`
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary, #c5c2d9);
  margin-top: 4px;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 10px;
`;

const ActionCard = styled(Link)`
  text-decoration: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  &:hover {
    border-color: var(--primary);
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(var(--primary-hue), 0.25);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
  }
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ActionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 750;
  margin: 0;
  color: #ffffff;
`;

const ActionDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary, #c5c2d9);
  line-height: 1.5;
  margin: 0;
  flex: 1;
`;

const ActionArrow = styled.span`
  align-self: flex-end;
  color: var(--primary);
  font-weight: bold;
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.2s;

  ${ActionCard}:hover & {
    transform: translateX(4px);
  }
`;

const SectionHeader = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  margin: 40px 0 20px 0;
  letter-spacing: -0.02em;
  border-left: 4px solid var(--primary);
  padding-left: 12px;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const WidgetCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const WidgetTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 12px;
`;

const WidgetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const WidgetItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const WidgetItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
`;

const WidgetLabel = styled.span`
  color: var(--text-secondary, #c5c2d9);
`;

const WidgetValue = styled.span`
  font-weight: bold;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $percent: number; $color?: string }>`
  width: ${({ $percent }) => $percent}%;
  height: 100%;
  background: ${({ $color }) => $color || 'var(--primary)'};
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`;

const EmptyStateText = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary, #c5c2d9);
  text-align: center;
  margin: 20px 0;
  font-style: italic;
`;

export const DashboardStatsView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { tenantId, user, logout } = useAuth();
  const navigate = useNavigate();
  const [prevTenantId, setPrevTenantId] = useState<string | null>(tenantId);
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(!!tenantId);
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  if (tenantId !== prevTenantId) {
    setPrevTenantId(tenantId);
    setConfig(null);
    setLoading(!!tenantId);
    setStatsLoading(true);
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

  // Fetch Stats
  useEffect(() => {
    if (!tenantId) return;
    let active = true;
    getIssuesStats()
      .then(res => {
        if (!active) return;
        setStats(res);
        setStatsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load statistics:", err);
        if (!active) return;
        setStats(null);
        setStatsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tenantId]);

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
        <AppTitle as="h2" data-testid="dashboard-header">{t('dashboard.title')}</AppTitle>
        <AppSubtitle>{t('app.appSubtitle')}</AppSubtitle>
      </AppHeader>

      <AppMain>
        <AuthStatusContainer>
          <span>{t('app.loggedInAsPrefix')}<strong>{user}</strong></span>
          <LogoutButton onClick={handleLogout} data-testid="logout-button">{t('app.logout')}</LogoutButton>
        </AuthStatusContainer>

        <NavContainer>
          <NavLinkButton to="/" $active>
            <DashboardIcon fontSize="small" />
            {t('dashboard.dashboardTab')}
          </NavLinkButton>
          <NavLinkButton to="/backlog">
            <ListAltIcon fontSize="small" />
            {t('dashboard.backlogTab')}
          </NavLinkButton>
          <NavLinkButton to="/board">
            <ViewKanbanIcon fontSize="small" />
            {t('dashboard.boardTab')}
          </NavLinkButton>
        </NavContainer>

        <SectionHeader>{t('dashboard.kpisTitle')}</SectionHeader>
        <StatsGrid>
          <StatCard to="/backlog?assigned=false" data-testid="kpi-card-unassigned">
            <StatIconWrapper $color="rgba(239, 68, 68, 0.15)" style={{ color: '#ef4444' }}>
              <AssignmentAlertIcon />
            </StatIconWrapper>
            <StatContent>
              <StatNumber>{statsLoading ? '...' : stats?.unassigned_count ?? 0}</StatNumber>
              <StatLabel>{t('dashboard.kpiUnassigned')}</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard to="/board" data-testid="kpi-card-in-progress">
            <StatIconWrapper $color="rgba(59, 130, 246, 0.15)" style={{ color: '#3b82f6' }}>
              <PlayCircleIcon />
            </StatIconWrapper>
            <StatContent>
              <StatNumber>{statsLoading ? '...' : stats?.in_progress_count ?? 0}</StatNumber>
              <StatLabel>{t('dashboard.kpiInProgress')}</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard to="/backlog?status=blocked" data-testid="kpi-card-blocked">
            <StatIconWrapper $color="rgba(245, 158, 11, 0.15)" style={{ color: '#f59e0b' }}>
              <ReportProblemIcon />
            </StatIconWrapper>
            <StatContent>
              <StatNumber>{statsLoading ? '...' : stats?.blocked_count ?? 0}</StatNumber>
              <StatLabel>{t('dashboard.kpiBlocked')}</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>

        <SectionHeader>{t('dashboard.analyticsTitle')}</SectionHeader>
        <AnalyticsGrid>
          {/* Workload Widget */}
          <WidgetCard data-testid="widget-workload">
            <WidgetTitle>
              <DashboardIcon fontSize="small" style={{ color: 'var(--primary)' }} />
              {t('dashboard.widgetWorkloadTitle')}
            </WidgetTitle>
            <WidgetList>
              {statsLoading ? (
                <EmptyStateText>{t('dashboard.loadingData')}</EmptyStateText>
              ) : !stats?.operator_workload || stats.operator_workload.length === 0 ? (
                <EmptyStateText>{t('dashboard.noOperators')}</EmptyStateText>
              ) : (
                stats.operator_workload.map(op => {
                  const maxTasksLimit = 5;
                  const percent = Math.min(100, (op.task_count / maxTasksLimit) * 100);
                  let barColor = '#10b981';
                  if (op.task_count > 4) {
                    barColor = '#ef4444';
                  } else if (op.task_count > 2) {
                    barColor = '#f59e0b';
                  }

                  return (
                    <WidgetItem key={op.id}>
                      <WidgetItemHeader>
                        <WidgetLabel>{op.username}</WidgetLabel>
                        <WidgetValue>{op.task_count} {op.task_count === 1 ? t('dashboard.taskSingle') : t('dashboard.taskPlural')}</WidgetValue>
                      </WidgetItemHeader>
                      <ProgressBarContainer>
                        <ProgressBar $percent={percent} $color={barColor} />
                      </ProgressBarContainer>
                    </WidgetItem>
                  );
                })
              )}
            </WidgetList>
          </WidgetCard>

          {/* Resolution Leaderboard */}
          <WidgetCard data-testid="widget-leaderboard">
            <WidgetTitle>
              <ListAltIcon fontSize="small" style={{ color: 'var(--primary)' }} />
              {t('dashboard.widgetLeaderboardTitle')}
            </WidgetTitle>
            <WidgetList>
              {statsLoading ? (
                <EmptyStateText>{t('dashboard.loadingData')}</EmptyStateText>
              ) : !stats?.operator_performance || stats.operator_performance.length === 0 ? (
                <EmptyStateText>{t('dashboard.noResolutions')}</EmptyStateText>
              ) : (
                stats.operator_performance.map((op, idx) => {
                  const maxResolved = Math.max(1, ...stats.operator_performance.map(o => o.resolved_count));
                  const percent = (op.resolved_count / maxResolved) * 100;
                  
                  return (
                    <WidgetItem key={op.id}>
                      <WidgetItemHeader>
                        <WidgetLabel>
                          {idx + 1}. {op.username}
                        </WidgetLabel>
                        <WidgetValue>{op.resolved_count} {t('dashboard.resolvedSuffix')}</WidgetValue>
                      </WidgetItemHeader>
                      <ProgressBarContainer>
                        <ProgressBar $percent={percent} />
                      </ProgressBarContainer>
                    </WidgetItem>
                  );
                })
              )}
            </WidgetList>
          </WidgetCard>

          {/* Hotspots Widget */}
          <WidgetCard data-testid="widget-hotspots">
            <WidgetTitle>
              <ReportProblemIcon fontSize="small" style={{ color: 'var(--primary)' }} />
              {t('dashboard.widgetHotspotsTitle')}
            </WidgetTitle>
            <WidgetList>
              {statsLoading ? (
                <EmptyStateText>{t('dashboard.loadingData')}</EmptyStateText>
              ) : !stats?.zone_hotspots || stats.zone_hotspots.length === 0 ? (
                <EmptyStateText>{t('dashboard.noHotspots')}</EmptyStateText>
              ) : (
                stats.zone_hotspots.map(spot => {
                  const maxIncidents = Math.max(1, ...stats.zone_hotspots.map(s => s.count));
                  const percent = (spot.count / maxIncidents) * 100;

                  return (
                    <WidgetItem key={spot.zone}>
                      <WidgetItemHeader>
                        <WidgetLabel>📍 {spot.zone}</WidgetLabel>
                        <WidgetValue>{spot.count} {spot.count === 1 ? t('dashboard.incidentSingle') : t('dashboard.incidentPlural')}</WidgetValue>
                      </WidgetItemHeader>
                      <ProgressBarContainer>
                        <ProgressBar $percent={percent} $color="#f59e0b" />
                      </ProgressBarContainer>
                    </WidgetItem>
                  );
                })
              )}
            </WidgetList>
          </WidgetCard>
        </AnalyticsGrid>

        <SectionHeader>{t('dashboard.workspacesTitle')}</SectionHeader>
        <ActionsGrid>
          <ActionCard to="/backlog" data-testid="action-card-backlog">
            <ActionHeader>
              <ListAltIcon style={{ color: 'var(--primary)', fontSize: '2rem' }} />
              <ActionTitle>{t('dashboard.backlogTab')}</ActionTitle>
            </ActionHeader>
            <ActionDescription>
              {t('dashboard.backlogCardDescription')}
            </ActionDescription>
            <ActionArrow>
              {t('dashboard.goToBacklog')}
            </ActionArrow>
          </ActionCard>

          <ActionCard to="/board" data-testid="action-card-board">
            <ActionHeader>
              <ViewKanbanIcon style={{ color: 'var(--primary)', fontSize: '2rem' }} />
              <ActionTitle>{t('dashboard.boardTab')}</ActionTitle>
            </ActionHeader>
            <ActionDescription>
              {t('dashboard.boardCardDescription')}
            </ActionDescription>
            <ActionArrow>
              {t('dashboard.goToBoard')}
            </ActionArrow>
          </ActionCard>
        </ActionsGrid>
      </AppMain>
    </AppContainer>
  );
};
export default DashboardStatsView;
