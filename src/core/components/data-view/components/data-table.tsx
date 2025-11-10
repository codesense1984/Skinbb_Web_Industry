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
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import {
  flexRender,
  type Header,
  type Table as TableType,
} from "@tanstack/react-table";
import React, { useCallback, useEffect, useRef } from "react";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { Button } from "@/core/components/ui/button";
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
  renderCell?: (columnId: string, value: unknown, row: TData) => React.ReactNode;
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
            "group flex h-full w-full items-center gap-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            canSort && "cursor-pointer hover:bg-muted/50",
          )}
          onClick={toggleHandler}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          {canSort && (
            <span className="ml-auto flex items-center gap-1">
              {isSorted === "asc" && (
                <ArrowUpIcon className="h-4 w-4 text-primary" aria-hidden="true" />
              )}
              {isSorted === "desc" && (
                <ArrowDownIcon
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
              )}
              {!isSorted && (
                <BarsArrowUpIcon
                  className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100"
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
  loadingRows = 5,
  showColumnVisibility = true,
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
    <div className="space-y-4">
      {showColumnVisibility && (
        <div className="flex justify-end">
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Toggle columns">
                <ViewColumnsIcon className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) =>
                      column.toggleVisibility(checked)
                    }
                  >
                    {String(column.columnDef.header ?? column.id)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </div>
      )}

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
                        className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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

