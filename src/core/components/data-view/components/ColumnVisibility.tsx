import React, { useMemo, useCallback } from "react";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { ViewColumnsIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "lucide-react";
import { cn } from "@/core/utils";
import type { ColumnDef } from "@tanstack/react-table";

/**
 * Props for ColumnVisibility component
 * @template TItem - Type of items in the table
 */
interface ColumnVisibilityProps<TItem> {
  columns: ColumnDef<TItem, unknown>[];
  columnVisibility: Record<string, boolean>;
  toggleColumnVisibility: (columnId: string) => void;
}

/**
 * Column visibility control component
 * @template TItem - Type of items in the table
 */
export const ColumnVisibility = React.memo(
  <TItem,>({
    columns,
    columnVisibility,
    toggleColumnVisibility,
  }: ColumnVisibilityProps<TItem>) => {
    const visibleColumns = useMemo(
      () =>
        columns.filter((col) => {
          const id =
            typeof col.id === "string" ? col.id : (col.accessorKey as string);
          return columnVisibility[id] !== false;
        }),
      [columns, columnVisibility],
    );

    const handleToggle = useCallback(
      (columnId: string) => {
        toggleColumnVisibility(columnId);
      },
      [toggleColumnVisibility],
    );

    const columnOptions = useMemo(
      () =>
        columns.map((column) => {
          const id =
            typeof column.id === "string"
              ? column.id
              : (column.accessorKey as string);
          const header =
            typeof column.header === "string" ? column.header : "Column";
          const isVisible = columnVisibility[id] !== false;

          return { id, header, isVisible };
        }),
      [columns, columnVisibility],
    );

    return (
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outlined"
            size="sm"
            aria-label="Column visibility options"
            aria-haspopup="true"
          >
            <ViewColumnsIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {columnOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className="cursor-pointer"
              role="menuitemcheckbox"
              aria-checked={option.isVisible}
            >
              <div className="flex items-center gap-2">
                {option.isVisible && (
                  <CheckIcon className="h-4 w-4" aria-hidden="true" />
                )}
                <span className={cn(!option.isVisible && "opacity-50")}>
                  {option.header}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuRoot>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memoization
    return (
      prevProps.columns === nextProps.columns &&
      prevProps.columnVisibility === nextProps.columnVisibility
    );
  },
) as <TItem>(props: ColumnVisibilityProps<TItem>) => React.ReactElement;

ColumnVisibility.displayName = "ColumnVisibility";
