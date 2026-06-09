import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenantForm } from './TenantForm';

describe('TenantForm Component', () => {
  test('renders heading and form elements', () => {
    render(<TenantForm onSubmit={() => {}} loading={false} error={null} />);
    
    expect(screen.getByRole('heading', { name: /Load Tenant Configuration/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Tenant UUID/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Load/i })).toBeInTheDocument();
  });

  test('button is disabled when input is empty', () => {
    render(<TenantForm onSubmit={() => {}} loading={false} error={null} />);
    
    const button = screen.getByRole('button', { name: /Load/i });
    expect(button).toBeDisabled();
  });

  test('calls onSubmit with entered UUID on submit', () => {
    const mockOnSubmit = vi.fn();
    render(<TenantForm onSubmit={mockOnSubmit} loading={false} error={null} />);
    
    const input = screen.getByLabelText(/Tenant UUID/i);
    const button = screen.getByRole('button', { name: /Load/i });
    
    fireEvent.change(input, { target: { value: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' } });
    expect(button).toBeEnabled();
    
    fireEvent.click(button);
    expect(mockOnSubmit).toHaveBeenCalledWith('f47ac10b-58cc-4372-a567-0e02b2c3d479');
  });

  test('displays loading text and disables elements when loading', () => {
    render(<TenantForm onSubmit={() => {}} loading={true} error={null} />);
    
    expect(screen.getByRole('button', { name: /Loading.../i })).toBeDisabled();
    expect(screen.getByLabelText(/Tenant UUID/i)).toBeDisabled();
  });

  test('displays error message when error is provided', () => {
    render(<TenantForm onSubmit={() => {}} loading={false} error="Tenant not found" />);
    
    expect(screen.getByText(/Tenant not found/i)).toBeInTheDocument();
  });
});
