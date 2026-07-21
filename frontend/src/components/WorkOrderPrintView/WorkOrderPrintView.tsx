import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import type { Issue, OperatorTask } from '../../services/types';
import {
  PrintOverlay,
  PrintContainer,
  PrintActionHeader,
  ActionButton,
  PrintHeader,
  HeaderTitle,
  HeaderMeta,
  SectionBox,
  SectionTitle,
  DetailGrid,
  DetailItem,
  TaskDescriptionText,
  ChecklistContainer,
  ChecklistItem,
  CheckboxSquare,
  SignatureGrid,
  SignatureBox,
} from './WorkOrderPrintView.styles';

const getZoneValue = (extraData?: Record<string, unknown>) => {
  if (!extraData) return '';
  const zoneKey = Object.keys(extraData).find(
    k => k.toLowerCase().includes('zona') || k.toLowerCase().includes('location') || k.toLowerCase().includes('zone')
  );
  if (zoneKey) {
    return String(extraData[zoneKey]);
  }
  const firstKey = Object.keys(extraData)[0];
  return firstKey ? `${firstKey}: ${extraData[firstKey]}` : '';
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString();
  } catch {
    return dateStr;
  }
};

export interface WorkOrderPrintViewProps {
  issue: Issue | OperatorTask;
  tenantName?: string;
  onClose?: () => void;
}

export const WorkOrderPrintView: React.FC<WorkOrderPrintViewProps> = ({
  issue,
  tenantName,
  onClose,
}) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  const orderNumber = issue.order_number || `WO-${String(issue.id).padStart(5, '0')}`;
  const zone = issue.zone_name || getZoneValue(issue.extra_data) || t('workOrder.unassignedZone', 'General Facility');
  let checklistLines = (issue.qa_checklist || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  if (checklistLines.length === 0) {
    checklistLines = [
      t('workOrder.defaultChecklist1', 'Cleanliness: Work area cleaned, sanitized, and clear of debris or tools.'),
      t('workOrder.defaultChecklist2', 'Functionality: Operation and functional checks successfully completed.'),
      t('workOrder.defaultChecklist3', 'Safety: Covers, guards, and safety components reinstalled and verified.'),
      t('workOrder.defaultChecklist4', 'Visual Inspection: Aesthetic finish and structural condition approved.')
    ];
  }

  const formattedCost =
    issue.total_cost !== null && issue.total_cost !== undefined && Number(issue.total_cost) > 0
      ? `${Number(issue.total_cost).toFixed(2)} €`
      : '___________________ €';

  const formattedTime =
    issue.total_time_spent_hours !== null &&
    issue.total_time_spent_hours !== undefined &&
    Number(issue.total_time_spent_hours) > 0
      ? `${Number(issue.total_time_spent_hours).toFixed(1)} h`
      : '___________________ h';

  const content = (
    <PrintOverlay data-testid="work-order-print-overlay">
      <PrintContainer data-testid="work-order-print-container">

        <div>
          <PrintActionHeader className="no-print">
            <ActionButton onClick={handlePrint} $primary data-testid="print-action-button">
              <PrintIcon fontSize="small" />
              {t('workOrder.printButton', 'Print Work Order')}
            </ActionButton>
            {onClose && (
              <ActionButton onClick={onClose} data-testid="close-print-button">
                <CloseIcon fontSize="small" />
                {t('common.close', 'Close')}
              </ActionButton>
            )}
          </PrintActionHeader>

          <PrintHeader>
            <HeaderTitle>
              <h1>{t('workOrder.title', 'WORK ORDER')}</h1>
              <span>{tenantName || t('app.appTitle', 'Solvo')}</span>
            </HeaderTitle>
            <HeaderMeta>
              <div>
                {t('workOrder.orderNumber', 'Order Number')}: <strong>{orderNumber}</strong>
              </div>
              <div>
                {t('workOrder.zone', 'Facility Zone')}: <strong>{zone}</strong>
              </div>
              <div>
                {t('workOrder.date', 'Issued Date')}: <strong>{formatDate(issue.created_at)}</strong>
              </div>
              <div>
                {t('workOrder.status', 'Current Status')}: <strong>{issue.status.toUpperCase()}</strong>
              </div>
            </HeaderMeta>
          </PrintHeader>

          {/* Section 1: Location & Task Summary */}
          <SectionBox>
            <SectionTitle>{t('workOrder.sectionDetails', 'Facility & Problem Summary')}</SectionTitle>
            <DetailGrid>
              <DetailItem>
                <label>{t('workOrder.zoneLabel', 'Zone / Facility Area')}</label>
                <span>{zone}</span>
              </DetailItem>
              <DetailItem>
                <label>{t('workOrder.taskTitleLabel', 'Task Summary')}</label>
                <span>{issue.title || `Issue #${issue.id}`}</span>
              </DetailItem>
            </DetailGrid>
            <DetailItem>
              <label>{t('workOrder.descriptionLabel', 'Detailed Problem Description')}</label>
              <TaskDescriptionText>{issue.description || t('common.noDescription', 'No detailed description provided.')}</TaskDescriptionText>
            </DetailItem>
          </SectionBox>

          {/* Section 2: Execution Details */}
          <SectionBox>
            <SectionTitle>{t('workOrder.sectionExecution', 'Execution & Worker Assignment')}</SectionTitle>
            <DetailGrid>
              <DetailItem>
                <label>{t('workOrder.assignedOperator', 'Assigned Operator')}</label>
                <span>{issue.assigned_to_name || t('dashboard.unassigned', 'Unassigned')}</span>
              </DetailItem>
              <DetailItem>
                <label>{t('workOrder.startedAt', 'Start Time')}</label>
                <span>{formatDate(issue.started_at)}</span>
              </DetailItem>
              <DetailItem>
                <label>{t('workOrder.completedAt', 'Completion Time')}</label>
                <span>{formatDate(issue.completed_at || issue.resolved_at)}</span>
              </DetailItem>
              <DetailItem>
                <label>{t('workOrder.totalCostLabel', 'Total Material / Service Cost')}</label>
                <span>{formattedCost}</span>
              </DetailItem>
              <DetailItem>
                <label>{t('workOrder.totalTimeLabel', 'Effective Time Worked')}</label>
                <span>{formattedTime}</span>
              </DetailItem>
            </DetailGrid>
          </SectionBox>

          {/* Section 3: Configurable QA Checklist */}
          {checklistLines.length > 0 && (
            <SectionBox>
              <SectionTitle>{t('workOrder.sectionQA', 'QA Verification Checklist')}</SectionTitle>
              <ChecklistContainer>
                {checklistLines.map((line, idx) => (
                  <ChecklistItem key={idx}>
                    <CheckboxSquare />
                    <span>{line}</span>
                  </ChecklistItem>
                ))}
              </ChecklistContainer>
            </SectionBox>
          )}
        </div>

        {/* Section 4: Signatures */}
        <SignatureGrid>
          <SignatureBox>
            <span>{t('workOrder.operatorSignature', 'Operator Signature')}</span>
          </SignatureBox>
          <SignatureBox>
            <span>{t('workOrder.managerSignature', 'Manager Signature')}</span>
          </SignatureBox>
        </SignatureGrid>

      </PrintContainer>
    </PrintOverlay>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(content, document.body);
  }

  return content;
};

export default WorkOrderPrintView;
