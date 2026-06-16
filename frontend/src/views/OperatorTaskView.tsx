import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Card, Typography, Button, CircularProgress, Alert } from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import { getOperatorTask, updateOperatorTaskStatus } from '../services/api';
import type { OperatorTask } from '../services/types';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
  min-height: 100vh;
  width: 100%;
`;

const MobileCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 24px !important;
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4) !important;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
  animation: fadeIn 0.5s ease forwards;
`;

const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 16px;
`;

const LogoImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const LogoPlaceholder = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const TenantName = styled(Typography)`
  font-weight: 700 !important;
  color: white !important;
  font-size: 1.2rem !important;
`;

const Subtitle = styled(Typography)`
  color: #a09cb4 !important;
  font-size: 0.85rem !important;
`;

const TaskTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TaskId = styled(Typography)`
  font-weight: 700 !important;
  color: white !important;
  font-size: 1.4rem !important;
`;

interface StatusPillProps {
  $status: string;
}

const StatusPill = styled.div<StatusPillProps>`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  ${({ $status }) => {
    switch ($status) {
      case 'pending':
        return `
          background: rgba(255, 179, 0, 0.15);
          color: #ffb300;
          border: 1px solid rgba(255, 179, 0, 0.3);
        `;
      case 'in_progress':
        return `
          background: rgba(33, 150, 243, 0.15);
          color: #2196f3;
          border: 1px solid rgba(33, 150, 243, 0.3);
        `;
      case 'resolved':
        return `
          background: rgba(76, 175, 80, 0.15);
          color: #4caf50;
          border: 1px solid rgba(76, 175, 80, 0.3);
        `;
      default:
        return `
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        `;
    }
  }}
`;

const SectionTitle = styled(Typography)`
  font-weight: 600 !important;
  color: #a09cb4 !important;
  font-size: 0.9rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px !important;
`;

const DescriptionBox = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 16px;
  color: white;
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const TaskPhoto = styled.img`
  width: 100%;
  max-height: 240px;
  border-radius: 14px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 8px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
`;

const MetadataItem = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 10px 12px;
`;

const MetadataLabel = styled(Typography)`
  color: #6b6780 !important;
  font-size: 0.75rem !important;
  text-transform: uppercase;
  font-weight: 600 !important;
`;

const MetadataValue = styled(Typography)`
  color: white !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  margin-top: 2px !important;
`;

const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 20px;
`;

const ActionButton = styled(Button)`
  font-family: var(--font-sans) !important;
  font-weight: 600 !important;
  text-transform: none !important;
  padding: 12px 24px !important;
  border-radius: 12px !important;
  font-size: 1rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  transition: transform 0.2s, background-color 0.2s !important;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const AcceptButton = styled(ActionButton)`
  background: var(--primary) !important;
  color: white !important;

  &:hover {
    background: var(--primary-hover) !important;
  }
`;

const ResolveButton = styled(ActionButton)`
  background: #4caf50 !important;
  color: white !important;

  &:hover {
    background: #43a047 !important;
  }
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b6780;
  font-size: 0.8rem;
  margin-top: 4px;
`;

const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const OperatorTaskView: React.FC = () => {
  const { secure_token: pathToken } = useParams<{ secure_token: string }>();
  const [searchParams] = useSearchParams();
  const secure_token = (pathToken && isUUID(pathToken))
    ? pathToken
    : (searchParams.get('token') || '');
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [task, setTask] = useState<OperatorTask | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!secure_token) return;
    let active = true;
    getOperatorTask(secure_token)
      .then(res => {
        if (!active) return;
        setTask(res);
        setLoading(false);
      })
      .catch(err => {
        if (!active) return;
        console.error(err);
        setError(t('dashboard.errorUpdateTask', 'Task not found or invalid token.'));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [secure_token, t]);

  useEffect(() => {
    if (task?.tenant_visual_config?.primary_color) {
      const hex = task.tenant_visual_config.primary_color;
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
    }
  }, [task]);

  const handleUpdateStatus = (newStatus: string) => {
    if (!secure_token) return;
    setUpdating(true);
    updateOperatorTaskStatus(secure_token, newStatus)
      .then(updatedTask => {
        setTask(updatedTask);
        setUpdating(false);
      })
      .catch(err => {
        console.error(err);
        alert(t('dashboard.errorUpdateTask', 'Failed to update task status.'));
        setUpdating(false);
      });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container style={{ alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'var(--primary)' }} />
      </Container>
    );
  }

  if (error || !task) {
    return (
      <Container style={{ alignItems: 'center' }}>
        <MobileCard>
          <Alert severity="error">{error || t('dashboard.errorUpdateTask')}</Alert>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{
              borderColor: 'rgba(255,255,255,0.1) !important',
              color: 'white !important',
              textTransform: 'none !important',
              borderRadius: '12px !important'
            }}
          >
            Go to Home
          </Button>
        </MobileCard>
      </Container>
    );
  }

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const origin = apiBase.replace(/\/api$/, '');
    return `${origin}${url}`;
  };

  const metadata = task.extra_data || {};
  const metadataKeys = Object.keys(metadata);

  return (
    <Container>
      <MobileCard>
        <BrandHeader>
          {task.tenant_logo_url ? (
            <LogoImage src={task.tenant_logo_url} alt="Tenant Logo" />
          ) : (
            <LogoPlaceholder>{task.tenant_name.charAt(0)}</LogoPlaceholder>
          )}
          <div>
            <TenantName>{task.tenant_name}</TenantName>
            <Subtitle>{t('app.appTitle', 'Issue Tracker')}</Subtitle>
          </div>
        </BrandHeader>

        <TaskTitleRow>
          <TaskId>Task #{task.id}</TaskId>
          <StatusPill $status={task.status}>
            {task.status === 'pending'
              ? t('dashboard.actionPending', 'Pending')
              : task.status === 'in_progress'
              ? t('dashboard.actionInProgress', 'In Progress')
              : t('dashboard.actionResolved', 'Resolved')}
          </StatusPill>
        </TaskTitleRow>

        <div>
          <SectionTitle>{t('dashboard.tableDescription', 'Description')}</SectionTitle>
          <DescriptionBox>{task.description}</DescriptionBox>
          {task.image && (
            <TaskPhoto src={getImageUrl(task.image)} alt="Task image" data-testid="task-image" />
          )}
          {task.photo_url && (
            <TaskPhoto src={getImageUrl(task.photo_url)} alt="Task snapshot" />
          )}
        </div>

        {metadataKeys.length > 0 && (
          <div>
            <SectionTitle>{t('dynamicIssueForm.detailsHeader', 'Specific Details')}</SectionTitle>
            <MetadataGrid>
              {metadataKeys.map(key => {
                const val = metadata[key];
                let displayVal = '-';
                if (val !== undefined && val !== null && val !== '') {
                  if (typeof val === 'boolean') {
                    displayVal = val ? t('dashboard.yes', 'Yes') : t('dashboard.no', 'No');
                  } else {
                    displayVal = String(val);
                  }
                }
                return (
                  <MetadataItem key={key}>
                    <MetadataLabel>{key.replace(/_/g, ' ')}</MetadataLabel>
                    <MetadataValue>{displayVal}</MetadataValue>
                  </MetadataItem>
                );
              })}
            </MetadataGrid>
          </div>
        )}

        <div>
          <DateRow>
            <CalendarTodayIcon sx={{ fontSize: '0.9rem' }} />
            {t('dashboard.tableCreatedAt', 'Created At')}: {formatDate(task.created_at)}
          </DateRow>
        </div>

        <ActionArea>
          {updating ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} sx={{ color: 'var(--primary)' }} />
            </div>
          ) : (
            <>
              {task.status === 'pending' && (
                <AcceptButton
                  variant="contained"
                  onClick={() => handleUpdateStatus('in_progress')}
                  startIcon={<PlayArrowIcon />}
                  data-testid="task-accept-btn"
                >
                  {t('dashboard.markInProgress', 'Mark as In Progress')}
                </AcceptButton>
              )}
              {task.status !== 'resolved' && (
                <ResolveButton
                  variant="contained"
                  onClick={() => handleUpdateStatus('resolved')}
                  startIcon={<CheckIcon />}
                  data-testid="task-resolve-btn"
                >
                  {t('dashboard.markResolved', 'Mark as Resolved')}
                </ResolveButton>
              )}
              {task.status === 'resolved' && (
                <Alert severity="success" icon={<CheckIcon />}>
                  {t('dashboard.taskUpdated', 'Task status updated successfully!')}
                </Alert>
              )}
              {task.operator_hub_token && (
                <Button
                  variant="text"
                  onClick={() => navigate(`/work/hub?token=${task.operator_hub_token}`)}
                  sx={{
                    color: '#a09cb4 !important',
                    textTransform: 'none !important',
                    marginTop: '12px !important',
                    fontWeight: '600 !important',
                    width: '100%',
                    borderRadius: '8px !important',
                    '&:hover': {
                      color: 'white !important',
                      background: 'rgba(255,255,255,0.05) !important'
                    }
                  }}
                  data-testid="back-to-hub-btn"
                >
                  {t('operatorHub.backToHub', 'Back to My Workload')}
                </Button>
              )}
            </>
          )}
        </ActionArea>
      </MobileCard>
    </Container>
  );
};
