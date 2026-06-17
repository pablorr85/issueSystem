import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MenuItem, InputLabel } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import LaunchIcon from "@mui/icons-material/Launch";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useTranslation } from "react-i18next";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { getIssues, getOperators, assignIssue } from "../../services/api";
import type { TenantConfig, Issue, Operator } from "../../services/types";
import { EditIssueModal } from "../../components/EditIssueModal/EditIssueModal";
import { ShareQRSection } from "../../components/ShareQRSection/ShareQRSection";

const columnHelper = createColumnHelper<Issue>();
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
  UrgencyPill,
} from "./Dashboard.styles";

const isCriticalUrgency = (issue: Issue): boolean => {
  if (!issue.extra_data) return false;
  const urgencyKeys = ["urgency", "urgencia"];
  for (const key of Object.keys(issue.extra_data)) {
    if (urgencyKeys.includes(key.toLowerCase())) {
      const val = issue.extra_data[key];
      if (typeof val === "string") {
        const lowerVal = val.toLowerCase().trim();
        if (
          lowerVal.includes("critical") ||
          lowerVal.includes("crítica") ||
          lowerVal.includes("critica")
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

const getUrgencyLevelKey = (valStr: string): string => {
  const val = valStr.toLowerCase().trim();
  if (
    val.includes("critical") ||
    val.includes("crítica") ||
    val.includes("critica")
  ) {
    return "critical";
  }
  if (val.includes("high") || val.includes("alta")) {
    return "high";
  }
  if (val.includes("medium") || val.includes("media")) {
    return "medium";
  }
  if (val.includes("low") || val.includes("baja")) {
    return "low";
  }
  return "normal";
};

const getUrgencyIcon = (levelKey: string) => {
  switch (levelKey) {
    case "critical":
      return <ErrorIcon style={{ fontSize: "0.9rem" }} />;
    case "high":
      return <WarningIcon style={{ fontSize: "0.9rem" }} />;
    case "medium":
      return <InfoIcon style={{ fontSize: "0.9rem" }} />;
    case "low":
      return <ArrowDownwardIcon style={{ fontSize: "0.9rem" }} />;
    default:
      return null;
  }
};

// Helper to format date
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export interface DashboardProps {
  tenant: TenantConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({ tenant }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [prevParams, setPrevParams] = useState({
    tenantId: tenant.id,
    page: currentPage,
    statusFilter,
  });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const reportingUrl = `${window.location.origin}/${tenant.id}/report`;

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Custom fields schemas defined for this tenant
  const customFields = useMemo(() => tenant.custom_fields || [], [tenant.custom_fields]);

  const handleAssignOperator = useCallback((
    issueId: number,
    operatorIdVal: number | string,
  ) => {
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
          : issue,
      ),
    );

    assignIssue(issueId, operatorId)
      .then((updatedIssue) => {
        setIssues((prev) =>
          prev.map((issue) =>
            issue.id === issueId ? { ...issue, ...updatedIssue } : issue,
          ),
        );
      })
      .catch((err) => {
        console.error("Failed to assign operator:", err);
        setIssues(originalIssues);
        alert(t("dashboard.errorAssign", "Failed to assign operator"));
      });
  }, [issues, operators, t]);

  // Synchronize statusFilter to TanStack status filter
  useEffect(() => {
    setColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.id !== "status");
      if (statusFilter !== "") {
        filtered.push({ id: "status", value: statusFilter });
      }
      return filtered;
    });
  }, [statusFilter]);

  const columns = useMemo(() => {
    const baseCols = [
      columnHelper.accessor("id", {
        header: () => t("dashboard.tableID"),
        cell: (info) => {
          const issue = info.row.original;
          return (
            <span
              onClick={() => setEditingIssue(issue)}
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                color: "var(--primary)",
              }}
              data-testid={`edit-issue-id-${issue.id}`}
            >
              {issue.id}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: () => t("dashboard.tableStatus"),
        cell: (info) => {
          const status = info.getValue();
          return (
            <StatusBadge $status={status}>
              {status === "pending"
                ? t("dashboard.actionPending", "Pending")
                : status === "in_progress"
                  ? t("dashboard.actionInProgress")
                  : t("dashboard.actionResolved")}
            </StatusBadge>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || filterValue === "") return true;
          const val = row.getValue(columnId);
          return val === filterValue;
        },
      }),
      columnHelper.accessor("description", {
        header: () => t("dashboard.tableDescription"),
        cell: (info) => {
          const issue = info.row.original;
          return (
            <span
              onClick={() => setEditingIssue(issue)}
              style={{ cursor: "pointer", display: "block", width: "100%" }}
              data-testid={`edit-issue-desc-${issue.id}`}
            >
              {issue.description}
            </span>
          );
        },
      }),
    ];

    const dynamicCols = customFields.map((field) => {
      const isUrgencyField = ["urgency", "urgencia"].includes(
        field.name.toLowerCase()
      );

      return columnHelper.accessor<(row: Issue) => unknown, unknown>(
        (row: Issue) => row.extra_data?.[field.name],
        {
          id: field.name,
          header: () => field.name.replace(/_/g, " "),
          cell: (info) => {
            const rawVal = info.getValue();
            let displayVal = "-";

            if (
              rawVal !== undefined &&
              rawVal !== null &&
              rawVal !== ""
            ) {
              if (typeof rawVal === "boolean") {
                displayVal = rawVal
                  ? t("dashboard.yes")
                  : t("dashboard.no");
              } else {
                displayVal = String(rawVal);
              }
            }

            if (isUrgencyField && typeof rawVal === "string" && rawVal.trim() !== "") {
              const levelKey = getUrgencyLevelKey(rawVal);
              return (
                <UrgencyPill $level={levelKey}>
                  {getUrgencyIcon(levelKey)}
                  {displayVal}
                </UrgencyPill>
              );
            }

            return displayVal;
          },
          filterFn: isUrgencyField
            ? (row, columnId, filterValue) => {
                if (!filterValue || filterValue === "") return true;
                const rawVal = row.getValue(columnId);
                if (typeof rawVal !== "string") return false;
                const levelKey = getUrgencyLevelKey(rawVal);
                return levelKey === filterValue;
              }
            : undefined,
        }
      );
    });

    const endCols = [
      columnHelper.accessor("created_at", {
        header: () => t("dashboard.tableCreatedAt"),
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor<(row: Issue) => number | null, number | null>(
        (row: Issue) => row.assigned_to,
        {
          id: "assigned_to",
          header: () => t("dashboard.tableAssignOperator", "Assign Operator"),
          cell: (info) => {
            const issue = info.row.original;
            const assignedVal = info.getValue() !== null && info.getValue() !== undefined ? String(info.getValue()) : "";
            const assignedOp = operators.find((op) => op.id === issue.assigned_to);
            return (
              <>
                <TableSelect
                  value={assignedVal}
                  onChange={(e) =>
                    handleAssignOperator(issue.id, e.target.value as string)
                  }
                  inputProps={{
                    "data-testid": `action-assign-select-${issue.id}`,
                  }}
                  displayEmpty
                  size="small"
                >
                  <MenuItem value="">
                    <em>{t("dashboard.unassigned", "Unassigned")}</em>
                  </MenuItem>
                  {operators.map((op) => (
                    <MenuItem key={op.id} value={String(op.id)}>
                      {op.username}
                    </MenuItem>
                  ))}
                </TableSelect>
                {assignedOp && assignedOp.hub_token && (
                  <div style={{ marginTop: 6 }}>
                    <a
                      href={`/work/hub?token=${assignedOp.hub_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--primary)",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 600,
                      }}
                      data-testid={`operator-hub-link-${issue.id}`}
                    >
                      <LaunchIcon sx={{ fontSize: "0.85rem" }} />
                      {t("operatorHub.viewTask", "View Workload")}
                    </a>
                  </div>
                )}
              </>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            if (filterValue === null || filterValue === undefined || filterValue === "") return true;
            const val = row.getValue(columnId);
            return val === Number(filterValue);
          },
        }
      )
    ];

    return [...baseCols, ...dynamicCols, ...endCols];
  }, [customFields, operators, t, handleAssignOperator]);

  const table = useReactTable({
    data: issues,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const operatorFilterValue = (columnFilters.find((f) => f.id === "assigned_to")?.value as string) || "";
  const urgencyField = customFields.find((f) =>
    ["urgency", "urgencia"].includes(f.name.toLowerCase())
  );
  const urgencyColumnId = urgencyField?.name || "";
  const urgencyFilterValue = urgencyColumnId ? (columnFilters.find((f) => f.id === urgencyColumnId)?.value as string) || "" : "";

  const handleOperatorFilterChange = (val: string) => {
    setColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.id !== "assigned_to");
      if (val !== "") {
        filtered.push({ id: "assigned_to", value: Number(val) });
      }
      return filtered;
    });
  };

  const handleUrgencyFilterChange = (val: string) => {
    if (!urgencyColumnId) return;
    setColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.id !== urgencyColumnId);
      if (val !== "") {
        filtered.push({ id: urgencyColumnId, value: val });
      }
      return filtered;
    });
  };

  if (
    tenant.id !== prevParams.tenantId ||
    currentPage !== prevParams.page ||
    statusFilter !== prevParams.statusFilter
  ) {
    setPrevParams({ tenantId: tenant.id, page: currentPage, statusFilter });
    setLoading(true);
  }

  // Fetch operators on mount/tenant change
  useEffect(() => {
    getOperators()
      .then((res) => setOperators(res))
      .catch((err) => console.error("Failed to fetch operators:", err));
  }, [tenant.id]);

  // Fetch issues whenever tenant, page, or status filter changes
  useEffect(() => {
    let active = true;

    // Page is 1-indexed for the API pagination
    getIssues(tenant.id, statusFilter || undefined, currentPage)
      .then((res) => {
        if (!active) return;
        setIssues(res.results || []);
        setTotalCount(res.count || 0);
        setLoading(false);
      })
      .catch((err) => {
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

  const totalPages = Math.ceil(totalCount / 20) || 1;

  return (
    <DashboardContainer className="animate-fade-in">
      <DashboardHeader>
        <DashboardTitle variant="h5" as="h2">
          <DashboardIcon sx={{ color: "var(--primary)" }} />
          {t("dashboard.title")}
        </DashboardTitle>
      </DashboardHeader>

      <ShareQRSection tenant={tenant} reportingUrl={reportingUrl} />

      <DashboardCard>
        <FilterSection style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <ReportButton
            variant="contained"
            onClick={() => navigate(`/${tenant.id}/report`)}
            data-testid="create-issue-link"
          >
            <AddIcon />
            {t("app.tabReport")}
          </ReportButton>

          <StyledFormControl variant="outlined" size="small">
            <InputLabel id="filter-status-label">
              {t("dashboard.statusFilterLabel")}
            </InputLabel>
            <FilterSelect
              labelId="filter-status-label"
              value={statusFilter}
              label={t("dashboard.statusFilterLabel")}
              onChange={(e) => handleFilterChange(e.target.value as string)}
              disabled={loading}
              inputProps={{ "data-testid": "dashboard-status-filter" }}
            >
              <MenuItem value="">
                <em>{t("dashboard.filterAll")}</em>
              </MenuItem>
              <MenuItem value="pending">
                {t("dashboard.filterPending")}
              </MenuItem>
              <MenuItem value="in_progress">
                {t("dashboard.filterInProgress")}
              </MenuItem>
              <MenuItem value="resolved">
                {t("dashboard.filterResolved")}
              </MenuItem>
            </FilterSelect>
          </StyledFormControl>

          <StyledFormControl variant="outlined" size="small">
            <InputLabel id="filter-operator-label">
              {t("dashboard.operatorFilterLabel", "Operator Filter")}
            </InputLabel>
            <FilterSelect
              labelId="filter-operator-label"
              value={operatorFilterValue}
              label={t("dashboard.operatorFilterLabel", "Operator Filter")}
              onChange={(e) => handleOperatorFilterChange(e.target.value as string)}
              inputProps={{ "data-testid": "dashboard-operator-filter" }}
            >
              <MenuItem value="">
                <em>{t("dashboard.filterAllOperators", "All Operators")}</em>
              </MenuItem>
              {operators.map((op) => (
                <MenuItem key={op.id} value={String(op.id)}>
                  {op.username}
                </MenuItem>
              ))}
            </FilterSelect>
          </StyledFormControl>

          {urgencyColumnId && (
            <StyledFormControl variant="outlined" size="small">
              <InputLabel id="filter-urgency-label">
                {t("dashboard.urgencyFilterLabel", "Urgency Filter")}
              </InputLabel>
              <FilterSelect
                labelId="filter-urgency-label"
                value={urgencyFilterValue}
                label={t("dashboard.urgencyFilterLabel", "Urgency Filter")}
                onChange={(e) => handleUrgencyFilterChange(e.target.value as string)}
                inputProps={{ "data-testid": "dashboard-urgency-filter" }}
              >
                <MenuItem value="">
                  <em>{t("dashboard.filterAllUrgencies", "All Urgencies")}</em>
                </MenuItem>
                <MenuItem value="critical">{t("operatorHub.urgencyCritical", "Critical")}</MenuItem>
                <MenuItem value="high">{t("operatorHub.urgencyHigh", "High")}</MenuItem>
                <MenuItem value="medium">{t("operatorHub.urgencyMedium", "Medium")}</MenuItem>
                <MenuItem value="low">{t("operatorHub.urgencyLow", "Low")}</MenuItem>
                <MenuItem value="normal">{t("operatorHub.urgencyNone", "Normal")}</MenuItem>
              </FilterSelect>
            </StyledFormControl>
          )}
        </FilterSection>
        <TableWrapper>
          <StyledTable aria-label="issues table">
            <StyledTableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <StyledTableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isAssignOperatorCol = header.column.id === "assigned_to";
                    return (
                      <StyledTableHeadCell
                        key={header.id}
                        align={isAssignOperatorCol ? "center" : "left"}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </StyledTableHeadCell>
                    );
                  })}
                </StyledTableRow>
              ))}
            </StyledTableHead>
            <StyledTableBody>
              {loading && table.getRowModel().rows.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell
                    colSpan={columns.length}
                    align="center"
                  >
                    {t("dashboard.loadingIssues")}
                  </StyledTableCell>
                </StyledTableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell
                    colSpan={columns.length}
                    padding="none"
                  >
                    <EmptyState>{t("dashboard.noIssuesFiltered")}</EmptyState>
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const issue = row.original;
                  return (
                    <StyledTableRow
                      key={row.id}
                      data-testid={`issue-row-${issue.id}`}
                      $isCritical={isCriticalUrgency(issue)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isAssignOperatorCol = cell.column.id === "assigned_to";
                        return (
                          <StyledTableCell
                            key={cell.id}
                            align={isAssignOperatorCol ? "center" : "left"}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </StyledTableCell>
                        );
                      })}
                    </StyledTableRow>
                  );
                })
              )}
            </StyledTableBody>
          </StyledTable>
        </TableWrapper>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <PaginationFooter>
            <PaginationInfo>
              {t("dashboard.paginationInfo", {
                page: currentPage,
                totalPages,
                totalCount,
              })}
            </PaginationInfo>
            <PaginationButtons>
              <PaginationButton
                variant="outlined"
                size="small"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                data-testid="pagination-prev"
              >
                {t("dashboard.paginationPrev")}
              </PaginationButton>
              <PaginationButton
                variant="outlined"
                size="small"
                disabled={currentPage >= totalPages || loading}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                data-testid="pagination-next"
              >
                {t("dashboard.paginationNext")}
              </PaginationButton>
            </PaginationButtons>
          </PaginationFooter>
        )}
      </DashboardCard>

      {editingIssue && (
        <EditIssueModal
          open={!!editingIssue}
          issue={editingIssue}
          tenant={tenant}
          operators={operators}
          onClose={() => setEditingIssue(null)}
          onSuccess={(updatedIssue) => {
            setIssues((prev) =>
              prev.map((item) =>
                item.id === updatedIssue.id ? updatedIssue : item,
              ),
            );
            setEditingIssue(null);
          }}
        />
      )}
    </DashboardContainer>
  );
};
