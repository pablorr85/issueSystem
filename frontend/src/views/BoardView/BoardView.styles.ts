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

export const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  overflow-x: auto;
  align-items: start;
  padding-bottom: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
`;

export const ColumnContainer = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 550px;
  transition: background-color 0.2s, border-color 0.2s;
`;

export const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const ColumnTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TaskCounter = styled.span`
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--text-secondary, #c5c2d9);
`;

export const CardContainer = styled.div<{ $isDragging?: boolean }>`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: grab;
  user-select: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s, box-shadow 0.2s;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.4 : 1)};
  touch-action: none;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    cursor: grabbing;
  }
`;

export const CardImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
`;

export const CardDesc = styled.p`
  font-size: 0.9rem;
  color: #ffffff;
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
`;

export const CardMetadataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-secondary, #c5c2d9);
`;
