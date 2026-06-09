import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { getIssues, updateIssueStatus } from '../../services/api';
import type { TenantConfig, PaginatedResponse, Issue } from '../../services/types';

// Mock the API helpers
vi.mock('../../services/api', () => ({
  getIssues: vi.fn(),
  updateIssueStatus: vi.fn()
}));

const mockTenant: TenantConfig = {
  id: 'f818979b-2ea0-43cb-8dd1-7c1729ee1fea',
  name: 'Wild Park MVP',
  logo_url: null,
  visual_config: { primary_color: '#2e7d32' },
  custom_fields: [
    {
      name: 'zona_parque',
      field_type: 'select',
      required: true,
      options: ['Restaurante', 'Zona Marina']
    },
    {
      name: 'urgencia',
      field_type: 'select',
      required: true,
      options: ['Baja', 'Media', 'CRÍTICA']
    }
  ]
};

const mockIssuesResponse: PaginatedResponse<Issue> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 101,
      tenant_id: 'f818979b-2ea0-43cb-8dd1-7c1729ee1fea',
      status: 'open',
      description: 'Broken handrail near marine pool',
      extra_data: {
        zona_parque: 'Zona Marina',
        urgencia: 'Media'
      },
      created_at: '2026-06-09T12:00:00Z',
      updated_at: '2026-06-09T12:00:00Z'
    }
  ]
};

describe('Dashboard Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders header title and dynamically maps custom fields columns', async () => {
    vi.mocked(getIssues).mockResolvedValue(mockIssuesResponse);

    render(<Dashboard tenant={mockTenant} />);

    // Check title renders
    expect(screen.getByText(/Tenant Manager Dashboard/i)).toBeInTheDocument();

    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken handrail near marine pool')).toBeInTheDocument();
    });

    // Verify dynamic columns header headers are generated correctly (underscores replaced by spaces)
    expect(screen.getByText('zona parque')).toBeInTheDocument();
    expect(screen.getByText('urgencia')).toBeInTheDocument();

    // Verify flattened extra_data values render in cells
    expect(screen.getByText('Zona Marina')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();

    // Standard fields verify
    expect(screen.getByText('101')).toBeInTheDocument(); // ID cell
    expect(screen.getByText('open')).toBeInTheDocument(); // Status badge
  });

  test('filters list when status filter selection is changed', async () => {
    vi.mocked(getIssues).mockResolvedValue(mockIssuesResponse);

    render(<Dashboard tenant={mockTenant} />);

    // Wait for initial load
    await waitFor(() => {
      expect(getIssues).toHaveBeenCalledWith(mockTenant.id, undefined, 1);
    });

    // Query status select filter
    const statusSelect = screen.getByTestId('dashboard-status-filter');
    
    // Trigger filter change to 'resolved'
    fireEvent.change(statusSelect, { target: { value: 'resolved' } });

    await waitFor(() => {
      // Should reset page to 1 and query with resolved filter
      expect(getIssues).toHaveBeenLastCalledWith(mockTenant.id, 'resolved', 1);
    });
  });

  test('calls updateIssueStatus API and updates UI optimistically on status change', async () => {
    vi.mocked(getIssues).mockResolvedValue(mockIssuesResponse);
    vi.mocked(updateIssueStatus).mockResolvedValue({
      ...mockIssuesResponse.results[0],
      status: 'in_progress'
    });

    render(<Dashboard tenant={mockTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Broken handrail near marine pool')).toBeInTheDocument();
    });

    // Find row action select dropdown
    const actionSelect = screen.getByTestId('action-status-select-101');
    
    // Change value from 'open' to 'in_progress'
    fireEvent.change(actionSelect, { target: { value: 'in_progress' } });

    // API callback verification
    expect(updateIssueStatus).toHaveBeenCalledWith(101, 'in_progress');

    // UI optimistic status rendering check
    await waitFor(() => {
      expect(screen.getByText('in progress')).toBeInTheDocument();
    });
  });
});
