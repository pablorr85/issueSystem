import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { getTenantConfig, getIssues, updateIssueStatus } from '../services/api';
import type { TenantConfig, Issue } from '../services/types';
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

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  overflow-x: auto;
  align-items: start;
  padding-bottom: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
`;

const ColumnContainer = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 550px;
  transition: background-color 0.2s, border-color 0.2s;
`;

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ColumnTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TaskCounter = styled.span`
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--text-secondary, #c5c2d9);
`;

const CardContainer = styled.div<{ $isDragging?: boolean }>`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: grab;
  user-select: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s, box-shadow 0.2s;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.4 : 1)};
  touch-action: none;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    cursor: grabbing;
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
`;

const CardDesc = styled.p`
  font-size: 0.9rem;
  color: #ffffff;
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
`;

const CardMetadataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-secondary, #c5c2d9);
`;

const getZoneValue = (extraData?: Record<string, unknown>) => {
  if (!extraData) return '';
  const zoneKey = Object.keys(extraData).find(
    k => k.toLowerCase().includes('zona') || k.toLowerCase().includes('location') || k.toLowerCase().includes('zone')
  );
  if (zoneKey) {
    return String(extraData[zoneKey]);
  }
  const firstKey = Object.keys(extraData)[0];
  return firstKey ? `${firstKey}: ${extraData[firstKey]}` : '';
};

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
  const origin = apiBase.replace(/\/api$/, '');
  return `${origin}${url}`;
};

interface ColumnProps {
  id: string;
  title: string;
  color: string;
  children: React.ReactNode;
  count: number;
}

const KanbanColumn: React.FC<ColumnProps> = ({ id, title, color, children, count }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  const style = {
    backgroundColor: isOver ? 'rgba(255, 255, 255, 0.05)' : undefined,
    borderColor: isOver ? 'var(--primary)' : undefined,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <ColumnHeader>
        <ColumnTitle>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
          {title}
        </ColumnTitle>
        <TaskCounter>{count}</TaskCounter>
      </ColumnHeader>
      <ColumnContainer ref={setNodeRef} style={style}>
        {children}
      </ColumnContainer>
    </div>
  );
};

interface CardProps {
  issue: Issue;
}

const KanbanCard: React.FC<CardProps> = ({ issue }) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(issue.id),
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const zone = getZoneValue(issue.extra_data);

  return (
    <CardContainer
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
      {...listeners}
      {...attributes}
      data-testid={`kanban-card-${issue.id}`}
    >
      {getImageUrl(issue.image || issue.photo_url) && (
        <CardImage src={getImageUrl(issue.image || issue.photo_url)} alt="Issue visual proof" />
      )}
      <CardDesc>{issue.description}</CardDesc>
      <CardMetadataRow>
        <span>ID #{issue.id}</span>
        {zone && <span>📍 {zone}</span>}
      </CardMetadataRow>
      <CardMetadataRow style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
        <span>👤 {issue.assigned_to_name || t('dashboard.unassigned')}</span>
      </CardMetadataRow>
    </CardContainer>
  );
};

export const BoardView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { tenantId, user, logout } = useAuth();
  const navigate = useNavigate();
  const [prevTenantId, setPrevTenantId] = useState<string | null>(tenantId);
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(!!tenantId);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState<boolean>(true);

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
        console.error('Failed to load tenant config for board:', err);
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

  // Fetch Board Issues (assigned_to NOT NULL, active or resolved in < 24h)
  useEffect(() => {
    if (!config) return;
    let active = true;
    getIssues(config.id, undefined, undefined, true)
      .then(res => {
        if (!active) return;
        setIssues(res.results || []);
        setIssuesLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch board issues:", err);
        if (!active) return;
        setIssues([]);
        setIssuesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [config]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const issueId = Number(active.id);
    const newStatus = over.id as Issue['status'];

    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    let targetStatus = newStatus;
    if (newStatus === 'done') {
      targetStatus = issue.status === 'wont_fix' ? 'wont_fix' : 'resolved';
    }

    if (issue.status === targetStatus) return;

    const previousStatus = issue.status;

    // Optimistic UI Update
    setIssues(prev =>
      prev.map(i => (i.id === issueId ? { ...i, status: targetStatus } : i))
    );

    try {
      await updateIssueStatus(issueId, targetStatus);
    } catch (err) {
      console.error("Failed to update status on drag end:", err);
      // Rollback
      setIssues(prev =>
        prev.map(i => (i.id === issueId ? { ...i, status: previousStatus } : i))
      );
      alert(t('dashboard.errorUpdate', 'Failed to update issue status. Please try again.'));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Group Issues by column
  const pendingIssues = useMemo(() => issues.filter(i => i.status === 'pending'), [issues]);
  const inProgressIssues = useMemo(() => issues.filter(i => i.status === 'in_progress'), [issues]);
  const blockedIssues = useMemo(() => issues.filter(i => i.status === 'blocked'), [issues]);
  const doneIssues = useMemo(() => issues.filter(i => ['resolved', 'wont_fix'].includes(i.status)), [issues]);

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
          <NavLinkButton to="/backlog">
            <ListAltIcon fontSize="small" />
            {t('dashboard.backlogTab')}
          </NavLinkButton>
          <NavLinkButton to="/board" $active>
            <ViewKanbanIcon fontSize="small" />
            {t('dashboard.boardTab')}
          </NavLinkButton>
        </NavContainer>

        {issuesLoading ? (
          <CenteredLoadingContainer>
            <h3>{t('dashboard.cargandoTablero')}</h3>
          </CenteredLoadingContainer>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
            <BoardGrid>
              <KanbanColumn id="pending" title={t('dashboard.kanbanPending')} color="#3b82f6" count={pendingIssues.length}>
                {pendingIssues.map(issue => (
                  <KanbanCard key={issue.id} issue={issue} />
                ))}
              </KanbanColumn>

              <KanbanColumn id="in_progress" title={t('dashboard.kanbanInProgress')} color="#10b981" count={inProgressIssues.length}>
                {inProgressIssues.map(issue => (
                  <KanbanCard key={issue.id} issue={issue} />
                ))}
              </KanbanColumn>

              <KanbanColumn id="blocked" title={t('dashboard.kanbanBlocked')} color="#ef4444" count={blockedIssues.length}>
                {blockedIssues.map(issue => (
                  <KanbanCard key={issue.id} issue={issue} />
                ))}
              </KanbanColumn>

              <KanbanColumn id="done" title={t('dashboard.kanbanDone')} color="#6b7280" count={doneIssues.length}>
                {doneIssues.map(issue => (
                  <KanbanCard key={issue.id} issue={issue} />
                ))}
              </KanbanColumn>
            </BoardGrid>
          </DndContext>
        )}
      </AppMain>
    </AppContainer>
  );
};
export default BoardView;
