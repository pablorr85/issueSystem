import styled from "styled-components";
import { Box, Button, IconButton, Select, MenuItem } from "@mui/material";

export const DatePickerWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const DatePickerInputBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 180px;
  height: 40px;
  padding: 0 12px;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    border-color: var(--primary);
    background-color: var(--bg-card);
  }

  svg {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
`;

export const DateInputLabel = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  position: absolute;
  top: -9px;
  left: 10px;
  background: var(--bg-surface);
  padding: 0 4px;
  border-radius: 4px;
`;

export const DateInputValueText = styled.span<{ $hasValue: boolean }>`
  font-size: 0.9rem;
  color: ${(props) => (props.$hasValue ? "var(--text-primary)" : "var(--text-muted)")};
  font-weight: 500;
`;

export const CalendarPopoverBox = styled(Box)`
  width: 340px;
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-card);
  border-radius: 14px;
  box-shadow: var(--shadow);
  color: var(--text-primary);
`;

export const CalendarHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
`;

export const HeaderNavButton = styled(IconButton)`
  color: var(--text-secondary) !important;
  padding: 4px !important;

  &:hover {
    color: var(--text-primary) !important;
    background: var(--bg-card) !important;
  }
`;

export const SelectsContainer = styled(Box)`
  display: flex;
  gap: 6px;
  align-items: center;
`;

export const HeaderSelect = styled(Select)<{ $minWidth?: string }>`
  color: var(--text-primary) !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  height: 32px !important;
  min-width: ${(props) => props.$minWidth || "95px"} !important;

  & .MuiSelect-select {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-right: 28px !important;
    padding-left: 10px !important;
  }

  & .MuiOutlinedInput-notchedOutline {
    border-color: var(--border-subtle) !important;
  }

  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: var(--primary) !important;
  }

  & .MuiSelect-icon {
    color: var(--text-secondary) !important;
    right: 6px !important;
  }
`;

export const HeaderMenuItem = styled(MenuItem)`
  font-size: 0.85rem !important;
  color: var(--text-primary) !important;
`;

export const DaysOfWeekGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
`;

export const DayOfWeekCell = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 4px 0;
`;

export const DaysGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

export const DayCell = styled(Button)<{ $isCurrentMonth: boolean; $isSelected: boolean; $isToday: boolean }>`
  min-width: 0 !important;
  height: 34px !important;
  padding: 0 !important;
  border-radius: 8px !important;
  font-size: 0.82rem !important;
  font-weight: ${(props) => (props.$isSelected || props.$isToday ? "700" : "400")} !important;
  color: ${(props) =>
    props.$isSelected
      ? "#ffffff !important"
      : props.$isCurrentMonth
      ? props.$isToday
        ? "var(--primary, #7c4dff) !important"
        : "var(--text-primary) !important"
      : "var(--text-muted) !important"};
  background-color: ${(props) =>
    props.$isSelected
      ? "var(--primary, #7c4dff) !important"
      : props.$isToday
      ? "rgba(124, 77, 255, 0.15) !important"
      : "transparent !important"};
  border: ${(props) => (props.$isToday && !props.$isSelected ? "1px solid rgba(124, 77, 255, 0.4) !important" : "none")};

  &:hover {
    background-color: ${(props) =>
      props.$isSelected
        ? "var(--primary-hover, #651fff) !important"
        : "var(--bg-card) !important"};
  }
`;

export const CalendarFooter = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--border-subtle);
`;

export const popoverSlotProps = {
  paper: {
    style: {
      background: "transparent",
      boxShadow: "none",
      marginTop: "6px",
    },
  },
};

