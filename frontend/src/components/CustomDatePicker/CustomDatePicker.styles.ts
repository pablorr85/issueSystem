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
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
    background-color: rgba(255, 255, 255, 0.07);
  }

  svg {
    color: #a09cb4;
    font-size: 1.1rem;
  }
`;

export const DateInputLabel = styled.span`
  font-size: 0.75rem;
  color: #a09cb4;
  position: absolute;
  top: -9px;
  left: 10px;
  background: #181528;
  padding: 0 4px;
  border-radius: 4px;
`;

export const DateInputValueText = styled.span<{ $hasValue: boolean }>`
  font-size: 0.9rem;
  color: ${(props) => (props.$hasValue ? "#ffffff" : "#716c89")};
  font-weight: 500;
`;

export const CalendarPopoverBox = styled(Box)`
  width: 340px;
  padding: 16px;
  background: #1e1b30;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  color: white;
`;

export const CalendarHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
`;

export const HeaderNavButton = styled(IconButton)`
  color: #a09cb4 !important;
  padding: 4px !important;

  &:hover {
    color: white !important;
    background: rgba(255, 255, 255, 0.08) !important;
  }
`;

export const SelectsContainer = styled(Box)`
  display: flex;
  gap: 6px;
  align-items: center;
`;

export const HeaderSelect = styled(Select)<{ $minWidth?: string }>`
  color: white !important;
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
    border-color: rgba(255, 255, 255, 0.15) !important;
  }

  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.3) !important;
  }

  & .MuiSelect-icon {
    color: #a09cb4 !important;
    right: 6px !important;
  }
`;

export const HeaderMenuItem = styled(MenuItem)`
  font-size: 0.85rem !important;
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
  color: #a09cb4;
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
        : "#ffffff !important"
      : "#55506a !important"};
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
        : "rgba(255, 255, 255, 0.1) !important"};
  }
`;

export const CalendarFooter = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
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
