import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  background: var(--bg-card);
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-card);
  box-shadow: var(--shadow);
`;

export const NavLinksGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export interface NavLinkProps {
  $active?: boolean;
}

export const NavLinkButton = styled(Link)<NavLinkProps>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? 'var(--primary)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#ffffff' : 'var(--text-secondary)')} !important;
  border: 1px solid ${({ $active }) => ($active ? 'var(--primary)' : 'transparent')};

  &:hover {
    background: ${({ $active }) => ($active ? 'var(--primary-hover)' : 'var(--bg-surface)')};
    color: var(--text-primary) !important;
  }
`;
