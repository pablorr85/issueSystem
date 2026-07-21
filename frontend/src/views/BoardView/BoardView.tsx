import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import LaunchIcon from '@mui/icons-material/Launch';
import PrintIcon from '@mui/icons-material/Print';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useAuth } from '../../context/AuthContext';
import { getTenantConfig, getIssues, updateIssueStatus } from '../../services/api';
import type { TenantConfig, Issue } from '../../services/types';
import { WorkOrderPrintView } from '../../components/WorkOrderPrintView';
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
import {
  NavContainer,
  NavLinkButton,
  BoardGrid,
  ColumnContainer,
  ColumnHeader,
  ColumnTitle,
  TaskCounter,
  CardContainer,
  CardImage,
  CardDesc,
  CardMetadataRow
} from './BoardView.styles';

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
  onPrint?: (issue: Issue) => void;
}

const KanbanCard: React.FC<CardProps> = ({ issue, onPrint }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(issue.id),
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const zone = issue.zone_name || getZoneValue(issue.extra_data);
  const displayLabel = issue.order_number || `ID #${issue.id}`;

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem', color: '#ffffff' }} data-testid={`kanban-card-title-${issue.id}`}>
          {issue.title}
        </h4>
        {issue.description && (
          <CardDesc style={{ opacity: 0.7, fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {issue.description}
          </CardDesc>
        )}
      </div>
      <CardMetadataRow>
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/work/task/${issue.id}`);
          }}
          style={{
            color: 'var(--primary)',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'underline'
          }}
          data-testid={`kanban-card-link-${issue.id}`}
        >
          {displayLabel} <LaunchIcon style={{ fontSize: '0.85rem' }} />
        </span>
      </CardMetadataRow>
      {zone && (
        <CardMetadataRow style={{ marginTop: '2px' }}>
          <span>📍 {zone}</span>
        </CardMetadataRow>
      )}
      <CardMetadataRow style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
        <span>👤 {issue.assigned_to_name || t('dashboard.unassigned')}</span>
        {onPrint && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrint(issue);
            }}
            title={t('workOrder.printButton', 'Print Work Order')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary, #c5c2d9)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 4px',
              borderRadius: '4px'
            }}
            data-testid={`print-work-order-btn-${issue.id}`}
          >
            <PrintIcon style={{ fontSize: '1rem' }} />
          </button>
        )}
      </CardMetadataRow>
    </CardContainer>
  );
};

export const BoardView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { tenantId, user, logout } = useAuth();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [prevTenantId, setPrevTenantId] = useState<string | null>(tenantId);
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(!!tenantId);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState<boolean>(true);
  const [printIssue, setPrintIssue] = useState<Issue | null>(null);

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
        console.error("Failed to load tenant config:", err);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tenantId, i18n]);

  useEffect(() => {
    if (!config) return;
    let active = true;
    document.documentElement.style.setProperty('--primary-color', config.visual_config.primary_color || '#2563eb');
    document.documentElement.style.setProperty('--secondary-color', config.visual_config.secondary_color || '#3b82f6');
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
    const newStatus = over.id as Issue['status'] | 'done';

    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const targetStatus: Issue['status'] = newStatus === 'done'
      ? (issue.status === 'wont_fix' ? 'wont_fix' : 'resolved')
      : (newStatus as Issue['status']);

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
  const qaIssues = useMemo(() => issues.filter(i => i.status === 'qa'), [issues]);
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
      {printIssue && (
        <WorkOrderPrintView
          issue={printIssue}
          tenantName={config?.name}
          onClose={() => setPrintIssue(null)}
        />
      )}
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
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <BoardGrid>
              <KanbanColumn id="pending" title={t('dashboard.kanbanPending')} color="#3b82f6" count={pendingIssues.length}>
                {pendingIssues.map(issue => (
                  <KanbanCard key={issue.id} issue={issue} onPrint={setPrintIssue} />
                ))}
              </KanbanColumn>

              <KanbanColumn id="in_progress" title={t('dashboard.kanbanInProgress')} color="#10b981" count={inProgressIssues.length}>
                {inProgressIssues.map(issue => (
                  <KanbanCard key={issue.id} issue={issue} onPrint={setPrintIssue} />
                ))}
              </KanbanColumn>

              <KanbanColumn id="qa" title={t('dashboard.kanbanQA', 'Verification (QA)')} color="#f59e0b" count={qaIssues.length}>
                {qaIssues.map(issue => (
                  <KanbanCard key={issue.id} issue={issue} onPrint={setPrintIssue} />
                ))}
              </KanbanColumn>

              <KanbanColumn id="blocked" title={t('dashboard.kanbanBlocked')} color="#ef4444" count={blockedIssues.length}>
                {blockedIssues.map(issue => (
                  <KanbanCard key={issue.id} issue={issue} onPrint={setPrintIssue} />
                ))}
              </KanbanColumn>

              <KanbanColumn id="done" title={t('dashboard.kanbanDone')} color="#6b7280" count={doneIssues.length}>
                {doneIssues.map(issue => (
                  <KanbanCard key={issue.id} issue={issue} onPrint={setPrintIssue} />
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
