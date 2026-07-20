import React, { useState, useEffect, useMemo } from 'react';
import { Popover, MenuItem, Select, Button } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';
import {
  DatePickerInputBox,
  DateInputLabel,
  DateInputValueText,
  CalendarPopoverBox,
  CalendarHeader,
  HeaderNavButton,
  SelectsContainer,
  DaysOfWeekGrid,
  DayOfWeekCell,
  DaysGrid,
  DayCell,
  CalendarFooter,
} from './CustomDatePicker.styles';

export interface CustomDatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  testId?: string;
}

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const DEFAULT_MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_OF_WEEK = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  testId = 'custom-date-picker',
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Parse current selected date
  const selectedDate = useMemo(() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [value]);

  const today = useMemo(() => new Date(), []);

  // View state for month/year navigation inside popover
  const [viewYear, setViewYear] = useState<number>(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate ? selectedDate.getMonth() : today.getMonth());

  // Sync view when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  const handleOpenPopover = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const isOpen = Boolean(anchorEl);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Generate 42 cells (6 weeks) for calendar grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    // Day of week of 1st day (0 = Sun, 1 = Mon ... 6 = Sat)
    let startDayOfWeek = firstDayOfMonth.getDay();
    // Adjust to Monday = 0
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const daysCount = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDay - i,
        month: viewMonth - 1,
        year: viewMonth === 0 ? viewYear - 1 : viewYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysCount; i++) {
      days.push({
        dayNumber: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        month: viewMonth + 1,
        year: viewMonth === 11 ? viewYear + 1 : viewYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handleSelectDay = (dayObj: { dayNumber: number; month: number; year: number }) => {
    const yStr = String(dayObj.year);
    const mStr = String(dayObj.month + 1).padStart(2, '0');
    const dStr = String(dayObj.dayNumber).padStart(2, '0');
    const formatted = `${yStr}-${mStr}-${dStr}`;
    onChange(formatted);
    handleClosePopover();
  };

  const handleSelectToday = () => {
    const yStr = String(today.getFullYear());
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    onChange(`${yStr}-${mStr}-${dStr}`);
    handleClosePopover();
  };

  const handleClear = () => {
    onChange('');
    handleClosePopover();
  };

  // Format display text on input button
  const displayFormattedText = useMemo(() => {
    if (!selectedDate) return '';
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const y = selectedDate.getFullYear();
    return `${d}/${m}/${y}`;
  }, [selectedDate]);

  // Year choices (2015 to 2035)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = 2015; y <= 2035; y++) years.push(y);
    return years;
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <DatePickerInputBox onClick={handleOpenPopover} data-testid={testId}>
        <DateInputLabel>{label}</DateInputLabel>
        <DateInputValueText $hasValue={!!value}>
          {displayFormattedText || 'dd/mm/aaaa'}
        </DateInputValueText>
        <CalendarTodayIcon />
      </DatePickerInputBox>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            style: {
              background: 'transparent',
              boxShadow: 'none',
              marginTop: '6px',
            },
          },
        }}
      >
        <CalendarPopoverBox>
          <CalendarHeader>
            <HeaderNavButton onClick={handlePrevMonth} size="small">
              <ChevronLeftIcon />
            </HeaderNavButton>

            <SelectsContainer>
              {/* Month Select */}
              <Select
                size="small"
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                sx={{
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  height: '32px',
                  minWidth: '135px',
                  '& .MuiSelect-select': { py: 0, pr: '28px !important', pl: '10px !important' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '& .MuiSelect-icon': { color: '#a09cb4', right: '6px' }
                }}
              >
                {DEFAULT_MONTH_NAMES_ES.map((name, idx) => (
                  <MenuItem key={idx} value={idx} style={{ fontSize: '0.85rem' }}>
                    {t(`months.${MONTH_KEYS[idx]}`, name)}
                  </MenuItem>
                ))}
              </Select>

              {/* Year Select */}
              <Select
                size="small"
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                sx={{
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  height: '32px',
                  minWidth: '95px',
                  '& .MuiSelect-select': { py: 0, pr: '28px !important', pl: '10px !important' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '& .MuiSelect-icon': { color: '#a09cb4', right: '6px' }
                }}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y} style={{ fontSize: '0.85rem' }}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </SelectsContainer>

            <HeaderNavButton onClick={handleNextMonth} size="small">
              <ChevronRightIcon />
            </HeaderNavButton>
          </CalendarHeader>

          {/* Days of Week Header */}
          <DaysOfWeekGrid>
            {DAYS_OF_WEEK.map((d, i) => (
              <DayOfWeekCell key={i}>{d}</DayOfWeekCell>
            ))}
          </DaysOfWeekGrid>

          {/* Days Grid */}
          <DaysGrid>
            {calendarDays.map((dayObj, idx) => {
              const isSelected =
                !!selectedDate &&
                selectedDate.getFullYear() === dayObj.year &&
                selectedDate.getMonth() === dayObj.month &&
                selectedDate.getDate() === dayObj.dayNumber;

              const isToday =
                today.getFullYear() === dayObj.year &&
                today.getMonth() === dayObj.month &&
                today.getDate() === dayObj.dayNumber;

              return (
                <DayCell
                  key={idx}
                  $isCurrentMonth={dayObj.isCurrentMonth}
                  $isSelected={isSelected}
                  $isToday={isToday}
                  onClick={() => handleSelectDay(dayObj)}
                >
                  {dayObj.dayNumber}
                </DayCell>
              );
            })}
          </DaysGrid>

          {/* Calendar Footer */}
          <CalendarFooter>
            <Button
              size="small"
              onClick={handleClear}
              startIcon={<ClearIcon fontSize="small" />}
              sx={{ color: '#a09cb4', fontSize: '0.75rem', textTransform: 'none' }}
            >
              {t('common.clear', 'Limpiar')}
            </Button>
            <Button
              size="small"
              onClick={handleSelectToday}
              sx={{ color: 'var(--primary, #7c4dff)', fontSize: '0.75rem', textTransform: 'none', fontWeight: 600 }}
            >
              {t('common.today', 'Hoy')}
            </Button>
          </CalendarFooter>
        </CalendarPopoverBox>
      </Popover>
    </div>
  );
};
