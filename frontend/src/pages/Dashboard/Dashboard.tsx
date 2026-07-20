import React, { useState, useMemo, useCallback } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useTranslation } from "react-i18next";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { assignIssue, bulkAssignIssues } from "../../services/api";
import { MenuItem, Snackbar, CircularProgress } from "@mui/material";
import type { TenantConfig, Issue, Operator } from "../../services/types";
import { ShareQRSection } from "../../components/ShareQRSection/ShareQRSection";
import { DashboardFilters } from "./DashboardFilters";
import { DashboardTable } from "./DashboardTable";
import { DashboardPagination } from "./DashboardPagination";
import {
  DashboardContainer,
  DashboardHeader,
  DashboardTitle,
  DashboardCard,
  FloatingBarContainer,
  FloatingBarContent,
  FloatingBarText,
  FloatingBarActions,
  FloatingBarButton,
  TableSelect,
} from "./Dashboard.styles";

export interface DashboardProps {
  tenant: TenantConfig;
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  operators: Operator[];
  loading: boolean;
  totalCount: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  assignedFilter: string;
  onAssignedFilterChange: (assigned: string) => void;
  onEditIssue: (issue: Issue) => void;
  onToggleOperatorActive: (id: number, currentStatus: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tenant,
  issues,
  setIssues,
  operators,
  loading,
  totalCount,
  currentPage,
  setCurrentPage,
  statusFilter,
  setStatusFilter,
  assignedFilter,
  onAssignedFilterChange,
  onEditIssue,
  onToggleOperatorActive,
}) => {
  const { t } = useTranslation();
  const reportingUrl = `${window.location.origin}/${tenant.id}/report`;

  const [operatorFilterValue, setOperatorFilterValue] = useState<string>("");
  const [urgencyFilterValue, setUrgencyFilterValue] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState<string>("");
  const [savingBulk, setSavingBulk] = useState<boolean>(false);
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const customFields = tenant.custom_fields || [];
  const urgencyField = useMemo(() => customFields.find((f) =>
    ["urgency", "urgencia"].includes(f.name.toLowerCase())
  ), [customFields]);
  const urgencyColumnId = urgencyField?.name || "";

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (operatorFilterValue !== "" && issue.assigned_to !== Number(operatorFilterValue)) {
        return false;
      }
      if (urgencyColumnId && urgencyFilterValue !== "") {
        const val = issue.extra_data?.[urgencyColumnId];
        if (String(val || "").toLowerCase() !== urgencyFilterValue.toLowerCase()) {
          return false;
        }
      }
      if (startDate || endDate) {
        if (!issue.created_at) return false;
        const createdDate = new Date(issue.created_at);
        if (startDate) {
          const start = new Date(`${startDate}T00:00:00`);
          if (createdDate < start) return false;
        }
        if (endDate) {
          const end = new Date(`${endDate}T23:59:59`);
          if (createdDate > end) return false;
        }
      }
      return true;
    });
  }, [issues, operatorFilterValue, urgencyColumnId, urgencyFilterValue, startDate, endDate]);

  const handleExportExcel = useCallback(() => {
    if (!filteredIssues || filteredIssues.length === 0) {
      alert(t("dashboard.noIssuesFiltered", "No issues found to export."));
      return;
    }

    const headers = [
      "ID",
      "Order Number",
      "Title",
      "Description",
      "Status",
      "Assigned Operator",
      "Zone",
      "Created At",
      "Started At",
      "Completed At",
      "Total Cost (€)",
      "Time Spent (Hours)",
      ...customFields.map((f) => f.name)
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredIssues.map((issue) => {
      const extraData = issue.extra_data || {};
      const customFieldVals = customFields.map((f) => extraData[f.name] ?? "");

      return [
        escapeCsv(issue.id),
        escapeCsv(issue.order_number || ""),
        escapeCsv(issue.title || ""),
        escapeCsv(issue.description || ""),
        escapeCsv(issue.status),
        escapeCsv(issue.assigned_to_name || ""),
        escapeCsv(issue.zone_name || ""),
        escapeCsv(issue.created_at ? new Date(issue.created_at).toLocaleString() : ""),
        escapeCsv(issue.started_at ? new Date(issue.started_at).toLocaleString() : ""),
        escapeCsv(issue.completed_at ? new Date(issue.completed_at).toLocaleString() : ""),
        escapeCsv(issue.total_cost ?? ""),
        escapeCsv(issue.total_time_spent_hours ?? ""),
        ...customFieldVals.map(escapeCsv)
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.map(escapeCsv).join(";"), ...rows].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute("download", `incidencias_export_${tenant.name.replace(/\s+/g, '_')}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredIssues, customFields, tenant.name, t]);
  const handleToggleSelectIssue = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const assignableIssues = issues.filter((i) => !["resolved", "wont_fix"].includes(i.status));
      const assignableIds = assignableIssues.map((i) => i.id);
      const allSelected = assignableIds.length > 0 && assignableIds.every((id) => prev.includes(id));
      if (allSelected) {
        // Deselect all visible assignable
        return prev.filter((id) => !assignableIds.includes(id));
      } else {
        // Select all visible assignable
        const newSet = new Set([...prev, ...assignableIds]);
        return Array.from(newSet);
      }
    });
  }, [issues]);

  const handleBulkSave = async () => {
    if (selectedIds.length === 0) return;
    setSavingBulk(true);
    const operatorId = bulkAssignee === "" ? null : Number(bulkAssignee);
    const originalIssues = [...issues];

    // Optimistic UI Update for all selected tasks
    const assignedOp = operators.find((op) => op.id === operatorId);
    setIssues((prev) =>
      prev.map((issue) =>
        selectedIds.includes(issue.id)
          ? {
              ...issue,
              assigned_to: operatorId,
              assigned_to_name: assignedOp ? assignedOp.username : "",
            }
          : issue
      )
    );

    try {
      await bulkAssignIssues(selectedIds, operatorId);
      setToastMessage(t("dashboard.bulkAssignSuccess", "Tasks assigned and operators notified successfully!"));
      setToastOpen(true);
      setSelectedIds([]); // Clear selection cart
      setBulkAssignee("");
    } catch (err) {
      console.error("Failed bulk assignment:", err);
      setIssues(originalIssues); // Rollback
      setToastMessage(t("dashboard.bulkAssignError", "Failed to assign tasks. Please try again."));
      setToastOpen(true);
    } finally {
      setSavingBulk(false);
    }
  };

  const handleAssignOperator = useCallback(
    (issueId: number, operatorIdVal: number | string) => {
      const operatorId = operatorIdVal === "" ? null : Number(operatorIdVal);
      const originalIssues = [...issues];

      // Optimistic UI Update
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                assigned_to: operatorId,
                assigned_to_name: operatorId
                  ? operators.find((op) => op.id === operatorId)?.username || ""
                  : "",
              }
            : issue
        )
      );

      assignIssue(issueId, operatorId)
        .then((updatedIssue) => {
          setIssues((prev) =>
            prev.map((issue) =>
              issue.id === issueId ? { ...issue, ...updatedIssue } : issue
            )
          );
        })
        .catch((err) => {
          console.error("Failed to assign operator:", err);
          setIssues(originalIssues);
          alert(t("dashboard.errorAssign", "Failed to assign operator"));
        });
    },
    [issues, operators, t, setIssues]
  );

  const handleOperatorFilterChange = (val: string) => {
    setOperatorFilterValue(val);
  };

  const handleUrgencyFilterChange = (val: string) => {
    setUrgencyFilterValue(val);
  };

  const tableFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (statusFilter !== "") {
      filters.push({ id: "status", value: statusFilter });
    }
    if (operatorFilterValue !== "") {
      filters.push({ id: "assigned_to", value: Number(operatorFilterValue) });
    }
    if (urgencyColumnId && urgencyFilterValue !== "") {
      filters.push({ id: urgencyColumnId, value: urgencyFilterValue });
    }
    return filters;
  }, [statusFilter, operatorFilterValue, urgencyFilterValue, urgencyColumnId]);

  // Reset page when filter changes (handled by parent setStatusFilter)
  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
  };

  const totalPages = Math.ceil(totalCount / 20) || 1;

  return (
    <DashboardContainer className="animate-fade-in">
      <DashboardHeader>
        <DashboardTitle variant="h5" as="h2">
          <DashboardIcon />
          {t("dashboard.title")}
        </DashboardTitle>
      </DashboardHeader>

      <ShareQRSection tenant={tenant} reportingUrl={reportingUrl} />

      <DashboardCard>
        <DashboardFilters
          tenantId={tenant.id}
          statusFilter={statusFilter}
          onStatusFilterChange={handleFilterChange}
          operatorFilterValue={operatorFilterValue}
          onOperatorFilterChange={handleOperatorFilterChange}
          urgencyFilterValue={urgencyFilterValue}
          onUrgencyFilterChange={handleUrgencyFilterChange}
          urgencyColumnId={urgencyColumnId}
          operators={operators}
          loading={loading}
          assignedFilter={assignedFilter}
          onAssignedFilterChange={onAssignedFilterChange}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onExportExcel={handleExportExcel}
        />

        <DashboardTable
          issues={filteredIssues}
          setIssues={setIssues}
          operators={operators}
          loading={loading}
          columnFilters={tableFilters}
          customFields={customFields}
          onEditIssue={onEditIssue}
          handleAssignOperator={handleAssignOperator}
          selectedIds={selectedIds}
          onToggleSelectIssue={handleToggleSelectIssue}
          onToggleSelectAll={handleToggleSelectAll}
        />

        <DashboardPagination
          totalCount={totalCount}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          loading={loading}
        />
      </DashboardCard>

      <DashboardCard style={{ marginTop: '30px' }} data-testid="operator-management-card">
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 800, color: 'white', borderLeft: '4px solid var(--primary)', paddingLeft: '10px' }}>
          {t("dashboard.operatorManagementTitle", "Operator Management")}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {operators.map((op) => (
            <div
              key={op.id}
              data-testid={`operator-card-${op.id}`}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: 700, color: 'white' }}>{op.username}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #c5c2d9)' }}>
                  {op.phone_number || t("dashboard.noPhone", "No phone")}
                </span>
              </div>
              <button
                data-testid={`toggle-operator-${op.id}`}
                onClick={() => onToggleOperatorActive(op.id, op.is_active)}
                style={{
                  background: op.is_active ? 'var(--primary)' : 'rgba(239, 68, 68, 0.15)',
                  color: op.is_active ? 'white' : '#ef4444',
                  border: `1px solid ${op.is_active ? 'var(--primary)' : '#ef4444'}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {op.is_active ? t("dashboard.active", "Active") : t("dashboard.inactive", "Inactive")}
              </button>
            </div>
          ))}
        </div>
      </DashboardCard>

      {selectedIds.length > 0 && (
        <FloatingBarContainer data-testid="bulk-assign-bar">
          <FloatingBarContent>
            <FloatingBarText>
              {t("dashboard.selectedCount", { count: selectedIds.length })}
            </FloatingBarText>
            <FloatingBarActions>
              <TableSelect
                value={bulkAssignee}
                onChange={(e) => setBulkAssignee(e.target.value as string)}
                displayEmpty
                size="small"
                inputProps={{
                  "data-testid": "bulk-assignee-select",
                }}
                disabled={savingBulk}
                sx={{ minWidth: 180, height: 40 }}
              >
                <MenuItem value="">
                  <em>{t("dashboard.bulkAssignSelectOperator", "Select Operator")}</em>
                </MenuItem>
                {operators.map((op) => (
                  <MenuItem key={op.id} value={String(op.id)}>
                    {op.username}
                  </MenuItem>
                ))}
              </TableSelect>
              <FloatingBarButton
                onClick={handleBulkSave}
                disabled={savingBulk}
                $variant="primary"
                data-testid="bulk-save-button"
              >
                {savingBulk ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  t("dashboard.bulkAssignButton", "Save & Notify")
                )}
              </FloatingBarButton>
              <FloatingBarButton
                onClick={() => {
                  setSelectedIds([]);
                  setBulkAssignee("");
                }}
                disabled={savingBulk}
                $variant="secondary"
                data-testid="bulk-cancel-button"
              >
                {t("dashboard.cancel")}
              </FloatingBarButton>
            </FloatingBarActions>
          </FloatingBarContent>
        </FloatingBarContainer>
      )}

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </DashboardContainer>
  );
};
