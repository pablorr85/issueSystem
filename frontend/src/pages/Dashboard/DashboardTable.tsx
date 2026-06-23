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

export interface DashboardTableProps {
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  operators: Operator[];
  loading: boolean;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  customFields: TenantConfig["custom_fields"];
  onEditIssue: (issue: Issue) => void;
  handleAssignOperator: (issueId: number, operatorIdVal: number | string) => void;
}

export const DashboardTable: React.FC<DashboardTableProps> = ({
  issues,
  setIssues,
  operators,
  loading,
  columnFilters,
  setColumnFilters,
  customFields = [],
  onEditIssue,
  handleAssignOperator,
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
        header: () => t("dashboard.tableStatus"),
        cell: (info) => {
          const status = info.getValue();
          return (
            <StatusBadge $status={status}>
              {status === "pending"
                ? t("dashboard.actionPending")
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
            <DescriptionCellSpan
              onClick={() => onEditIssue(issue)}
              data-testid={`edit-issue-desc-${issue.id}`}
            >
              {issue.description}
            </DescriptionCellSpan>
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
          header: () => t("dashboard.tableAssignOperator"),
          cell: (info) => {
            const issue = info.row.original;
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
  }, [customFields, operators, t, handleAssignOperator, onEditIssue]);

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
