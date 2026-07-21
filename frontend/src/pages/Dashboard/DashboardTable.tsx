import React, { useMemo, useCallback } from "react";
import { MenuItem } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useTranslation } from "react-i18next";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnFiltersState } from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { reorderIssues } from "../../services/api";
import type { Issue, Operator, TenantConfig } from "../../services/types";
import { getUrgencyLevelKey, getUrgencyIcon } from "../../utils/urgency";
import { SortableTableRow } from "./SortableTableRow";
import {
  TableWrapper,
  StyledTable,
  StyledTableHead,
  StyledTableRow,
  StyledTableCell,
  StyledTableHeadCell,
  StatusBadge,
  TableSelect,
  UrgencyPill,
  EmptyState,
  StyledTableBody,
  DragHandleContainer,
  IdCellSpan,
  DescriptionCellSpan,
  HubLinkContainer,
  HubLink,
  StyledCheckbox,
  CheckboxCellContainer,
} from "./Dashboard.styles";

const columnHelper = createColumnHelper<Issue>();

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

import { ColumnHeaderFilter } from "./ColumnHeaderFilter";

export interface DashboardTableProps {
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  operators: Operator[];
  loading: boolean;
  columnFilters: ColumnFiltersState;
  customFields: TenantConfig["custom_fields"];
  onEditIssue: (issue: Issue) => void;
  handleAssignOperator: (issueId: number, operatorIdVal: number | string) => void;
  selectedIds: number[];
  onToggleSelectIssue: (id: number) => void;
  onToggleSelectAll: () => void;
  statusFilter?: string;
  onStatusFilterChange?: (val: string) => void;
  operatorFilterValue?: string;
  onOperatorFilterChange?: (val: string) => void;
  assignedFilter?: string;
  onAssignedFilterChange?: (val: string) => void;
  urgencyFilterValue?: string;
  onUrgencyFilterChange?: (val: string) => void;
}

export const DashboardTable: React.FC<DashboardTableProps> = ({
  issues,
  setIssues,
  operators,
  loading,
  columnFilters,
  customFields = [],
  onEditIssue,
  handleAssignOperator,
  selectedIds,
  onToggleSelectIssue,
  onToggleSelectAll,
  statusFilter = "",
  onStatusFilterChange,
  operatorFilterValue = "",
  onOperatorFilterChange,
  assignedFilter = "",
  onAssignedFilterChange,
  urgencyFilterValue = "",
  onUrgencyFilterChange,
}) => {
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = issues.findIndex((item) => item.id === active.id);
      const newIndex = issues.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newIssues = arrayMove(issues, oldIndex, newIndex);
        setIssues(newIssues);

        const orderedIds = newIssues.map((item) => item.id);
        reorderIssues(orderedIds).catch((err) => {
          console.error("Failed to persist reorder:", err);
          setIssues(issues); // rollback
          alert(t("dashboard.errorReorder"));
        });
      }
    },
    [issues, setIssues, t]
  );

  const columns = useMemo(() => {
    const baseCols = [
      columnHelper.display({
        id: "selection",
        header: () => {
          const assignableIssues = issues.filter((issue) => !["resolved", "wont_fix"].includes(issue.status));
          const allSelected = assignableIssues.length > 0 && assignableIssues.every((issue) => selectedIds.includes(issue.id));
          const someSelected = assignableIssues.some((issue) => selectedIds.includes(issue.id)) && !allSelected;
          return (
            <StyledCheckbox
              type="checkbox"
              ref={(el) => {
                if (el) {
                  el.indeterminate = someSelected;
                }
              }}
              checked={allSelected}
              onChange={onToggleSelectAll}
              data-testid="select-all-checkbox"
              disabled={assignableIssues.length === 0}
            />
          );
        },
        cell: (info) => {
          const issue = info.row.original;
          const isSelected = selectedIds.includes(issue.id);
          const isResolved = ["resolved", "wont_fix"].includes(issue.status);
          return (
            <CheckboxCellContainer onClick={(e) => e.stopPropagation()}>
              {!isResolved && (
                <StyledCheckbox
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelectIssue(issue.id)}
                  data-testid={`select-checkbox-${issue.id}`}
                />
              )}
            </CheckboxCellContainer>
          );
        },
      }),
      columnHelper.display({
        id: "drag-handle",
        header: () => "",
        cell: () => (
          <DragHandleContainer className="drag-handle">
            <DragIndicatorIcon />
          </DragHandleContainer>
        ),
      }),
      columnHelper.accessor("id", {
        header: () => t("dashboard.tableID"),
        cell: (info) => {
          const issue = info.row.original;
          return (
            <IdCellSpan
              onClick={() => onEditIssue(issue)}
              data-testid={`edit-issue-id-${issue.id}`}
            >
              {issue.id}
            </IdCellSpan>
          );
        },
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: () =>
          onStatusFilterChange ? (
            <ColumnHeaderFilter
              title={t("dashboard.tableStatus")}
              selectedValue={statusFilter}
              onSelect={onStatusFilterChange}
              options={[
                { label: t("dashboard.filterAll", "All Statuses"), value: "" },
                { label: t("dashboard.filterPending", "Pending"), value: "pending" },
                { label: t("dashboard.filterInProgress", "In Progress"), value: "in_progress" },
                { label: t("dashboard.kanbanQA", "Verificación (QA)"), value: "qa" },
                { label: t("dashboard.filterResolved", "Resolved"), value: "resolved" },
                { label: t("dashboard.filterBlocked", "Blocked"), value: "blocked" },
                { label: t("dashboard.actionWontFix", "Wont Fix"), value: "wont_fix" },
              ]}
              testId="header-filter-status"
            />
          ) : (
            t("dashboard.tableStatus")
          ),
        cell: (info) => {
          const status = info.getValue();
          return (
            <StatusBadge $status={status}>
              {status === "pending"
                ? t("dashboard.actionPending")
                : status === "in_progress"
                  ? t("dashboard.actionInProgress")
                  : status === "blocked"
                    ? t("dashboard.statusBlocked")
                    : status === "wont_fix"
                      ? t("dashboard.actionWontFix")
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
      columnHelper.accessor("title", {
        header: () => t("dashboard.tableTitle"),
        cell: (info) => {
          const issue = info.row.original;
          return (
            <div
              onClick={() => onEditIssue(issue)}
              style={{ display: "flex", flexDirection: "column", cursor: "pointer", gap: "2px", maxWidth: "240px" }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  color: "var(--text-primary, #ffffff)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "block",
                  maxWidth: "240px"
                }}
                data-testid={`edit-issue-title-${issue.id}`}
              >
                {issue.title}
              </span>
              {issue.description && (
                <DescriptionCellSpan
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(255, 255, 255, 0.5)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "240px",
                    display: "block",
                    padding: 0
                  }}
                  data-testid={`edit-issue-desc-${issue.id}`}
                >
                  {issue.description}
                </DescriptionCellSpan>
              )}
              {(parseFloat(String(issue.total_cost || 0)) > 0 || parseFloat(String(issue.total_time_spent_hours || 0)) > 0) && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {parseFloat(String(issue.total_cost || 0)) > 0 && (
                    <span style={{ color: '#81c784', background: 'rgba(129, 199, 132, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                      {parseFloat(String(issue.total_cost)).toFixed(2)} €
                    </span>
                  )}
                  {parseFloat(String(issue.total_time_spent_hours || 0)) > 0 && (
                    <span style={{ color: '#64b5f6', background: 'rgba(100, 181, 246, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                      {parseFloat(String(issue.total_time_spent_hours)).toFixed(1)} h
                    </span>
                  )}
                </div>
              )}
            </div>
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
          header: () =>
            isUrgencyField && onUrgencyFilterChange ? (
              <ColumnHeaderFilter
                title={field.name.replace(/_/g, " ")}
                selectedValue={urgencyFilterValue}
                onSelect={onUrgencyFilterChange}
                options={[
                  { label: t("dashboard.filterAllUrgencies"), value: "" },
                  { label: t("operatorHub.urgencyCritical"), value: "critical" },
                  { label: t("operatorHub.urgencyHigh"), value: "high" },
                  { label: t("operatorHub.urgencyMedium"), value: "medium" },
                  { label: t("operatorHub.urgencyLow"), value: "low" },
                  { label: t("operatorHub.urgencyNone"), value: "normal" },
                ]}
                testId="header-filter-urgency"
              />
            ) : (
              field.name.replace(/_/g, " ")
            ),
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
              } else if (field.field_type === "select" && field.options) {
                const option = field.options.find(
                  (opt) =>
                    typeof opt === "object" &&
                    opt !== null &&
                    opt.value === rawVal
                );
                if (option && typeof option === "object") {
                  displayVal = option.label;
                } else {
                  displayVal = String(rawVal);
                }
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
          header: () =>
            onOperatorFilterChange && onAssignedFilterChange ? (
              <ColumnHeaderFilter
                title={t("dashboard.tableAssignOperator")}
                selectedValue={operatorFilterValue || assignedFilter}
                onSelect={(val) => {
                  if (val === "true" || val === "false") {
                    onOperatorFilterChange("");
                    onAssignedFilterChange(val);
                  } else {
                    onAssignedFilterChange("");
                    onOperatorFilterChange(val);
                  }
                }}
                options={[
                  { label: t("dashboard.filterAllOperators"), value: "" },
                  { label: t("dashboard.unassigned"), value: "false" },
                  { label: t("dashboard.filterAssigned", "Asignado"), value: "true" },
                  ...operators.map((op) => ({ label: op.username, value: String(op.id) })),
                ]}
                testId="header-filter-operator"
              />
            ) : (
              t("dashboard.tableAssignOperator")
            ),
          cell: (info) => {
            const issue = info.row.original;
            const isResolved = ["resolved", "wont_fix"].includes(issue.status);
            const assignedVal =
              info.getValue() !== null && info.getValue() !== undefined
                ? String(info.getValue())
                : "";
            const assignedOp = operators.find((op) => op.id === issue.assigned_to);
            return (
              <>
                <TableSelect
                  value={assignedVal}
                  onChange={(e) =>
                    handleAssignOperator(issue.id, e.target.value as string)
                  }
                  disabled={isResolved}
                  inputProps={{
                    "data-testid": `action-assign-select-${issue.id}`,
                  }}
                  displayEmpty
                  size="small"
                >
                  <MenuItem value="">
                    <em>{t("dashboard.unassigned")}</em>
                  </MenuItem>
                  {operators.map((op) => (
                    <MenuItem key={op.id} value={String(op.id)}>
                      {op.username}
                    </MenuItem>
                  ))}
                </TableSelect>
                {assignedOp && assignedOp.hub_token && (
                  <HubLinkContainer>
                    <HubLink
                      href={`/work/hub?token=${assignedOp.hub_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`operator-hub-link-${issue.id}`}
                    >
                      <LaunchIcon />
                      {t("operatorHub.viewTask")}
                    </HubLink>
                  </HubLinkContainer>
                )}
              </>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            if (
              filterValue === null ||
              filterValue === undefined ||
              filterValue === ""
            )
              return true;
            const val = row.getValue(columnId);
            return val === Number(filterValue);
          },
        }
      ),
    ];

    return [...baseCols, ...dynamicCols, ...endCols];
  }, [
    customFields,
    operators,
    t,
    handleAssignOperator,
    onEditIssue,
    selectedIds,
    onToggleSelectAll,
    onToggleSelectIssue,
    issues,
    statusFilter,
    onStatusFilterChange,
    operatorFilterValue,
    onOperatorFilterChange,
    assignedFilter,
    onAssignedFilterChange,
    urgencyFilterValue,
    onUrgencyFilterChange,
  ]);

  const table = useReactTable({
    data: issues,
    columns,
    state: {
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <TableWrapper>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
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
                            header.getContext()
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
                <StyledTableCell colSpan={columns.length} align="center">
                  {t("dashboard.loadingIssues")}
                </StyledTableCell>
              </StyledTableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={columns.length} padding="none">
                  <EmptyState>{t("dashboard.noIssuesFiltered")}</EmptyState>
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              <SortableContext
                items={issues.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <SortableTableRow
                    key={row.id}
                    row={row}
                    isCriticalUrgency={isCriticalUrgency}
                  />
                ))}
              </SortableContext>
            )}
          </StyledTableBody>
        </StyledTable>
      </DndContext>
    </TableWrapper>
  );
};
