import styled from 'styled-components';
import { Card, Table, TableHead, TableBody, TableRow, TableCell, Typography, Select, Button, FormControl } from '@mui/material';

export const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  margin-top: 24px;
`;

export const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 16px;
`;

export const DashboardTitle = styled(Typography)`
  font-weight: 700 !important;
  color: white !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;

  svg {
    color: var(--primary) !important;
  }
`;

export const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

export const StyledFormControl = styled(FormControl)`
  min-width: 170px !important;

  & .MuiInputLabel-root {
    color: #a09cb4 !important;
    &.Mui-focused {
      color: var(--primary) !important;
    }
  }

  & .MuiOutlinedInput-root {
    color: white !important;
    background-color: rgba(255, 255, 255, 0.03);
    height: 40px !important;
    
    & fieldset {
      border-color: rgba(255, 255, 255, 0.08) !important;
    }
    
    &:hover fieldset {
      border-color: rgba(255, 255, 255, 0.2) !important;
    }
    
    &.Mui-focused fieldset {
      border-color: var(--primary) !important;
    }
  }

  & .MuiSelect-icon {
    color: #a09cb4 !important;
  }
`;

export const DashboardCard = styled(Card)`
  padding: 0px;
  background: rgba(255, 255, 255, 0.02) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 16px !important;
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.3) !important;
  overflow: hidden !important;
`;

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const StyledTable = styled(Table)`
  min-width: 650px;
`;

export const StyledTableHead = styled(TableHead)`
  background: rgba(255, 255, 255, 0.02);
`;

export const StyledTableBody = styled(TableBody)``;

export const StyledTableHeadCell = styled(TableCell)`
  color: #a09cb4 !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  padding: 16px !important;
`;

export const StyledTableRow = styled(TableRow)<{ $isCritical?: boolean }>`
  background: ${({ $isCritical }) => $isCritical ? 'rgba(239, 83, 80, 0.08) !important' : 'transparent'};
  transition: background 0.2s ease-in-out;
  
  & td {
    background: ${({ $isCritical }) => $isCritical ? 'rgba(239, 83, 80, 0.08) !important' : 'transparent'};
  }
  
  &:hover {
    background: ${({ $isCritical }) => $isCritical ? 'rgba(239, 83, 80, 0.14) !important' : 'rgba(255, 255, 255, 0.02) !important'};
    & td {
      background: ${({ $isCritical }) => $isCritical ? 'rgba(239, 83, 80, 0.14) !important' : 'rgba(255, 255, 255, 0.02) !important'};
    }
  }
`;

export const StyledTableCell = styled(TableCell)`
  color: #e2e1e9 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
  padding: 14px 16px !important;
  font-size: 0.95rem !important;
`;

export const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  box-sizing: border-box;
  
  ${({ $status }) => {
    switch ($status) {
      case 'resolved':
        return 'background-color: rgba(46, 125, 50, 0.15); color: #81c784; border: 1px solid rgba(76, 175, 80, 0.3);';
      case 'in_progress':
        return 'background-color: rgba(255, 179, 0, 0.15); color: #ffd54f; border: 1px solid rgba(255, 179, 0, 0.3);';
      case 'open':
      default:
        return 'background-color: rgba(0, 229, 255, 0.12); color: #33eaff; border: 1px solid rgba(0, 229, 255, 0.3);';
    }
  }}
`;

export const UrgencyPill = styled.span<{ $level: string }>`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
  box-sizing: border-box;

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

export const TableSelect = styled(Select)`
  color: white !important;
  font-size: 0.85rem !important;
  background-color: rgba(255, 255, 255, 0.03) !important;
  height: 32px !important;
  border-radius: 6px !important;
  
  & fieldset {
    border-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  &:hover fieldset {
    border-color: rgba(255, 255, 255, 0.2) !important;
  }
  
  &.Mui-focused fieldset {
    border-color: var(--primary) !important;
  }
  
  & .MuiSelect-select {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    display: flex;
    align-items: center;
  }

  & .MuiSelect-icon {
    color: #a09cb4 !important;
  }
`;

export const PaginationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.01);
`;

export const PaginationInfo = styled(Typography)`
  color: #a09cb4 !important;
  font-size: 0.9rem !important;
`;

export const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const PaginationButton = styled(Button)`
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  text-transform: none !important;
  font-weight: 600 !important;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
  }
  
  &:disabled {
    color: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.04) !important;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #a09cb4;
  gap: 12px;
`;

export const ExtraDataList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
`;

export const ExtraDataItem = styled.div`
  display: flex;
  gap: 6px;
  
  span.label {
    color: #a09cb4;
    font-weight: 500;
  }
  
  span.value {
    color: #fff;
  }
`;

export const ReportButton = styled(Button)`
  background: var(--primary) !important;
  color: white !important;
  text-transform: none !important;
  font-weight: 600 !important;
  height: 40px !important;
  border-radius: 8px !important;
  padding: 0 16px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  
  &:hover {
    background: var(--primary-hover) !important;
  }
`;

export const FilterSelect = styled(Select)`
  color: white !important;
  
  & .MuiSelect-select {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-right: 36px !important;
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
  }
`;

export const DragHandleContainer = styled.div`
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b6780;

  svg {
    font-size: 1.2rem;
  }
`;

export const IdCellSpan = styled.span`
  cursor: pointer;
  font-weight: bold;
  color: var(--primary);
`;

export const DescriptionCellSpan = styled.span`
  cursor: pointer;
  display: block;
  width: 100%;
`;

export const HubLinkContainer = styled.div`
  margin-top: 6px;
`;

export const HubLink = styled.a`
  font-size: 0.75rem;
  color: var(--primary);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;

  svg {
    font-size: 0.85rem;
  }
`;

