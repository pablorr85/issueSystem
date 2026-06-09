import React, { useState, useEffect } from 'react';
import { MenuItem, InputLabel } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
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
  StyledTableBody,
  StyledTableHeadCell,
  StyledTableRow,
  StyledTableCell,
  StatusBadge,
  TableSelect,
  PaginationFooter,
  PaginationInfo,
  PaginationButtons,
  PaginationButton,
  EmptyState
} from './Dashboard.styles';

export interface DashboardProps {
  tenant: TenantConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({ tenant }) => {
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
      alert('Error updating issue status. Please try again.');
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
          Tenant Manager Dashboard
        </DashboardTitle>

        <FilterSection>
          <StyledFormControl variant="outlined">
            <InputLabel id="filter-status-label">Status Filter</InputLabel>
            <TableSelect
              labelId="filter-status-label"
              value={statusFilter}
              label="Status Filter"
              onChange={(e) => handleFilterChange(e.target.value as string)}
              disabled={loading}
              inputProps={{ 'data-testid': 'dashboard-status-filter' }}
            >
              <MenuItem value=""><em>All Statuses</em></MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </TableSelect>
          </StyledFormControl>
        </FilterSection>
      </DashboardHeader>

      <DashboardCard>
        <TableWrapper>
          <StyledTable aria-label="issues table">
            <StyledTableHead>
              <StyledTableRow>
                <StyledTableHeadCell>ID</StyledTableHeadCell>
                <StyledTableHeadCell>Status</StyledTableHeadCell>
                <StyledTableHeadCell>Description</StyledTableHeadCell>
                
                {/* Dynamically render header columns for each tenant custom field */}
                {customFields.map(field => (
                  <StyledTableHeadCell key={field.name}>
                    {field.name.replace(/_/g, ' ')}
                  </StyledTableHeadCell>
                ))}
                
                <StyledTableHeadCell>Created At</StyledTableHeadCell>
                <StyledTableHeadCell align="center">Actions</StyledTableHeadCell>
              </StyledTableRow>
            </StyledTableHead>
            <StyledTableBody>
              {loading && issues.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={5 + customFields.length} align="center">
                    Loading dashboard issues...
                  </StyledTableCell>
                </StyledTableRow>
              ) : issues.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={5 + customFields.length} padding="none">
                    <EmptyState>
                      No issues reported under these criteria.
                    </EmptyState>
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                issues.map((issue) => (
                  <StyledTableRow key={issue.id} data-testid={`issue-row-${issue.id}`}>
                    <StyledTableCell>{issue.id}</StyledTableCell>
                    <StyledTableCell>
                      <StatusBadge $status={issue.status}>
                        {issue.status.replace(/_/g, ' ')}
                      </StatusBadge>
                    </StyledTableCell>
                    <StyledTableCell>{issue.description}</StyledTableCell>
                    
                    {/* Render the flattened dynamic custom fields values */}
                    {customFields.map(field => {
                      const rawVal = issue.extra_data?.[field.name];
                      let displayVal = '-';
                      
                      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                        if (typeof rawVal === 'boolean') {
                          displayVal = rawVal ? 'Yes' : 'No';
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
                        <MenuItem value="open">Open</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
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
              Page {currentPage} of {totalPages} ({totalCount} total issues)
            </PaginationInfo>
            <PaginationButtons>
              <PaginationButton
                variant="outlined"
                size="small"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                data-testid="pagination-prev"
              >
                Previous
              </PaginationButton>
              <PaginationButton
                variant="outlined"
                size="small"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                data-testid="pagination-next"
              >
                Next
              </PaginationButton>
            </PaginationButtons>
          </PaginationFooter>
        )}
      </DashboardCard>
    </DashboardContainer>
  );
};
