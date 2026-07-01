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
  onEditIssue: (issue: Issue) => void;
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
  onEditIssue,
}) => {
  const { t } = useTranslation();
  const reportingUrl = `${window.location.origin}/${tenant.id}/report`;

  const [operatorFilterValue, setOperatorFilterValue] = useState<string>("");
  const [urgencyFilterValue, setUrgencyFilterValue] = useState<string>("");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState<string>("");
  const [savingBulk, setSavingBulk] = useState<boolean>(false);
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
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

  // Custom fields schemas defined for this tenant
  const customFields = useMemo(() => tenant.custom_fields || [], [tenant.custom_fields]);

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

  const urgencyField = useMemo(() => customFields.find((f) =>
    ["urgency", "urgencia"].includes(f.name.toLowerCase())
  ), [customFields]);
  const urgencyColumnId = urgencyField?.name || "";

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

  // Reset page when filter changes
  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
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
        />

        <DashboardTable
          issues={issues}
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
