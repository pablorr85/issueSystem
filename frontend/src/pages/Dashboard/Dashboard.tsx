import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem, InputLabel } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { getIssues, updateIssueStatus } from '../../services/api';
import type { TenantConfig, Issue } from '../../services/types';
import {
  DashboardContainer,
  DashboardHeader,
  DashboardTitle,
  FilterSection,
  StyledFormControl,
  DashboardCard,
  TableWrapper,
  StyledTable,
  StyledTableHead,
  StyledTableRow,
  StyledTableCell,
  StyledTableHeadCell,
  StatusBadge,
  TableSelect,
  PaginationFooter,
  PaginationInfo,
  PaginationButtons,
  PaginationButton,
  EmptyState,
  StyledTableBody,
  ReportButton,
  FilterSelect,
  QRSectionCard,
  QRContainer,
  QRInfo,
  QRTitle,
  QRDescription,
  LinkInputContainer,
  ReadOnlyInput,
  ActionButtonsGroup,
  SecondaryActionButton
} from './Dashboard.styles';

export interface DashboardProps {
  tenant: TenantConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({ tenant }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [prevParams, setPrevParams] = useState({
    tenantId: tenant.id,
    page: currentPage,
    statusFilter
  });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const reportingUrl = `${window.location.origin}/${tenant.id}/report`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadQR = () => {
    try {
      const canvas = document.getElementById('tenant-qr-code') as HTMLCanvasElement | null;
      if (!canvas) return;
      const pngUrl = canvas.toDataURL('image/png');
      triggerDownload(pngUrl, `${tenant.name.toLowerCase().replace(/\s+/g, '-')}-qr.png`);
    } catch (err) {
      console.warn('Canvas is tainted by cross-origin logo. Falling back to QR code without logo.', err);
      const fallbackCanvas = document.getElementById('tenant-qr-code-fallback') as HTMLCanvasElement | null;
      if (!fallbackCanvas) return;
      const pngUrl = fallbackCanvas.toDataURL('image/png');
      triggerDownload(pngUrl, `${tenant.name.toLowerCase().replace(/\s+/g, '-')}-qr-no-logo.png`);
      alert(t('dashboard.qrDownloadTaintedWarning', 'The logo image is hosted on an external server that does not allow downloads. The QR code has been downloaded successfully, but without the logo. To include the logo, please upload it to your local server or use a CORS-enabled URL.'));
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (
    tenant.id !== prevParams.tenantId ||
    currentPage !== prevParams.page ||
    statusFilter !== prevParams.statusFilter
  ) {
    setPrevParams({ tenantId: tenant.id, page: currentPage, statusFilter });
    setLoading(true);
  }

  // Fetch issues whenever tenant, page, or status filter changes
  useEffect(() => {
    let active = true;
    
    // Page is 1-indexed for the API pagination
    getIssues(tenant.id, statusFilter || undefined, currentPage)
      .then(res => {
        if (!active) return;
        setIssues(res.results || []);
        setTotalCount(res.count || 0);
        setLoading(false);
      })
      .catch(err => {
        if (!active) return;
        console.error(err);
        setIssues([]);
        setTotalCount(0);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tenant.id, currentPage, statusFilter]);

  // Reset page when filter changes
  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (issueId: number, newStatus: string) => {
    // Store original list to revert in case of failure
    const originalIssues = [...issues];

    // Optimistic UI Update
    setIssues(prev =>
      prev.map(issue =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    );

    updateIssueStatus(issueId, newStatus).catch(err => {
      console.error('Failed to update status:', err);
      // Revert UI to previous state on error
      setIssues(originalIssues);
      alert(t('dashboard.errorUpdate'));
    });
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const totalPages = Math.ceil(totalCount / 20) || 1;

  // Custom fields schemas defined for this tenant
  const customFields = tenant.custom_fields || [];

  return (
    <DashboardContainer className="animate-fade-in">
      <DashboardHeader>
        <DashboardTitle variant="h5" as="h2">
          <DashboardIcon sx={{ color: 'var(--primary)' }} />
          {t('dashboard.title')}
        </DashboardTitle>

        <FilterSection>
          <ReportButton
            variant="contained"
            onClick={() => navigate(`/${tenant.id}/report`)}
            data-testid="create-issue-link"
          >
            <AddIcon />
            {t('app.tabReport')}
          </ReportButton>

          <StyledFormControl variant="outlined" size="small">
            <InputLabel id="filter-status-label">{t('dashboard.statusFilterLabel')}</InputLabel>
            <FilterSelect
              labelId="filter-status-label"
              value={statusFilter}
              label={t('dashboard.statusFilterLabel')}
              onChange={(e) => handleFilterChange(e.target.value as string)}
              disabled={loading}
              inputProps={{ 'data-testid': 'dashboard-status-filter' }}
            >
              <MenuItem value=""><em>{t('dashboard.filterAll')}</em></MenuItem>
              <MenuItem value="open">{t('dashboard.filterOpen')}</MenuItem>
              <MenuItem value="in_progress">{t('dashboard.filterInProgress')}</MenuItem>
              <MenuItem value="resolved">{t('dashboard.filterResolved')}</MenuItem>
            </FilterSelect>
          </StyledFormControl>
        </FilterSection>
      </DashboardHeader>

      <QRSectionCard>
        <QRContainer>
          <QRCodeCanvas
            id="tenant-qr-code"
            value={reportingUrl}
            size={160}
            level="H"
            includeMargin={true}
            imageSettings={tenant.logo_url ? {
              src: tenant.logo_url,
              height: 32,
              width: 32,
              excavate: true,
            } : undefined}
          />
        </QRContainer>
        {/* Hidden fallback QR code without logo for tainted canvas downloads */}
        <div style={{ display: 'none' }}>
          <QRCodeCanvas
            id="tenant-qr-code-fallback"
            value={reportingUrl}
            size={160}
            level="L"
            includeMargin={true}
          />
        </div>
        <QRInfo>
          <QRTitle variant="h6" as="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCodeIcon sx={{ color: 'var(--primary)' }} />
            {t('dashboard.qrTitle', 'Share Public Reporting Form')}
          </QRTitle>
          <QRDescription variant="body2">
            {t('dashboard.qrDescription', 'Place this QR code on physical stickers, posters, or equipment around your site. Users can scan the QR code to instantly submit issues to your system without signing in.')}
          </QRDescription>
          
          <LinkInputContainer>
            <ReadOnlyInput
              type="text"
              readOnly
              value={reportingUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              data-testid="qr-url-input"
            />
            <ActionButtonsGroup>
              <SecondaryActionButton
                variant="outlined"
                onClick={copyToClipboard}
                data-testid="copy-qr-link-button"
              >
                {copied ? <CheckIcon sx={{ color: '#81c784' }} /> : <ContentCopyIcon />}
                {copied ? t('dashboard.copied', 'Copied!') : t('dashboard.copyLink', 'Copy Link')}
              </SecondaryActionButton>
              
              <SecondaryActionButton
                variant="outlined"
                onClick={downloadQR}
                data-testid="download-qr-button"
              >
                <DownloadIcon />
                {t('dashboard.downloadQR', 'Download QR (PNG)')}
              </SecondaryActionButton>
            </ActionButtonsGroup>
          </LinkInputContainer>
        </QRInfo>
      </QRSectionCard>

      <DashboardCard>
        <TableWrapper>
          <StyledTable aria-label="issues table">
            <StyledTableHead>
              <StyledTableRow>
                <StyledTableHeadCell>{t('dashboard.tableID')}</StyledTableHeadCell>
                <StyledTableHeadCell>{t('dashboard.tableStatus')}</StyledTableHeadCell>
                <StyledTableHeadCell>{t('dashboard.tableDescription')}</StyledTableHeadCell>
                
                {/* Dynamically render header columns for each tenant custom field */}
                {customFields.map(field => (
                  <StyledTableHeadCell key={field.name}>
                    {field.name.replace(/_/g, ' ')}
                  </StyledTableHeadCell>
                ))}
                
                <StyledTableHeadCell>{t('dashboard.tableCreatedAt')}</StyledTableHeadCell>
                <StyledTableHeadCell align="center">{t('dashboard.tableActions')}</StyledTableHeadCell>
              </StyledTableRow>
            </StyledTableHead>
            <StyledTableBody>
              {loading && issues.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={5 + customFields.length} align="center">
                    {t('dashboard.loadingIssues')}
                  </StyledTableCell>
                </StyledTableRow>
              ) : issues.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={5 + customFields.length} padding="none">
                    <EmptyState>
                      {t('dashboard.noIssuesFiltered')}
                    </EmptyState>
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                issues.map((issue) => (
                  <StyledTableRow key={issue.id} data-testid={`issue-row-${issue.id}`}>
                    <StyledTableCell>{issue.id}</StyledTableCell>
                    <StyledTableCell>
                      <StatusBadge $status={issue.status}>
                        {issue.status === 'open'
                          ? t('dashboard.actionOpen')
                          : issue.status === 'in_progress'
                          ? t('dashboard.actionInProgress')
                          : t('dashboard.actionResolved')}
                      </StatusBadge>
                    </StyledTableCell>
                    <StyledTableCell>{issue.description}</StyledTableCell>
                    
                    {/* Render the flattened dynamic custom fields values */}
                    {customFields.map(field => {
                      const rawVal = issue.extra_data?.[field.name];
                      let displayVal = '-';
                      
                      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                        if (typeof rawVal === 'boolean') {
                          displayVal = rawVal ? t('dashboard.yes') : t('dashboard.no');
                        } else {
                          displayVal = String(rawVal);
                        }
                      }
                      
                      return (
                        <StyledTableCell key={field.name}>
                          {displayVal}
                        </StyledTableCell>
                      );
                    })}
                    
                    <StyledTableCell>{formatDate(issue.created_at)}</StyledTableCell>
                    <StyledTableCell align="center">
                      <TableSelect
                        value={issue.status}
                        onChange={(e) => handleStatusChange(issue.id, e.target.value as string)}
                        inputProps={{ 'data-testid': `action-status-select-${issue.id}` }}
                      >
                        <MenuItem value="open">{t('dashboard.actionOpen')}</MenuItem>
                        <MenuItem value="in_progress">{t('dashboard.actionInProgress')}</MenuItem>
                        <MenuItem value="resolved">{t('dashboard.actionResolved')}</MenuItem>
                      </TableSelect>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              )}
            </StyledTableBody>
          </StyledTable>
        </TableWrapper>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <PaginationFooter>
            <PaginationInfo>
              {t('dashboard.paginationInfo', { page: currentPage, totalPages, totalCount })}
            </PaginationInfo>
            <PaginationButtons>
              <PaginationButton
                variant="outlined"
                size="small"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                data-testid="pagination-prev"
              >
                {t('dashboard.paginationPrev')}
              </PaginationButton>
              <PaginationButton
                variant="outlined"
                size="small"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                data-testid="pagination-next"
              >
                {t('dashboard.paginationNext')}
              </PaginationButton>
            </PaginationButtons>
          </PaginationFooter>
        )}
      </DashboardCard>
    </DashboardContainer>
  );
};
