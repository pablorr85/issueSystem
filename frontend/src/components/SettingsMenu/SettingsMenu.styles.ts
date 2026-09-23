import styled from 'styled-components';
import { Menu, MenuItem, Button, IconButton } from '@mui/material';

export const SettingsButton = styled(IconButton)`
  color: var(--text-primary) !important;
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-card) !important;
  border-radius: 10px !important;
  padding: 8px !important;
  transition: all 0.2s ease !important;

  &:hover {
    background: var(--bg-card) !important;
    border-color: var(--primary) !important;
    transform: rotate(30deg);
  }
`;

export const StyledMenu = styled(Menu)`
  & .MuiPaper-root {
    background: var(--bg-surface) !important;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid var(--border-card) !important;
    border-radius: 16px !important;
    color: var(--text-primary) !important;
    min-width: 240px;
    padding: 8px;
    box-shadow: var(--shadow) !important;
    margin-top: 8px;
  }
`;

export const MenuHeader = styled.div`
  padding: 8px 12px 12px 12px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 8px;
`;

export const UserLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.5px;
`;

export const UsernameText = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 2px;
`;

export const SectionTitle = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 6px 12px 4px 12px;
`;

export const OptionGroup = styled.div`
  display: flex;
  gap: 6px;
  padding: 4px 8px 8px 8px;
`;

export const OptionChip = styled(Button)<{ $active?: boolean }>`
  flex: 1;
  font-family: var(--font-sans) !important;
  text-transform: none !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 6px 10px !important;
  background: ${({ $active }) => ($active ? 'var(--primary)' : 'transparent')} !important;
  color: ${({ $active }) => ($active ? '#ffffff' : 'var(--text-primary)')} !important;
  border: 1px solid ${({ $active }) => ($active ? 'var(--primary)' : 'var(--border-card)')} !important;
  transition: all 0.2s ease !important;

  &:hover {
    background: ${({ $active }) => ($active ? 'var(--primary-hover)' : 'var(--bg-card)')} !important;
    border-color: var(--primary) !important;
  }
`;

export const LogoutMenuItem = styled(MenuItem)`
  margin-top: 8px !important;
  border-top: 1px solid var(--border-subtle) !important;
  padding-top: 10px !important;
  color: #f87171 !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;

  &:hover {
    background: rgba(239, 68, 68, 0.12) !important;
  }
`;
