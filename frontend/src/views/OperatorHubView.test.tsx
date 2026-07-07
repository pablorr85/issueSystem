import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OperatorHubView } from './OperatorHubView';
import { getOperatorHub } from '../services/api';
import type { OperatorTask } from '../services/types';

vi.mock('../services/api', () => ({
  getOperatorHub: vi.fn(),
}));

const mockTasks: OperatorTask[] = [
  {
    id: 1,
    title: 'Normal urgency task',
    status: 'pending',
    description: 'Normal urgency task',
    extra_data: { urgency: 'normal' },
    assigned_to: 10,
    assigned_to_name: 'operator1',
    secure_token: 'uuid-1',
    tenant_name: 'Zoo Park',
    tenant_logo_url: null,
    tenant_visual_config: { primary_color: '#2e7d32' },
    created_at: '2026-06-09T10:00:00Z',
    updated_at: '2026-06-09T10:00:00Z'
  },
  {
    id: 2,
    title: 'Critical urgency task',
    status: 'in_progress',
    description: 'Critical urgency task',
    extra_data: { urgencia: 'critical' },
    assigned_to: 10,
    assigned_to_name: 'operator1',
    secure_token: 'uuid-2',
    tenant_name: 'Zoo Park',
    tenant_logo_url: null,
    tenant_visual_config: { primary_color: '#2e7d32' },
    created_at: '2026-06-09T11:00:00Z',
    updated_at: '2026-06-09T11:00:00Z'
  },
  {
    id: 3,
    title: 'High urgency task',
    status: 'pending',
    description: 'High urgency task',
    extra_data: { urgency: 'high' },
    assigned_to: 10,
    assigned_to_name: 'operator1',
    secure_token: 'uuid-3',
    tenant_name: 'Zoo Park',
    tenant_logo_url: null,
    tenant_visual_config: { primary_color: '#2e7d32' },
    created_at: '2026-06-09T12:00:00Z',
    updated_at: '2026-06-09T12:00:00Z'
  }
];

describe('OperatorHubView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders error state when token is missing or invalid', async () => {
    render(
      <MemoryRouter initialEntries={['/work/hub']}>
        <OperatorHubView />
      </MemoryRouter>
    );

    expect(screen.getByText(/Failed to load task hub/i)).toBeInTheDocument();
  });

  test('renders loading and then displays sorted tasks by urgency', async () => {
    vi.mocked(getOperatorHub).mockResolvedValue(mockTasks);

    render(
      <MemoryRouter initialEntries={['/work/hub?token=12345678-1234-1234-1234-123456789012']}>
        <OperatorHubView />
      </MemoryRouter>
    );

    // Wait for the tasks list to render
    await waitFor(() => {
      expect(screen.getByText('Zoo Park')).toBeInTheDocument();
      expect(screen.getByText('Critical urgency task')).toBeInTheDocument();
      expect(screen.getByText('High urgency task')).toBeInTheDocument();
      expect(screen.getByText('Normal urgency task')).toBeInTheDocument();
    });

    // Check that Critical is rendered before High, and High before Normal
    const cards = screen.getAllByTestId(/task-card-/);
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent('Task #2'); // Critical
    expect(cards[1]).toHaveTextContent('Task #3'); // High
    expect(cards[2]).toHaveTextContent('Task #1'); // Normal
  });

  test('navigates to individual OperatorTaskView when card is clicked', async () => {
    vi.mocked(getOperatorHub).mockResolvedValue([mockTasks[1]]); // Critical task only

    render(
      <MemoryRouter initialEntries={['/work/hub?token=12345678-1234-1234-1234-123456789012']}>
        <Routes>
          <Route path="/work/hub" element={<OperatorHubView />} />
          <Route path="/work/task/:id" element={
            <div data-testid="task-page-stub">
              Task Details Page
            </div>
          } />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Critical urgency task')).toBeInTheDocument();
    });

    // Click on the task card
    fireEvent.click(screen.getByTestId('task-card-2'));

    // Verify stub page loads (navigation triggered)
    await waitFor(() => {
      expect(screen.getByTestId('task-page-stub')).toBeInTheDocument();
    });
  });
});
