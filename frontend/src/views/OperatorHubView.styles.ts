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

export const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 16px;
`;

export const LogoImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const LogoPlaceholder = styled.div`
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

export const TenantName = styled(Typography)`
  font-weight: 700 !important;
  color: white !important;
  font-size: 1.2rem !important;
`;

export const Subtitle = styled(Typography)`
  color: #a09cb4 !important;
  font-size: 0.85rem !important;
`;

export const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const TaskCard = styled.div`
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
  color: white !important;
  font-size: 0.95rem !important;
`;

export const TaskDescription = styled(Typography)`
  color: #d1cfe0 !important;
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

export const StatusPill = styled.span<{ $status: string }>`
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  
  ${({ $status }) => {
    switch ($status) {
      case 'in_progress':
        return `
          background: rgba(33, 150, 243, 0.12);
          color: #2196f3;
          border: 1px solid rgba(33, 150, 243, 0.2);
        `;
      case 'resolved':
        return `
          background: rgba(76, 175, 80, 0.12);
          color: #4caf50;
          border: 1px solid rgba(76, 175, 80, 0.2);
        `;
      case 'blocked':
        return `
          background: rgba(239, 108, 0, 0.12);
          color: #ff9800;
          border: 1px solid rgba(239, 108, 0, 0.2);
        `;
      case 'wont_fix':
        return `
          background: rgba(120, 144, 156, 0.12);
          color: #b0bec5;
          border: 1px solid rgba(120, 144, 156, 0.2);
        `;
      case 'pending':
      default:
        return `
          background: rgba(255, 179, 0, 0.12);
          color: #ffb300;
          border: 1px solid rgba(255, 179, 0, 0.2);
        `;
    }
  }}
`;

export const EmptyContainer = styled.div`
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

export const HubSubtitle = styled(Typography)`
  color: white !important;
  font-weight: 600 !important;
  margin-bottom: 8px !important;
  font-size: 1.1rem !important;
`;

export const EmptyText = styled(Typography)`
  color: #a09cb4 !important;
  font-size: 0.95rem !important;
`;

export const LoadingContainer = styled(Container)`
  align-items: center;
  justify-content: center;
`;

export const CenterContainer = styled(Container)`
  align-items: center;
`;

