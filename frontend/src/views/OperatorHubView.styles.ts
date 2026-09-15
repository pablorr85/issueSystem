import styled from 'styled-components';
import { Card, Typography } from '@mui/material';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
  min-height: 100vh;
  width: 100%;
`;

export const MobileCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  background: var(--bg-card) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-card) !important;
  border-radius: 24px !important;
  box-shadow: var(--shadow) !important;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
  animation: fadeIn 0.5s ease forwards;
`;

export const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-card);
  padding-bottom: 16px;
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const LogoImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid var(--border-card);
`;

export const LogoPlaceholder = styled.div`
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

export const TenantName = styled(Typography)`
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  font-size: 1.2rem !important;
`;

export const Subtitle = styled(Typography)`
  color: var(--text-secondary) !important;
  font-size: 0.85rem !important;
`;

export const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const TaskCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s, border-color 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    background: var(--bg-card);
    border-color: var(--primary);
  }
`;

export const TaskInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
  margin-right: 12px;
`;

export const TaskTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const TaskId = styled(Typography)`
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  font-size: 0.95rem !important;
`;

export const TaskDescription = styled(Typography)`
  color: var(--text-secondary) !important;
  font-size: 0.9rem !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface PillProps {
  $level: string;
}

export const UrgencyPill = styled.span<PillProps>`
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
          background: var(--bg-surface);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
        `;
    }
  }}
`;

export const StatusPill = styled.span<{ $status?: string }>`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
`;

export const EmptyContainer = styled.div`
  text-align: center;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

export const HubSubtitle = styled(Typography)`
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
`;

export const EmptyText = styled(Typography)`
  color: var(--text-muted) !important;
  font-size: 0.9rem !important;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
`;

export const CenterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 16px;
`;
