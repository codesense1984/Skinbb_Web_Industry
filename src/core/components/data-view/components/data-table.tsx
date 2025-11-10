import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { cn } from "@/core/utils";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BarsArrowUpIcon,
} from "@heroicons/react/24/outline";
import { flexRender, type Header } from "@tanstack/react-table";
import React, { useCallback, useEffect, useRef } from "react";
import type { DataTableProps } from "../types";
import { DataSkeleton } from "./data-skeleton";

/**
 * Sortable table header with keyboard navigation
 */
function SortableHeader<TData>({
  header,
  renderCell,
}: {
  header: Header<TData, unknown>;
  renderCell?: (
    columnId: string,
    value: unknown,
    row: TData,
  ) => React.ReactNode;
}) {
  const canSort = header.column.getCanSort();
  const isSorted = header.column.getIsSorted();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!canSort) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        header.column.toggleSorting();
      }
    },
    [canSort, header],
  );

  const toggleHandler = useCallback(() => {
    if (canSort) {
      header.column.toggleSorting();
    }
  }, [canSort, header]);

  return (
    <TableHead>
      {header.isPlaceholder ? null : (
        <div
          role={canSort ? "button" : undefined}
          tabIndex={canSort ? 0 : undefined}
          aria-pressed={isSorted ? true : undefined}
          aria-label={
            canSort
              ? `Sort by ${String(header.column.columnDef.header)}`
              : undefined
          }
          onKeyDown={handleKeyDown}
          className={cn(
            "group focus:ring-primary flex h-full w-full items-center gap-2 px-3 py-2 focus:ring-2 focus:ring-offset-2 focus:outline-none",
            canSort && "hover:bg-muted/50 cursor-pointer",
          )}
          onClick={toggleHandler}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          {canSort && (
            <span className="ml-auto flex items-center gap-1">
              {isSorted === "asc" && (
                <ArrowUpIcon
                  className="text-primary h-4 w-4"
                  aria-hidden="true"
                />
              )}
              {isSorted === "desc" && (
                <ArrowDownIcon
                  className="text-primary h-4 w-4"
                  aria-hidden="true"
                />
              )}
              {!isSorted && (
                <BarsArrowUpIcon
                  className="text-muted-foreground h-4 w-4 opacity-0 group-hover:opacity-100"
                  aria-hidden="true"
                />
              )}
            </span>
          )}
        </div>
      )}
    </TableHead>
  );
}

/**
 * DataTable component with TanStack Table, keyboard navigation, and accessibility
 */
export function DataTable<TData extends object>({
  table,
  renderCell,
  emptyMessage = "No data available",
  ariaLabel = "Data table",
}: DataTableProps<TData>) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [focusedCell, setFocusedCell] = React.useState<{
    rowIndex: number;
    columnIndex: number;
  } | null>(null);

  // Keyboard navigation for table cells
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedCell || !tableRef.current) return;

      const rows = table.getRowModel().rows;
      const headers = table.getHeaderGroups()[0]?.headers ?? [];
      const maxRow = rows.length - 1;
      const maxCol = headers.length - 1;

      let newRow = focusedCell.rowIndex;
      let newCol = focusedCell.columnIndex;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          newRow = Math.min(newRow + 1, maxRow);
          break;
        case "ArrowUp":
          e.preventDefault();
          newRow = Math.max(newRow - 1, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          newCol = Math.min(newCol + 1, maxCol);
          break;
        case "ArrowLeft":
          e.preventDefault();
          newCol = Math.max(newCol - 1, 0);
          break;
        case "Home":
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            newRow = 0;
          }
          newCol = 0;
          break;
        case "End":
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            newRow = maxRow;
          }
          newCol = maxCol;
          break;
        default:
          return;
      }

      setFocusedCell({ rowIndex: newRow, columnIndex: newCol });

      // Focus the cell
      const cell = tableRef.current?.querySelector(
        `[data-row-index="${newRow}"][data-col-index="${newCol}"]`,
      ) as HTMLElement;
      cell?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedCell, table]);

  const rows = table.getRowModel().rows;
  const headers = table.getHeaderGroups();

  return (
    <div className="rounded-md border">
      <Table ref={tableRef} aria-label={ariaLabel}>
        <TableHeader>
          {headers.map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <SortableHeader
                  key={header.id}
                  header={header}
                  renderCell={renderCell}
                />
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={headers[0]?.headers.length ?? 1}
                className="h-24 text-center"
              >
                <div role="status" aria-live="polite">
                  {emptyMessage}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                data-row-index={rowIndex}
                className="focus-within:bg-muted/50"
              >
                {row.getVisibleCells().map((cell, colIndex) => {
                  const columnId = cell.column.id;
                  const cellValue = cell.getValue();
                  const rowData = row.original;

                  return (
                    <TableCell
                      key={cell.id}
                      data-row-index={rowIndex}
                      data-col-index={colIndex}
                      tabIndex={rowIndex === 0 && colIndex === 0 ? 0 : -1}
                      onFocus={() =>
                        setFocusedCell({ rowIndex, columnIndex: colIndex })
                      }
                      className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    >
                      {renderCell
                        ? renderCell(columnId, cellValue, rowData)
                        : flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * DataTable with loading skeleton
 */
export function DataTableWithSkeleton<TData extends object>(
  props: DataTableProps<TData> & { isLoading?: boolean },
) {
  const { isLoading, ...tableProps } = props;

  if (isLoading) {
    return <DataSkeleton type="table" count={props.loadingRows} />;
  }

  return <DataTable {...tableProps} />;
}
