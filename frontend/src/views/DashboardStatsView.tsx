import React, { useEffect } from 'react';
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
import { useGetTenantConfigQuery, useGetIssueStatsQuery } from '../store/apiSlice';
import type { OperatorWorkload, OperatorPerformance, ZoneHotspot } from '../services/types';
import { ShareQRSection } from '../components/ShareQRSection/ShareQRSection';
import { NavigationTabs } from '../components/NavigationTabs';
import { PageHeader } from '../components/PageHeader';
import { applyTenantTheme } from '../utils/theme';
import {
  AppContainer,
  CenteredLoadingContainer,
  AppMain,
} from '../App.styles';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(Link)`
  text-decoration: none;
  cursor: pointer;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  box-shadow: var(--shadow);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow);
    border-color: var(--primary);
  }
`;

const StatIconWrapper = styled.div<{ $bgColor: string; $textColor: string }>`
  background: ${({ $bgColor }) => $bgColor};
  color: ${({ $textColor }) => $textColor};
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

const PrimaryIconWrapper = styled.span`
  color: var(--primary);
  display: inline-flex;
  align-items: center;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatNumber = styled.span`
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
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
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 20px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow);

  &:hover {
    border-color: var(--primary);
    transform: translateY(-6px);
    box-shadow: var(--shadow);
    background: var(--bg-surface);
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
  color: var(--text-primary);
`;

const ActionDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
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
  color: var(--text-primary);
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
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const WidgetTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border-subtle);
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
  color: var(--text-primary);
`;

const WidgetLabel = styled.span`
  color: var(--text-secondary);
`;

const WidgetValue = styled.span`
  font-weight: bold;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: var(--border-subtle);
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

  // RTK Query hooks
  const { data: config, isLoading: configLoading } = useGetTenantConfigQuery(tenantId || '', { skip: !tenantId });
  const { data: stats, isLoading: statsLoading } = useGetIssueStatsQuery(undefined, { skip: !tenantId });

  const loading = configLoading || !config;

  useEffect(() => {
    if (config?.default_language && !localStorage.getItem('app_language')) {
      i18n.changeLanguage(config.default_language);
    }
  }, [config, i18n]);

  useEffect(() => {
    applyTenantTheme(config?.visual_config?.primary_color);
  }, [config]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const reportingUrl = config ? `${window.location.origin}/${config.id}/report` : '';

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

        <NavigationTabs activeTab="dashboard" />

        {config && (
          <ShareQRSection tenant={config} reportingUrl={reportingUrl} />
        )}

        <SectionHeader>{t('dashboard.kpisTitle')}</SectionHeader>
        <StatsGrid>
          <StatCard to="/backlog?assigned=false" data-testid="kpi-card-unassigned">
            <StatIconWrapper $bgColor="rgba(239, 68, 68, 0.15)" $textColor="#ef4444">
              <AssignmentAlertIcon />
            </StatIconWrapper>
            <StatContent>
              <StatNumber>{statsLoading ? '...' : stats?.unassigned_count ?? 0}</StatNumber>
              <StatLabel>{t('dashboard.kpiUnassigned')}</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard to="/board" data-testid="kpi-card-in-progress">
            <StatIconWrapper $bgColor="rgba(59, 130, 246, 0.15)" $textColor="#3b82f6">
              <PlayCircleIcon />
            </StatIconWrapper>
            <StatContent>
              <StatNumber>{statsLoading ? '...' : stats?.in_progress_count ?? 0}</StatNumber>
              <StatLabel>{t('dashboard.kpiInProgress')}</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard to="/backlog?status=blocked" data-testid="kpi-card-blocked">
            <StatIconWrapper $bgColor="rgba(245, 158, 11, 0.15)" $textColor="#f59e0b">
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
              <PrimaryIconWrapper>
                <DashboardIcon fontSize="small" />
              </PrimaryIconWrapper>
              {t('dashboard.widgetWorkloadTitle')}
            </WidgetTitle>
            <WidgetList>
              {statsLoading ? (
                <EmptyStateText>{t('dashboard.loadingData')}</EmptyStateText>
              ) : !stats?.operator_workload || stats.operator_workload.length === 0 ? (
                <EmptyStateText>{t('dashboard.noOperators')}</EmptyStateText>
              ) : (
                stats.operator_workload.map((op: OperatorWorkload) => {
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
              <PrimaryIconWrapper>
                <ListAltIcon fontSize="small" />
              </PrimaryIconWrapper>
              {t('dashboard.widgetLeaderboardTitle')}
            </WidgetTitle>
            <WidgetList>
              {statsLoading ? (
                <EmptyStateText>{t('dashboard.loadingData')}</EmptyStateText>
              ) : !stats?.operator_performance || stats.operator_performance.length === 0 ? (
                <EmptyStateText>{t('dashboard.noResolutions')}</EmptyStateText>
              ) : (
                stats.operator_performance.map((op: OperatorPerformance, idx: number) => {
                  const maxResolved = Math.max(1, ...stats.operator_performance.map((o: OperatorPerformance) => o.resolved_count));
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
              <PrimaryIconWrapper>
                <ReportProblemIcon fontSize="small" />
              </PrimaryIconWrapper>
              {t('dashboard.widgetHotspotsTitle')}
            </WidgetTitle>
            <WidgetList>
              {statsLoading ? (
                <EmptyStateText>{t('dashboard.loadingData')}</EmptyStateText>
              ) : !stats?.zone_hotspots || stats.zone_hotspots.length === 0 ? (
                <EmptyStateText>{t('dashboard.noHotspots')}</EmptyStateText>
              ) : (
                stats.zone_hotspots.map((spot: ZoneHotspot) => {
                  const maxIncidents = Math.max(1, ...stats.zone_hotspots.map((s: ZoneHotspot) => s.count));
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
              <PrimaryIconWrapper style={{ fontSize: '2rem' }}>
                <ListAltIcon fontSize="inherit" />
              </PrimaryIconWrapper>
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
              <PrimaryIconWrapper style={{ fontSize: '2rem' }}>
                <ViewKanbanIcon fontSize="inherit" />
              </PrimaryIconWrapper>
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
