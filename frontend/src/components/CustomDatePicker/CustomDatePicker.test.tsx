import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CustomDatePicker } from './CustomDatePicker';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

describe('CustomDatePicker Component', () => {
  it('renders input box with label and formatted date when value is provided', () => {
    render(
      <CustomDatePicker
        label="Fecha Desde"
        value="2026-07-20"
        onChange={vi.fn()}
        testId="test-date-picker"
      />
    );

    expect(screen.getByText('Fecha Desde')).toBeInTheDocument();
    expect(screen.getByText('20/07/2026')).toBeInTheDocument();
  });

  it('renders placeholder dd/mm/aaaa when value is empty', () => {
    render(
      <CustomDatePicker
        label="Fecha Hasta"
        value=""
        onChange={vi.fn()}
        testId="test-date-picker"
      />
    );

    expect(screen.getByText('dd/mm/aaaa')).toBeInTheDocument();
  });

  it('opens popover calendar on click and selects a day', () => {
    const handleChange = vi.fn();
    render(
      <CustomDatePicker
        label="Fecha Desde"
        value="2026-07-15"
        onChange={handleChange}
        testId="test-date-picker"
      />
    );

    const inputBox = screen.getByTestId('test-date-picker');
    fireEvent.click(inputBox);

    // Day 20 should be visible in grid
    const day20 = screen.getByRole('button', { name: '20' });
    expect(day20).toBeInTheDocument();

    fireEvent.click(day20);
    expect(handleChange).toHaveBeenCalledWith('2026-07-20');
  });

  it('triggers clear callback on Limpiar button click', () => {
    const handleChange = vi.fn();
    render(
      <CustomDatePicker
        label="Fecha Desde"
        value="2026-07-15"
        onChange={handleChange}
        testId="test-date-picker"
      />
    );

    fireEvent.click(screen.getByTestId('test-date-picker'));

    const clearBtn = screen.getByRole('button', { name: /Limpiar/i });
    fireEvent.click(clearBtn);

    expect(handleChange).toHaveBeenCalledWith('');
  });
});
