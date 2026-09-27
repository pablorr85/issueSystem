

import styled from 'styled-components';

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
  background: var(--bg-card);
  border: 1px solid var(--border-card);
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
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TaskCounter = styled.span`
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--text-secondary);
`;

export const CardContainer = styled.div<{ $isDragging?: boolean }>`
  background: var(--bg-surface);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: grab;
  user-select: none;
  box-shadow: var(--shadow);
  transition: border-color 0.2s, box-shadow 0.2s;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.4 : 1)};
  touch-action: none;

  &:hover {
    border-color: var(--primary);
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
  color: var(--text-primary);
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
`;

export const CardMetadataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
`;
