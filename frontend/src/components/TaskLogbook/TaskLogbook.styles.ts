import styled from 'styled-components';
import { Button } from '@mui/material';

export const LogbookSection = styled.div`
  margin-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

export const LogbookHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const LogbookTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #a09cb4;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

export const LogbookList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 6px;
  box-sizing: border-box;

  /* Scrollbar styles */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const LogBubble = styled.div<{ $isSystem?: boolean; $hasMetrics?: boolean }>`
  background: ${({ $isSystem }) => $isSystem ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${({ $hasMetrics }) => $hasMetrics ? 'rgba(129, 199, 132, 0.25)' : 'rgba(255, 255, 255, 0.06)'};
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.9rem;
  align-self: flex-start;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
`;

export const LogAuthor = styled.span<{ $role?: string }>`
  font-weight: 700;
  color: ${({ $role }) => {
    switch ($role) {
      case 'manager':
        return 'var(--primary)';
      case 'operator':
        return '#81c784';
      default:
        return '#ffb74d';
    }
  }};
`;

export const LogTime = styled.span`
  color: #6b6780;
`;

export const LogBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const LogText = styled.div`
  color: #e2e1e9;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const LogAttachment = styled.img`
  max-width: 120px;
  max-height: 120px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: opacity 0.2s, transform 0.2s;

  &:hover {
    opacity: 0.8;
    transform: scale(1.02);
  }
`;

export const LogMetricsContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MetricPill = styled.span<{ $type: 'cost' | 'time' }>`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  ${({ $type }) => $type === 'cost' && `
    background: rgba(129, 199, 132, 0.15);
    color: #81c784;
    border: 1px solid rgba(129, 199, 132, 0.3);
  `}

  ${({ $type }) => $type === 'time' && `
    background: rgba(100, 181, 246, 0.15);
    color: #64b5f6;
    border: 1px solid rgba(100, 181, 246, 0.3);
  `}
`;

export const LogInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  width: 100%;
`;

export const LogInputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
`;

export const MetricsInputRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  background: rgba(255, 255, 255, 0.01);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
`;

export const MetricFieldWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #a09cb4;
`;

export const StyledMetricInput = styled.input`
  width: 90px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 4px 8px;
  color: white;
  font-family: inherit;
  font-size: 0.85rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const StyledTextArea = styled.textarea`
  flex: 1;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
  color: white;
  font-family: inherit;
  font-size: 0.9rem;
  resize: none;
  height: 44px;
  box-sizing: border-box;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.04);
  }

  &:disabled {
    opacity: 0.5;
  }
`;

export const LogSubmitButton = styled(Button)`
  height: 44px !important;
  min-width: 44px !important;
  width: 44px !important;
  border-radius: 10px !important;
  background: var(--primary) !important;
  color: white !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  
  &:hover {
    background: var(--primary-hover) !important;
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.04) !important;
    color: rgba(255, 255, 255, 0.2) !important;
  }
`;

export const EmptyLogbookState = styled.div`
  padding: 24px 0;
  text-align: center;
  color: #6b6780;
  font-size: 0.85rem;
  font-style: italic;
`;

export const ErrorMessage = styled.div`
  color: #ef5350;
  font-size: 0.85rem;
`;

export const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: zoom-out;
`;

export const LightboxImage = styled.img`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

export const LightboxCloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 2.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  line-height: 1;

  &:hover {
    color: #ef5350;
  }
`;
