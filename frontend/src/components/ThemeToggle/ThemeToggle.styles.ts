import styled from 'styled-components';

export const ToggleButton = styled.button<{ $mode: 'dark' | 'light' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-card);
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: var(--primary-light);
    color: var(--primary);
    border-color: var(--primary);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1.25rem;
    color: ${({ $mode }) => ($mode === 'dark' ? '#fbbf24' : '#6366f1')};
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(20deg);
  }
`;

export const ToggleLabel = styled.span`
  display: inline-block;
  white-space: nowrap;
`;
