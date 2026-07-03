import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const NavContainer = styled.nav`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.02);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
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
  color: ${({ $active }) => ($active ? '#ffffff' : 'var(--text-secondary, #c5c2d9)')} !important;
  border: 1px solid ${({ $active }) => ($active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)')};

  &:hover {
    background: ${({ $active }) => ($active ? 'var(--primary-hover)' : 'rgba(255, 255, 255, 0.06)')};
    color: #ffffff !important;
  }
`;
