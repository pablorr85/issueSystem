import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Card, Typography, CircularProgress, Alert, Button } from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { getOperatorHub } from '../services/api';
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
  background: var(--primary, HSL(260, 85%, 60%));
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

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const TaskCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s, border-color 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.04);
    border-color: var(--primary, HSL(260, 85%, 60%));
  }
`;

const TaskInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
  margin-right: 12px;
`;

const TaskTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const TaskId = styled(Typography)`
  font-weight: 700 !important;
  color: white !important;
  font-size: 0.95rem !important;
`;

const TaskDescription = styled(Typography)`
  color: #d1cfe0 !important;
  font-size: 0.9rem !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface PillProps {
  $level: string;
}

const UrgencyPill = styled.span<PillProps>`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-transform: uppercase;

  ${({ $level }) => {
    switch ($level) {
      case 'critical':
        return `
          background: rgba(244, 67, 54, 0.15);
          color: #ef5350;
          border: 1px solid rgba(244, 67, 54, 0.3);
          animation: pulse 2s infinite;
        `;
      case 'high':
        return `
          background: rgba(255, 152, 0, 0.15);
          color: #ffb74d;
          border: 1px solid rgba(255, 152, 0, 0.3);
        `;
      case 'medium':
        return `
          background: rgba(33, 150, 243, 0.15);
          color: #64b5f6;
          border: 1px solid rgba(33, 150, 243, 0.3);
        `;
      case 'low':
        return `
          background: rgba(76, 175, 80, 0.15);
          color: #81c784;
          border: 1px solid rgba(76, 175, 80, 0.3);
        `;
      default:
        return `
          background: rgba(255, 255, 255, 0.08);
          color: #e0e0e0;
          border: 1px solid rgba(255, 255, 255, 0.15);
        `;
    }
  }}

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(244, 67, 54, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
    }
  }
`;

const StatusPill = styled.span<{ $status: string }>`
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  
  ${({ $status }) => {
    if ($status === 'in_progress') {
      return `
        background: rgba(33, 150, 243, 0.12);
        color: #2196f3;
        border: 1px solid rgba(33, 150, 243, 0.2);
      `;
    }
    return `
      background: rgba(255, 179, 0, 0.12);
      color: #ffb300;
      border: 1px solid rgba(255, 179, 0, 0.2);
    `;
  }}
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
`;

const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const OperatorHubView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<OperatorTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !isUUID(token)) {
      setError(t('operatorHub.errorLoad', 'Failed to load task hub. Invalid or missing token.'));
      setLoading(false);
      return;
    }

    let active = true;
    getOperatorHub(token)
      .then(res => {
        if (!active) return;
        setTasks(res);
        setLoading(false);
      })
      .catch(err => {
        if (!active) return;
        console.error(err);
        setError(t('operatorHub.errorLoad', 'Failed to load task hub. Invalid or missing token.'));
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, t]);

  // Dynamic branding theme hook
  useEffect(() => {
    if (tasks.length > 0) {
      const firstTask = tasks[0];
      if (firstTask.tenant_visual_config?.primary_color) {
        const hex = firstTask.tenant_visual_config.primary_color;
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
    }
  }, [tasks]);

  const getUrgencyLevel = (task: OperatorTask): { key: string; label: string; order: number } => {
    const extra = task.extra_data || {};
    const key = Object.keys(extra).find(k => k.toLowerCase() === 'urgency' || k.toLowerCase() === 'urgencia');
    const val = key ? String(extra[key]).toLowerCase() : 'normal';

    if (val === 'critical' || val === 'crítica' || val === 'critica') {
      return { key: 'critical', label: t('operatorHub.urgencyCritical', 'Critical'), order: 0 };
    }
    if (val === 'high' || val === 'alta') {
      return { key: 'high', label: t('operatorHub.urgencyHigh', 'High'), order: 1 };
    }
    if (val === 'medium' || val === 'media') {
      return { key: 'medium', label: t('operatorHub.urgencyMedium', 'Medium'), order: 2 };
    }
    if (val === 'low' || val === 'baja') {
      return { key: 'low', label: t('operatorHub.urgencyLow', 'Low'), order: 3 };
    }
    return { key: 'normal', label: t('operatorHub.urgencyNone', 'Normal'), order: 4 };
  };

  const getUrgencyIcon = (levelKey: string) => {
    switch (levelKey) {
      case 'critical':
        return <ErrorIcon style={{ fontSize: '0.9rem' }} />;
      case 'high':
        return <WarningIcon style={{ fontSize: '0.9rem' }} />;
      case 'medium':
        return <InfoIcon style={{ fontSize: '0.9rem' }} />;
      case 'low':
        return <ArrowDownwardIcon style={{ fontSize: '0.9rem' }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container style={{ alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'var(--primary, HSL(260, 85%, 60%))' }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ alignItems: 'center' }}>
        <MobileCard>
          <Alert severity="error">{error}</Alert>
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

  // Sort tasks by urgency level, then by creation date (newest first)
  const sortedTasks = [...tasks].sort((a, b) => {
    const urgencyA = getUrgencyLevel(a);
    const urgencyB = getUrgencyLevel(b);
    if (urgencyA.order !== urgencyB.order) {
      return urgencyA.order - urgencyB.order;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const tenantName = tasks[0]?.tenant_name || t('app.appTitle', 'Issue Tracker');
  const tenantLogo = tasks[0]?.tenant_logo_url;

  return (
    <Container>
      <MobileCard>
        <BrandHeader>
          {tenantLogo ? (
            <LogoImage src={tenantLogo} alt="Tenant Logo" />
          ) : (
            <LogoPlaceholder>{tenantName.charAt(0)}</LogoPlaceholder>
          )}
          <div>
            <TenantName>{tenantName}</TenantName>
            <Subtitle>{t('operatorHub.title')}</Subtitle>
          </div>
        </BrandHeader>

        <div>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1, fontSize: '1.1rem' }}>
            {t('operatorHub.subtitle')}
          </Typography>
        </div>

        {sortedTasks.length === 0 ? (
          <EmptyContainer>
            <BuildCircleIcon sx={{ fontSize: '3rem', color: 'rgba(255,255,255,0.2)' }} />
            <Typography sx={{ color: '#a09cb4', fontSize: '0.95rem' }}>
              {t('operatorHub.noTasks')}
            </Typography>
          </EmptyContainer>
        ) : (
          <TaskList>
            {sortedTasks.map(task => {
              const urgency = getUrgencyLevel(task);
              return (
                <TaskCard
                  key={task.id}
                  onClick={() => navigate(`/work/task/${task.id}?token=${task.secure_token}`)}
                  data-testid={`task-card-${task.id}`}
                >
                  <TaskInfo>
                    <TaskTitleRow>
                      <TaskId>Task #{task.id}</TaskId>
                      <StatusPill $status={task.status}>
                        {task.status === 'in_progress' ? t('dashboard.actionInProgress') : t('dashboard.actionPending')}
                      </StatusPill>
                      <UrgencyPill $level={urgency.key}>
                        {getUrgencyIcon(urgency.key)}
                        {urgency.label}
                      </UrgencyPill>
                    </TaskTitleRow>
                    <TaskDescription variant="body2">
                      {task.description}
                    </TaskDescription>
                  </TaskInfo>
                  <ChevronRightIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
                </TaskCard>
              );
            })}
          </TaskList>
        )}
      </MobileCard>
    </Container>
  );
};
