import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LaunchIcon from '@mui/icons-material/Launch';
import PrintIcon from '@mui/icons-material/Print';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useAuth } from '../../context/AuthContext';
import {
  useGetTenantConfigQuery,
  useGetIssuesQuery,
  useUpdateIssueStatusMutation,
} from '../../store/apiSlice';
import type { Issue } from '../../services/types';
import { WorkOrderPrintView } from '../../components/WorkOrderPrintView';
import { NavigationTabs } from '../../components/NavigationTabs';
import { PageHeader } from '../../components/PageHeader';
import { applyTenantTheme } from '../../utils/theme';
import { getImageUrl } from '../../utils/url';
import { getZoneValue } from '../../utils/formatters';
import {
  AppContainer,
  CenteredLoadingContainer,
  AppMain,
} from '../../App.styles';
import {
  BoardGrid,
  ColumnContainer,
  ColumnHeader,
  ColumnTitle,
  TaskCounter,
  CardContainer,
  CardImage,
  CardTitle,
  CardDesc,
  CardMetadataRow
} from './BoardView.styles';

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
  const [imgError, setImgError] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(issue.id),
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const zone = issue.zone_name || getZoneValue(issue.extra_data);
  const displayLabel = issue.order_number || `ID #${issue.id}`;
  const imageUrl = getImageUrl(issue.image || issue.photo_url);

  return (
    <CardContainer
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
      {...listeners}
      {...attributes}
      data-testid={`kanban-card-${issue.id}`}
    >
      {imageUrl && !imgError && (
        <CardImage
          src={imageUrl}
          alt="Issue visual proof"
          onError={() => setImgError(true)}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <CardTitle data-testid={`kanban-card-title-${issue.id}`}>
          {issue.title || issue.description || displayLabel}
        </CardTitle>
        {issue.description && issue.title && (
          <CardDesc style={{ opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
      <CardMetadataRow style={{ borderTop: '1px solid var(--border-card, rgba(150, 150, 150, 0.15))', paddingTop: '8px' }}>
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

  const [printIssue, setPrintIssue] = useState<Issue | null>(null);

  // RTK Query hooks
  const { data: config, isLoading: configLoading } = useGetTenantConfigQuery(tenantId || '', { skip: !tenantId });
  const { data: issuesData, isLoading: issuesLoading } = useGetIssuesQuery(
    { tenantId: config?.id || '', board: true },
    { skip: !config }
  );
  const [updateIssueStatusMutation] = useUpdateIssueStatusMutation();

  const issues = issuesData?.results || [];

  useEffect(() => {
    if (config?.default_language && !localStorage.getItem('app_language')) {
      i18n.changeLanguage(config.default_language);
    }
  }, [config, i18n]);

  useEffect(() => {
    applyTenantTheme(config?.visual_config?.primary_color);
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

    try {
      await updateIssueStatusMutation({ id: issueId, status: targetStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update status on drag end:", err);
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

  if (configLoading || !config) {
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
      <PageHeader user={user} onLogout={handleLogout} />

      <AppMain>
        <NavigationTabs activeTab="board" />

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
