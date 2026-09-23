import styled from 'styled-components';
import { Card, Typography, Button } from '@mui/material';

export const QRSectionCard = styled(Card)`
  padding: 24px;
  background: var(--bg-card) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-card) !important;
  border-radius: 16px !important;
  box-shadow: var(--shadow) !important;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const QRContainer = styled.div`
  background: white;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 184px;
  height: 184px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  align-self: center;
`;

export const QRInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
`;

export const QRTitle = styled(Typography)`
  font-weight: 600 !important;
  color: var(--text-primary) !important;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const HiddenContainer = styled.div`
  display: none;
`;

export const QRDescription = styled(Typography)`
  color: var(--text-secondary) !important;
  font-size: 0.9rem !important;
  line-height: 1.5 !important;
`;

export const LinkInputContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  width: 100%;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const ReadOnlyInput = styled.input`
  flex: 1;
  background: var(--bg-surface);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: monospace;
  outline: none;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  
  &:focus {
    border-color: var(--primary);
  }
`;

export const ActionButtonsGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const SecondaryActionButton = styled(Button)`
  border-color: var(--border-card) !important;
  color: var(--text-primary) !important;
  text-transform: none !important;
  font-weight: 600 !important;
  height: 40px !important;
  border-radius: 8px !important;
  padding: 0 16px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  
  svg {
    color: var(--text-primary) !important;
  }
  
  &:hover {
    background: var(--bg-surface) !important;
    border-color: var(--primary) !important;
  }
`;

