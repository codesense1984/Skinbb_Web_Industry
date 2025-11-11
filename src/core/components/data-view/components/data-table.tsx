import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { cn } from "@/core/utils";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { flexRender, type Header } from "@tanstack/react-table";
import React, { useCallback, useEffect, useRef } from "react";
import type { DataTableProps } from "../types";

/**
 * Sortable table header with keyboard navigation
 */
function SortableHeader<TData>({ header }: { header: Header<TData, unknown> }) {
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
    <>
      {header.isPlaceholder ? null : header.column.getCanSort() ? (
        <div
          className={cn(
            isSorted &&
              "flex h-full cursor-pointer items-center justify-between gap-2 select-none",
          )}
          onClick={toggleHandler}
          onKeyDown={handleKeyDown}
          tabIndex={isSorted ? 0 : undefined}
        >
          <span className="truncate">
            {flexRender(header.column.columnDef.header, header.getContext())}
          </span>
          {{
            asc: (
              <ChevronUpIcon
                className="size-4 shrink-0 opacity-60"
                aria-hidden="true"
              />
            ),
            desc: (
              <ChevronDownIcon
                className="size-4 shrink-0 opacity-60"
                aria-hidden="true"
              />
            ),
          }[isSorted as string] ?? null}
        </div>
      ) : (
        flexRender(header.column.columnDef.header, header.getContext())
      )}
    </>
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
  isLoading = false,
  className,
  loadingRows = 5,
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
    <Table
      ref={tableRef}
      aria-label={ariaLabel}
      className={cn("table-fixed", className)}
    >
      <TableHeader>
        {headers.map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead
                key={header.id}
                scope="col"
                aria-sort={
                  header.column.getCanSort()
                    ? header.column.getIsSorted() === "asc"
                      ? "ascending"
                      : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : "none"
                    : undefined
                }
                className={
                  cn()
                  // "first:pl-0 last:pr-0",
                  // index === 0 && "first:pl-2",
                  // index === group.headers.length - 1 && "last:pr-2",
                }
                style={{
                  width: `${header.getSize()}px`,
                }}
              >
                {/* {!header.isPlaceholder && <SortableHeader header={header} />} */}
                {<SortableHeader key={header.id} header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: loadingRows }).map((_, index) => (
            <TableRow key={`loading-${index}`} className="animate-pulse">
              {table.getAllColumns().map((column) => (
                <TableCell key={`loading-cell-${index}-${column.id}`}>
                  <div className="bg-muted h-6 w-full rounded"></div>
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : table.getRowModel().rows.length ? (
          rows.map((row, rowIndex) => (
            <TableRow
              key={row.id}
              data-row-index={rowIndex}
              className="hover:bg-muted/50 focus-within:bg-muted/50"
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
        ) : (
          <TableRow>
            <TableCell
              colSpan={headers[0]?.headers.length ?? 1}
              className="min-h-30 text-center"
              data-cell="empty"
            >
              {emptyMessage ?? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex h-[228px] items-center justify-center"
                >
                  {emptyMessage ?? "No result found."}
                </div>
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

/**
 * DataTable with loading skeleton
 */
export function DataTableWithSkeleton<TData extends object>(
  props: DataTableProps<TData> & { isLoading?: boolean },
) {
  const { isLoading, ...tableProps } = props;

  // if (isLoading) {
  //   return <DataSkeleton type="table" count={props.loadingRows} />;
  // }

  return <DataTable {...tableProps} />;
}
