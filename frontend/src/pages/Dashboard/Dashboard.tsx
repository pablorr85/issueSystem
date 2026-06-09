import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem, InputLabel } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
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
  ReportButton
} from './Dashboard.styles';

export interface DashboardProps {
  tenant: TenantConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({ tenant }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch issues whenever tenant, page, or status filter changes
  useEffect(() => {
    let active = true;
    setLoading(true);
    
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
        <DashboardTitle variant="h5" component="h2">
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

          <StyledFormControl variant="outlined">
            <InputLabel id="filter-status-label">{t('dashboard.statusFilterLabel')}</InputLabel>
            <TableSelect
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
            </TableSelect>
          </StyledFormControl>
        </FilterSection>
      </DashboardHeader>

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
