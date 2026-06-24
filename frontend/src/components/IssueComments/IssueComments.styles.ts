import styled from 'styled-components';
import { Button } from '@mui/material';

export const CommentsSection = styled.div`
  margin-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

export const CommentsHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CommentsTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #a09cb4;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

export const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 240px;
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

export const CommentBubble = styled.div<{ $isSystem?: boolean }>`
  background: ${({ $isSystem }) => $isSystem ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${({ $isSystem }) => $isSystem ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)'};
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.9rem;
  align-self: flex-start;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  ${({ $isSystem }) => $isSystem && `
    border-left: 3px solid #ff9800 !important;
    font-style: italic;
    color: #a09cb4;
  `}
`;

export const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.75rem;
`;

export const CommentAuthor = styled.span<{ $role?: string }>`
  font-weight: 700;
  color: ${({ $role }) => {
    switch ($role) {
      case 'manager':
        return 'var(--primary)';
      case 'operator':
        return '#81c784';
      case 'system':
      default:
        return '#ffb74d';
    }
  }};
`;

export const CommentTime = styled.span`
  color: #6b6780;
`;

export const CommentText = styled.div`
  color: #e2e1e9;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const CommentInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  width: 100%;
`;

export const QuickActionButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

export const QuickBlockButton = styled(Button)`
  font-size: 0.75rem !important;
  text-transform: none !important;
  border-color: rgba(255, 152, 0, 0.4) !important;
  color: #ffb74d !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  padding: 4px 10px !important;
  
  &:hover {
    background: rgba(255, 152, 0, 0.08) !important;
    border-color: #ffb74d !important;
  }

  &:disabled {
    color: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.05) !important;
  }
`;

export const CommentInputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  width: 100%;
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
  height: 40px;
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

export const CommentSubmitButton = styled(Button)`
  height: 40px !important;
  min-width: 40px !important;
  width: 40px !important;
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

export const EmptyCommentsState = styled.div`
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
