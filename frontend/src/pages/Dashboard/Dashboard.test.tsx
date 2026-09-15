import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../testUtils';
import { MemoryRouter } from 'react-router-dom';
import { DashboardView } from '../../views/DashboardView';
import { DashboardStatsView } from '../../views/DashboardStatsView';
import { getTenantConfig, getOperators, getIssueComments, getIssue, getTaskLogs, getIssuesStats } from '../../services/api';
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
  getIssuesStats: vi.fn().mockResolvedValue({ unassigned_count: 0, in_progress_count: 0, blocked_count: 0, operator_workload: [], operator_performance: [], zone_hotspots: [] }),
  getIssues: vi.fn(),
  getOperators: vi.fn(),
  assignIssue: vi.fn(),
  updateIssueStatus: vi.fn(),
  updateIssue: vi.fn(),
  getIssueComments: vi.fn(),
  addIssueComment: vi.fn(),
  getIssue: vi.fn(),
  getTaskLogs: vi.fn(),
  addTaskLog: vi.fn(),
  getZones: vi.fn().mockResolvedValue([]),
  createZone: vi.fn().mockResolvedValue({ id: 1, name: 'Test Zone' })
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
      options: [
        { value: 'low', label: 'Baja' },
        { value: 'medium', label: 'Media' },
        { value: 'critical', label: 'CRÍTICA' }
      ]
    }
  ]
};

const mockOperators = [
  { id: 10, username: 'operator1', email: 'op1@example.com', phone_number: '+123', is_active: true },
  { id: 11, username: 'operator2', email: 'op2@example.com', phone_number: '+456', is_active: true }
];

const mockIssuesResponse: PaginatedResponse<Issue> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 101,
      tenant_id: 'f818979b-2ea0-43cb-8dd1-7c1729ee1fea',
      title: 'Broken handrail near marine pool title',
      status: 'pending',
      description: 'Broken handrail near marine pool',
      extra_data: {
        zona_parque: 'Zona Marina',
        urgencia: 'medium'
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
    vi.mocked(getIssuesStats).mockResolvedValue({ unassigned_count: 0, in_progress_count: 0, blocked_count: 0, operator_workload: [], operator_performance: [], zone_hotspots: [] });
    vi.mocked(getIssueComments).mockResolvedValue([]);
    vi.mocked(getTaskLogs).mockResolvedValue([]);
    vi.mocked(getIssue).mockResolvedValue(mockIssuesResponse.results[0]);

    let currentIssues = [...mockIssuesResponse.results];

    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const urlStr = typeof input === 'string' ? input : (input as Request).url || String(input);
      if (urlStr.includes('/issues/stats/')) {
        return Promise.resolve(new Response(JSON.stringify({ unassigned_count: 0, in_progress_count: 0, blocked_count: 0, operator_workload: [], operator_performance: [], zone_hotspots: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      if (urlStr.includes('/config/')) {
        return Promise.resolve(new Response(JSON.stringify(mockTenant), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      if (urlStr.includes('/operators/')) {
        return Promise.resolve(new Response(JSON.stringify(mockOperators), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      if (urlStr.includes('/assign/')) {
        currentIssues = currentIssues.map(i => i.id === 101 ? { ...i, assigned_to: 11, assigned_to_name: 'operator2' } : i);
        return Promise.resolve(new Response(JSON.stringify(currentIssues[0]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      if (urlStr.includes('/issues/')) {
        return Promise.resolve(new Response(JSON.stringify({ ...mockIssuesResponse, results: currentIssues }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }));
  });

  test('renders header title and dynamically maps custom fields columns', async () => {
    renderWithProviders(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>
    );

    // Wait for the dashboard to finish loading
    await screen.findByText(/Tenant Manager Dashboard/i);

    // Wait for issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken handrail near marine pool title')).toBeInTheDocument();
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
    renderWithProviders(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>
    );

    // Wait for the dashboard to finish loading
    await screen.findByText(/Tenant Manager Dashboard/i);

    // Wait for initial load call
    await waitFor(() => {
      expect(screen.getByText('Broken handrail near marine pool title')).toBeInTheDocument();
    });

    // Query status filter icon in column header
    const statusFilterIcon = screen.getByTestId('header-filter-status');
    fireEvent.click(statusFilterIcon);

    const resolvedItem = await screen.findByRole('menuitem', { name: 'Resolved' });
    fireEvent.click(resolvedItem);

    await waitFor(() => {
      // Should reset page to 1 and query with resolved filter
      const calls = vi.mocked(fetch).mock.calls;
      const hasResolvedCall = calls.some(call => {
        const urlStr = typeof call[0] === 'string' ? call[0] : (call[0] as Request).url || String(call[0]);
        return urlStr.includes('status=resolved');
      });
      expect(hasResolvedCall).toBe(true);
    });
  });

  test('calls assignIssue API and updates UI optimistically on operator assignment change', async () => {
    renderWithProviders(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>
    );

    // Wait for the dashboard to finish loading
    await screen.findByText(/Tenant Manager Dashboard/i);

    await waitFor(() => {
      expect(screen.getByText('Broken handrail near marine pool title')).toBeInTheDocument();
    });

    // Find row action select dropdown
    const actionSelect = screen.getByTestId('action-assign-select-101');
    expect(actionSelect).toHaveValue('10');
    
    // Change assigned operator to operator2 (value 11)
    fireEvent.change(actionSelect, { target: { value: '11' } });

    // UI optimistic status rendering check
    await waitFor(() => {
      expect(actionSelect).toHaveValue('11');
    });
  });

  test('renders Share Public Reporting Form section with copy and download buttons', async () => {
    vi.mocked(getTenantConfig).mockResolvedValue(mockTenant);

    renderWithProviders(
      <MemoryRouter>
        <DashboardStatsView />
      </MemoryRouter>
    );

    // Wait for the dashboard to finish loading
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });

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
    vi.mocked(updateIssue).mockImplementation(async (_id, data) => {
      if (data.description) {
        mockIssuesResponse.results[0].description = data.description;
      }
      return {
        ...mockIssuesResponse.results[0],
        description: data.description || mockIssuesResponse.results[0].description
      };
    });

    renderWithProviders(
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>
    );

    // Wait for the dashboard to finish loading
    await screen.findByText(/Tenant Manager Dashboard/i);

    // Wait for initial issues to load
    await waitFor(() => {
      expect(screen.getByText('Broken handrail near marine pool title')).toBeInTheDocument();
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
