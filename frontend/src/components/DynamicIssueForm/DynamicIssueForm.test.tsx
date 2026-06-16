import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DynamicIssueForm } from './DynamicIssueForm';
import type { TenantConfig } from '../../services/types';

const mockTenant: TenantConfig = {
  id: 'f818979b-2ea0-43cb-8dd1-7c1729ee1fea',
  name: 'Zoo de Madrid',
  logo_url: null,
  visual_config: { primary_color: '#4CAF50' },
  is_public_reporting_enabled: true,
  default_language: 'es',
  custom_fields: [
    {
      name: 'Zone',
      field_type: 'text',
      required: true,
      options: []
    },
    {
      name: 'Cage Number',
      field_type: 'number',
      required: false,
      options: []
    },
    {
      name: 'Urgent',
      field_type: 'boolean',
      required: false,
      options: []
    },
    {
      name: 'Category',
      field_type: 'select',
      required: true,
      options: ['Cleaning', 'Maintenance', 'Security']
    }
  ]
};

describe('DynamicIssueForm Component', () => {
  test('renders standard fields and dynamic custom fields', () => {
    render(
      <DynamicIssueForm
        tenant={mockTenant}
        onSubmit={async () => {}}
        submitting={false}
      />
    );

    // Standard fields
    expect(screen.getByLabelText(/Problem Description \*/i)).toBeInTheDocument();
    expect(screen.getByTestId('upload-zone')).toBeInTheDocument();

    // Dynamic fields
    expect(screen.getByLabelText(/Zone \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cage Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Urgent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category \*/i)).toBeInTheDocument();
  });

  test('validates required fields on submit', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue({});
    render(
      <DynamicIssueForm
        tenant={mockTenant}
        onSubmit={mockOnSubmit}
        submitting={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Submit Issue/i });
    fireEvent.click(submitButton);

    // Should show validation errors and not call onSubmit
    expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Zone is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Category is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('calls onSubmit with processed payload on successful validation', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue({});
    render(
      <DynamicIssueForm
        tenant={mockTenant}
        onSubmit={mockOnSubmit}
        submitting={false}
      />
    );

    // Fill in standard fields
    fireEvent.change(screen.getByLabelText(/Problem Description \*/i), {
      target: { value: 'Water leak in bear enclosure' }
    });

    // Fill in custom text field
    fireEvent.change(screen.getByLabelText(/Zone \*/i), {
      target: { value: 'North Sector' }
    });

    // Fill in custom number field
    fireEvent.change(screen.getByLabelText(/Cage Number/i), {
      target: { value: '42' }
    });

    // Toggle boolean field
    fireEvent.click(screen.getByLabelText(/Urgent/i));

    const categorySelect = screen.getByTestId('select-Category');
    fireEvent.change(categorySelect, { target: { value: 'Maintenance' } });

    const submitButton = screen.getByRole('button', { name: /Submit Issue/i });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      tenant_id: 'f818979b-2ea0-43cb-8dd1-7c1729ee1fea',
      description: 'Water leak in bear enclosure',
      image: null,
      extra_data: {
        'Zone': 'North Sector',
        'Cage Number': 42,
        'Urgent': true,
        'Category': 'Maintenance'
      }
    });
  });

  test('allows selecting and removing a file', async () => {
    // Mock URL methods
    const createObjectURLMock = vi.fn().mockReturnValue('mock-object-url');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    render(
      <DynamicIssueForm
        tenant={mockTenant}
        onSubmit={async () => {}}
        submitting={false}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Preview container should appear
    expect(screen.getByTestId('preview-container')).toBeInTheDocument();
    expect(screen.getByAltText('Selected preview')).toHaveAttribute('src', 'mock-object-url');

    // Remove file
    const removeButton = screen.getByTestId('remove-image-button');
    fireEvent.click(removeButton);

    // Upload zone should appear back
    expect(screen.getByTestId('upload-zone')).toBeInTheDocument();
  });
});
