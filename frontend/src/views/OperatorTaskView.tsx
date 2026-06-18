import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircularProgress, Alert } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { getOperatorTask, updateOperatorTaskStatus } from '../services/api';
import { getUrgencyLevel, getUrgencyIcon } from '../utils/urgency';
import type { OperatorTask } from '../services/types';
import {
  Container,
  MobileCard,
  BrandHeader,
  LogoImage,
  LogoPlaceholder,
  TenantName,
  Subtitle,
  TaskTitleRow,
  TaskId,
  StatusPill,
  SectionTitle,
  DescriptionBox,
  TaskPhoto,
  MetadataGrid,
  MetadataItem,
  MetadataLabel,
  MetadataValue,
  ActionArea,
  AcceptButton,
  ResolveButton,
  DateRow,
  HomeButton,
  BackToHubButton,
  UrgencyPill,
  NoPhotoPlaceholder,
  LightboxOverlay,
  LightboxImage,
  LightboxCloseButton
} from './OperatorTaskView.styles';

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
  const { t } = useTranslation();


  const navigate = useNavigate();
  const [task, setTask] = useState<OperatorTask | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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
          <HomeButton
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Go to Home
          </HomeButton>
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
  const urgency = getUrgencyLevel(task, t);

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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <UrgencyPill $level={urgency.key}>
              {getUrgencyIcon(urgency.key)}
              {urgency.label}
            </UrgencyPill>
            <StatusPill $status={task.status}>
              {task.status === 'pending'
                ? t('dashboard.actionPending', 'Pending')
                : task.status === 'in_progress'
                ? t('dashboard.actionInProgress', 'In Progress')
                : t('dashboard.actionResolved', 'Resolved')}
            </StatusPill>
          </div>
        </TaskTitleRow>

        {getImageUrl(task.image || task.photo_url) ? (
          <TaskPhoto
            src={getImageUrl(task.image || task.photo_url)}
            alt="Task image"
            data-testid="task-image"
            style={{ cursor: 'zoom-in', marginTop: 0 }}
            onClick={() => setLightboxImage(getImageUrl(task.image || task.photo_url))}
          />
        ) : (
          <NoPhotoPlaceholder data-testid="no-photo-placeholder">
            <CameraAltIcon sx={{ fontSize: 40 }} />
            <span>{t('operatorHub.noPhoto', 'No photo provided')}</span>
          </NoPhotoPlaceholder>
        )}

        <div>
          <SectionTitle>{t('dashboard.tableDescription', 'Description')}</SectionTitle>
          <DescriptionBox>{task.description}</DescriptionBox>
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
                <BackToHubButton
                  variant="text"
                  onClick={() => navigate(`/work/hub?token=${task.operator_hub_token}`)}
                  data-testid="back-to-hub-btn"
                >
                  {t('operatorHub.backToHub', 'Back to My Workload')}
                </BackToHubButton>
              )}
            </>
          )}
        </ActionArea>
      </MobileCard>
      {lightboxImage && (
        <LightboxOverlay onClick={() => setLightboxImage(null)} data-testid="lightbox-overlay">
          <LightboxImage src={lightboxImage} alt="Fullscreen Preview" />
          <LightboxCloseButton onClick={() => setLightboxImage(null)}>&times;</LightboxCloseButton>
        </LightboxOverlay>
      )}
    </Container>
  );
};
