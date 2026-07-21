import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkOrderPrintView } from './WorkOrderPrintView';
import type { Issue } from '../../services/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

const mockIssue: Issue = {
  id: 42,
  tenant_id: 'tenant-123',
  order_number: 'WO-00042',
  title: 'Replace HVAC Filter',
  description: 'Clean and replace filter in Unit 4',
  status: 'in_progress',
  zone_name: 'Building B - Roof',
  assigned_to: 1,
  assigned_to_name: 'John Maintenance',
  secure_token: 'token-42',
  extra_data: {},
  started_at: '2026-07-20T09:00:00Z',
  completed_at: null,
  total_cost: 150.5,
  total_time_spent_hours: 2.5,
  qa_checklist: '',
  created_at: '2026-07-20T08:00:00Z',
  updated_at: '2026-07-20T09:00:00Z',
};

describe('WorkOrderPrintView Component', () => {
  it('renders order number, title, zone, and assigned operator', () => {
    render(<WorkOrderPrintView issue={mockIssue} />);

    expect(screen.getByText('WO-00042')).toBeInTheDocument();
    expect(screen.getByText('Replace HVAC Filter')).toBeInTheDocument();
    expect(screen.getAllByText('Building B - Roof')[0]).toBeInTheDocument();
    expect(screen.getByText('John Maintenance')).toBeInTheDocument();
  });

  it('displays cost and labor time when present', () => {
    render(<WorkOrderPrintView issue={mockIssue} />);

    expect(screen.getByText('150.50 €')).toBeInTheDocument();
    expect(screen.getByText('2.5 h')).toBeInTheDocument();
  });

  it('renders fallback generic Definition of Done (DoD) checklist items when qa_checklist is empty', () => {
    render(<WorkOrderPrintView issue={mockIssue} />);

    expect(screen.getByText(/Cleanliness|Limpieza/i)).toBeInTheDocument();
    expect(screen.getByText(/Functionality|Funcionalidad/i)).toBeInTheDocument();
    expect(screen.getByText(/Safety|Seguridad/i)).toBeInTheDocument();
    expect(screen.getByText(/Visual Inspection|Inspección Visual/i)).toBeInTheDocument();
  });

  it('renders custom checklist items when qa_checklist is provided', () => {
    const customIssue: Issue = {
      ...mockIssue,
      qa_checklist: 'Check voltage 220V\nVerify ground connection',
    };

    render(<WorkOrderPrintView issue={customIssue} />);

    expect(screen.getByText('Check voltage 220V')).toBeInTheDocument();
    expect(screen.getByText('Verify ground connection')).toBeInTheDocument();
  });
});
