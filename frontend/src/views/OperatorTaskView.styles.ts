import styled from 'styled-components';
import { Card, Typography, Button } from '@mui/material';

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
  color: white !important;
  font-size: 1.2rem !important;
`;

export const Subtitle = styled(Typography)`
  color: #a09cb4 !important;
  font-size: 0.85rem !important;
`;

export const TaskTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const TaskId = styled(Typography)`
  font-weight: 700 !important;
  color: white !important;
  font-size: 1.4rem !important;
`;

interface StatusPillProps {
  $status: string;
}

export const StatusPill = styled.div<StatusPillProps>`
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

interface UrgencyPillProps {
  $level: string;
}

export const UrgencyPill = styled.span<UrgencyPillProps>`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 5px 10px;
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

export const SectionTitle = styled(Typography)`
  font-weight: 600 !important;
  color: #a09cb4 !important;
  font-size: 0.9rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px !important;
`;

export const DescriptionBox = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 16px;
  color: white;
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;
`;

export const TaskPhoto = styled.img`
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

export const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
`;

export const MetadataItem = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 10px 12px;
`;

export const MetadataLabel = styled(Typography)`
  color: #6b6780 !important;
  font-size: 0.75rem !important;
  text-transform: uppercase;
  font-weight: 600 !important;
`;

export const MetadataValue = styled(Typography)`
  color: white !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  margin-top: 2px !important;
`;

export const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 20px;
`;

export const ActionButton = styled(Button)`
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

export const AcceptButton = styled(ActionButton)`
  background: var(--primary) !important;
  color: white !important;

  &:hover {
    background: var(--primary-hover) !important;
  }
`;

export const ResolveButton = styled(ActionButton)`
  background: #4caf50 !important;
  color: white !important;

  &:hover {
    background: #43a047 !important;
  }
`;

export const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b6780;
  font-size: 0.8rem;
  margin-top: 4px;
`;

export const HomeButton = styled(Button)`
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  text-transform: none !important;
  border-radius: 12px !important;
`;

export const BackToHubButton = styled(Button)`
  color: #a09cb4 !important;
  text-transform: none !important;
  margin-top: 12px !important;
  font-weight: 600 !important;
  width: 100%;
  border-radius: 8px !important;
  
  &:hover {
    color: white !important;
    background: rgba(255, 255, 255, 0.05) !important;
  }
`;
