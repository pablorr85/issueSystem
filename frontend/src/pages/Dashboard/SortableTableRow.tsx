import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender } from "@tanstack/react-table";
import type { Row } from "@tanstack/react-table";
import type { Issue } from "../../services/types";
import { StyledTableRow, StyledTableCell } from "./Dashboard.styles";

export interface SortableTableRowProps {
  row: Row<Issue>;
  isCriticalUrgency: (issue: Issue) => boolean;
}

export const SortableTableRow: React.FC<SortableTableRowProps> = ({
  row,
  isCriticalUrgency,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.original.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 2 : 1,
    position: 'relative' as const,
  };

  const issue = row.original;

  return (
    <StyledTableRow
      ref={setNodeRef}
      style={style}
      data-testid={`issue-row-${issue.id}`}
      $isCritical={isCriticalUrgency(issue)}
    >
      {row.getVisibleCells().map((cell) => {
        const isAssignOperatorCol = cell.column.id === "assigned_to";
        const isDragHandleCol = cell.column.id === "drag-handle";

        const dragProps = isDragHandleCol ? { ...attributes, ...listeners } : {};

        return (
          <StyledTableCell
            key={cell.id}
            align={isAssignOperatorCol ? "center" : "left"}
            {...dragProps}
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
};
