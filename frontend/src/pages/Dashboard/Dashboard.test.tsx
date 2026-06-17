import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardView } from '../../views/DashboardView';
import { getTenantConfig, getIssues, getOperators, assignIssue } from '../../services/api';
import type { TenantConfig, PaginatedResponse, Issue } from '../../services/types';

// Mock Auth Context
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    tenantId: 'f818979b-2ea0-43cb-8dd1-7c1729ee1fea',
    user: 'operator1',
    logout: vi.fn(),
  })
}));

// Mock the API helpers
vi.mock('../../services/api', () => ({
  getTenantConfig: vi.fn(),
  getIssues: vi.fn(),
  getOperators: vi.fn(),
  assignIssue: vi.fn(),
  updateIssueStatus: vi.fn(),
  updateIssue: vi.fn()
}));

const mockTenant: TenantConfig = {
  id: 'f818979b-2ea0-43cb-8dd1-7c1729ee1fea',
  name: 'Wild Park MVP',
  logo_url: null,
  visual_config: { primary_color: '#2e7d32' },
  is_public_reporting_enabled: true,
  default_language: 'es',
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

const mockOperators = [
  { id: 10, username: 'operator1', email: 'op1@example.com', phone_number: '+123' },
  { id: 11, username: 'operator2', email: 'op2@example.com', phone_number: '+456' }
];

const mockIssuesResponse: PaginatedResponse<Issue> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 101,
      tenant_id: 'f818979b-2ea0-43cb-8dd1-7c1729ee1fea',
      status: 'pending',
      description: 'Broken handrail near marine pool',
      extra_data: {
        zona_parque: 'Zona Marina',
        urgencia: 'Media'
      },
      assigned_to: 10,
      assigned_to_name: 'operator1',
      secure_token: '12345678-1234-1234-1234-123456789012',
      created_at: '2026-06-09T12:00:00Z',
      updated_at: '2026-06-09T12:00:00Z'
    }
  ]
};

describe('Dashboard Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTenantConfig).mockResolvedValue(mockTenant);
    vi.mocked(getOperators).mockResolvedValue(mockOperators);
  });

  test('renders header title and dynamically maps custom fields columns', async () => {
    vi.mocked(getIssues).mockResolvedValue(mockIssuesResponse);

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>
    );

    // Wait for the dashboard to finish loading
    await screen.findByText(/Tenant Manager Dashboard/i);

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
    expect(screen.getAllByText('Pending')[0]).toBeInTheDocument(); // Status badge
  });

  test('filters list when status filter selection is changed', async () => {
    vi.mocked(getIssues).mockResolvedValue(mockIssuesResponse);

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>
    );

    // Wait for the dashboard to finish loading
    await screen.findByText(/Tenant Manager Dashboard/i);

    // Wait for initial load call
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

  test('calls assignIssue API and updates UI optimistically on operator assignment change', async () => {
    vi.mocked(getIssues).mockResolvedValue(mockIssuesResponse);
    vi.mocked(assignIssue).mockResolvedValue({
      ...mockIssuesResponse.results[0],
      assigned_to: 11,
      assigned_to_name: 'operator2'
    });

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>
    );

    // Wait for the dashboard to finish loading
    await screen.findByText(/Tenant Manager Dashboard/i);

    await waitFor(() => {
      expect(screen.getByText('Broken handrail near marine pool')).toBeInTheDocument();
    });

    // Find row action select dropdown
    const actionSelect = screen.getByTestId('action-assign-select-101');
    expect(actionSelect).toHaveValue('10');
    
    // Change assigned operator to operator2 (value 11)
    fireEvent.change(actionSelect, { target: { value: '11' } });

    // API callback verification
    expect(assignIssue).toHaveBeenCalledWith(101, 11);

    // UI optimistic status rendering check
    await waitFor(() => {
      expect(actionSelect).toHaveValue('11');
    });
  });

  test('renders Share Public Reporting Form section with copy and download buttons', async () => {
    vi.mocked(getIssues).mockResolvedValue(mockIssuesResponse);

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>
    );

    // Wait for the dashboard to finish loading
    await screen.findByText(/Tenant Manager Dashboard/i);

    // Verify QR section elements are rendered
    expect(screen.getByText(/Share Public Reporting Form/i)).toBeInTheDocument();
    
    const urlInput = screen.getByTestId('qr-url-input') as HTMLInputElement;
    expect(urlInput).toBeInTheDocument();
    expect(urlInput.value).toContain(mockTenant.id);

    expect(screen.getByTestId('copy-qr-link-button')).toBeInTheDocument();
    expect(screen.getByTestId('download-qr-button')).toBeInTheDocument();
  });

  test('opens EditIssueModal on click of issue ID and updates issue description', async () => {
    const { updateIssue } = await import('../../services/api');
    vi.mocked(getIssues).mockResolvedValue(mockIssuesResponse);
    vi.mocked(updateIssue).mockResolvedValue({
      ...mockIssuesResponse.results[0],
      description: 'Updated leaky faucet description'
    });

    render(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>
    );

    // Wait for the dashboard to finish loading
    await screen.findByText(/Tenant Manager Dashboard/i);

    // Wait for initial issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken handrail near marine pool')).toBeInTheDocument();
    });

    // Click on the ID cell to edit the issue
    const idCell = screen.getByTestId('edit-issue-id-101');
    fireEvent.click(idCell);

    // Modal should render
    expect(screen.getByText(/Edit Issue/i)).toBeInTheDocument();

    // Verify description field is prefilled
    const descInput = screen.getByTestId('edit-description-input') as HTMLTextAreaElement;
    expect(descInput.value).toBe('Broken handrail near marine pool');

    // Change description
    fireEvent.change(descInput, { target: { value: 'Updated leaky faucet description' } });

    // Click save changes
    const saveButton = screen.getByTestId('save-edit-btn');
    fireEvent.click(saveButton);

    // Verify API is called with updated details
    await waitFor(() => {
      expect(updateIssue).toHaveBeenCalledWith(101, expect.objectContaining({
        description: 'Updated leaky faucet description'
      }));
    });

    // Verify Dashboard shows updated description
    await waitFor(() => {
      expect(screen.getByText('Updated leaky faucet description')).toBeInTheDocument();
      expect(screen.queryByText('Broken handrail near marine pool')).not.toBeInTheDocument();
    });
  });
});
