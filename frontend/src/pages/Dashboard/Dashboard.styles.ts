import styled from "styled-components";
import {
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Select,
  Button,
  FormControl,
  Box,
} from "@mui/material";

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
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

export const FilterRowPrimary = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const FilterRowSecondary = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

export const ExportExcelButton = styled(Button)`
  background-color: #2e7d32 !important;
  font-weight: 600 !important;
  height: 40px !important;
  border-radius: 8px !important;
  text-transform: none !important;
  padding-left: 20px !important;
  padding-right: 20px !important;

  &:hover {
    background-color: #1b5e20 !important;
  }
`;

export const ClearDatesButton = styled(Button)`
  color: #a09cb4 !important;
  text-transform: none !important;
  font-size: 0.8rem !important;
`;

export const StyledFormControl = styled(FormControl)`
  min-width: 220px !important;

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
  overflow: visible !important;
`;

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const StyledTable = styled(Table)`
  width: 100%;
  table-layout: auto;
`;

export const StyledTableHead = styled(TableHead)`
  background: rgba(255, 255, 255, 0.02);
`;

export const StyledTableBody = styled(TableBody)``;

export const StyledTableHeadCell = styled(TableCell)`
  color: #a09cb4 !important;
  font-weight: 600 !important;
  font-size: 0.8rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
  padding: 10px 12px !important;
  white-space: nowrap;
`;

export const StyledTableRow = styled(TableRow)<{ $isCritical?: boolean }>`
  background: ${({ $isCritical }) =>
    $isCritical ? "rgba(239, 83, 80, 0.08) !important" : "transparent"};
  transition: background 0.2s ease-in-out;

  & td {
    background: ${({ $isCritical }) =>
      $isCritical ? "rgba(239, 83, 80, 0.08) !important" : "transparent"};
  }

  &:hover {
    background: ${({ $isCritical }) =>
      $isCritical
        ? "rgba(239, 83, 80, 0.14) !important"
        : "rgba(255, 255, 255, 0.02) !important"};
    & td {
      background: ${({ $isCritical }) =>
        $isCritical
          ? "rgba(239, 83, 80, 0.14) !important"
          : "rgba(255, 255, 255, 0.02) !important"};
    }
  }
`;

export const StyledTableCell = styled(TableCell)`
  color: #e2e1e9 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
  padding: 8px 12px !important;
  font-size: 0.85rem !important;
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
      case "resolved":
        return "background-color: rgba(46, 125, 50, 0.22); color: #81c784; border: 1px solid rgba(76, 175, 80, 0.45);";
      case "wont_fix":
        return "background-color: rgba(120, 144, 156, 0.22); color: #b0bec5; border: 1px solid rgba(120, 144, 156, 0.45);";
      case "in_progress":
        return "background-color: rgba(33, 150, 243, 0.20); color: #2196f3; border: 1px solid rgba(33, 150, 243, 0.45);";
      case "blocked":
        return "background-color: rgba(239, 108, 0, 0.22); color: #ff9800; border: 1px solid rgba(239, 108, 0, 0.45);";
      case "pending":
      case "open":
      default:
        return "background-color: rgba(255, 179, 0, 0.22); color: #ffd54f; border: 1px solid rgba(255, 179, 0, 0.45);";
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
      case "critical":
        return `
          background: rgba(244, 67, 54, 0.22);
          color: #ef5350;
          border: 1px solid rgba(244, 67, 54, 0.45);
          animation: pulse 2s infinite;
        `;
      case "high":
        return `
          background: rgba(255, 152, 0, 0.22);
          color: #ffb74d;
          border: 1px solid rgba(255, 152, 0, 0.45);
        `;
      case "medium":
        return `
          background: rgba(33, 150, 243, 0.20);
          color: #64b5f6;
          border: 1px solid rgba(33, 150, 243, 0.45);
        `;
      case "low":
        return `
          background: rgba(76, 175, 80, 0.22);
          color: #81c784;
          border: 1px solid rgba(76, 175, 80, 0.45);
        `;
      default:
        return `
          background: rgba(255, 255, 255, 0.12);
          color: #e0e0e0;
          border: 1px solid rgba(255, 255, 255, 0.25);
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

  &.Mui-disabled {
    background-color: rgba(255, 255, 255, 0.02) !important;

    & .MuiSelect-select {
      color: rgba(255, 255, 255, 0.75) !important;
      -webkit-text-fill-color: rgba(255, 255, 255, 0.75) !important;
    }

    & fieldset {
      border-color: rgba(255, 255, 255, 0.08) !important;
    }

    & .MuiSelect-icon {
      color: rgba(255, 255, 255, 0.15) !important;
    }
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

export const FloatingBarContainer = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 800px;
  background: rgba(30, 27, 43, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(103, 58, 183, 0.35);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  padding: 16px 24px;
  z-index: 1100;
  animation: fadeInUp 0.3s ease-out forwards;
  box-sizing: border-box;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;

export const FloatingBarContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FloatingBarText = styled.div`
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FloatingBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    justify-content: flex-end;
  }
`;

export const FloatingBarButton = styled.button<{
  $variant?: "primary" | "secondary";
}>`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  ${({ $variant }) =>
    $variant === "secondary"
      ? `
        background: transparent;
        color: #b0bec5;
        border: 1px solid rgba(255, 255, 255, 0.2);
        &:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
      `
      : `
        background: var(--primary);
        color: #fff;
        border: none;
        box-shadow: 0 4px 10px rgba(103, 58, 183, 0.3);
        &:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(103, 58, 183, 0.4);
        }
        &:active {
          transform: translateY(0);
        }
        &:disabled {
          background: rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.3);
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
        }
      `}
`;

export const StyledCheckbox = styled.input`
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:hover {
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.1);
  }

  &:checked {
    background: var(--primary);
    border-color: var(--primary);
  }

  &:checked::after {
    content: "";
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  &:indeterminate {
    background: var(--primary);
    border-color: var(--primary);
  }

  &:indeterminate::after {
    content: "";
    position: absolute;
    left: 4px;
    top: 7px;
    width: 8px;
    height: 2px;
    background: #fff;
  }

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

export const CheckboxCellContainer = styled.div`
  display: flex;
  align-items: center;
`;
