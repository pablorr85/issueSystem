import React, { useState, useMemo, useCallback } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useTranslation } from "react-i18next";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { assignIssue } from "../../services/api";
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
        />

        <DashboardPagination
          totalCount={totalCount}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          loading={loading}
        />
      </DashboardCard>
    </DashboardContainer>
  );
};
