import React, { useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { Button } from "@/core/components/ui/button";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

/**
 * Props for TableView component
 * @template TItem - Type of items in the table
 */
interface TableViewProps<TItem> {
  columns: ColumnDef<TItem, unknown>[];
  data: TItem[];
  isLoading: boolean;
  getRowId: (item: TItem) => string;
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;
  onSortChange: (sortBy?: string, order?: "asc" | "desc") => void;
  sortBy?: string;
  order?: "asc" | "desc";
}

/**
 * Table view component with sorting and column visibility
 * @template TItem - Type of items in the table
 */
export const TableView = React.memo(
  <TItem,>({
    columns,
    data,
    isLoading,
    getRowId,
    columnVisibility,
    setColumnVisibility,
    onSortChange,
    sortBy,
    order,
  }: TableViewProps<TItem>) => {
    const sorting: SortingState = useMemo(() => {
      if (!sortBy) return [];
      return [{ id: sortBy, desc: order === "desc" }];
    }, [sortBy, order]);

    const handleSortingChange = useCallback(
      (updater: SortingState | ((prev: SortingState) => SortingState)) => {
        const newSorting =
          typeof updater === "function" ? updater(sorting) : updater;
        const firstSort = newSorting[0];
        if (firstSort) {
          onSortChange(firstSort.id, firstSort.desc ? "desc" : "asc");
        } else {
          onSortChange(undefined, undefined);
        }
      },
      [sorting, onSortChange],
    );

    const handleColumnVisibilityChange = useCallback(
      (
        updater:
          | Record<string, boolean>
          | ((prev: Record<string, boolean>) => Record<string, boolean>),
      ) => {
        const newVisibility =
          typeof updater === "function" ? updater(columnVisibility) : updater;
        setColumnVisibility(newVisibility);
      },
      [columnVisibility, setColumnVisibility],
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      state: {
        sorting,
        columnVisibility,
      },
      onSortingChange: handleSortingChange,
      onColumnVisibilityChange: handleColumnVisibilityChange,
      getRowId: (row) => getRowId(row),
      manualPagination: true,
      manualSorting: true,
      pageCount: -1,
    });

    const handleHeaderClick = useCallback(
      (header: ReturnType<typeof table.getHeaderGroups>[0]["headers"][0]) => {
        if (header.column.getCanSort()) {
          header.column.toggleSorting();
        }
      },
      [],
    );

    const handleRowKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTableRowElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Handle row action if needed
        }
      },
      [],
    );

    const allColumns = useMemo(() => table.getAllColumns(), [table]);

    return (
      <div className="bg-background rounded-2xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table role="table" aria-label="Data table">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(canSort && "cursor-pointer select-none")}
                        onClick={() => handleHeaderClick(header)}
                        aria-sort={
                          isSorted === "asc"
                            ? "ascending"
                            : isSorted === "desc"
                              ? "descending"
                              : "none"
                        }
                        scope="col"
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort && (
                            <div className="flex flex-col" aria-hidden="true">
                              <ChevronUpIcon
                                className={cn(
                                  "h-3 w-3",
                                  isSorted === "asc"
                                    ? "text-primary"
                                    : "text-muted-foreground/40",
                                )}
                              />
                              <ChevronDownIcon
                                className={cn(
                                  "-mt-1 h-3 w-3",
                                  isSorted === "desc"
                                    ? "text-primary"
                                    : "text-muted-foreground/40",
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow
                    key={`loading-${index}`}
                    className="animate-pulse"
                    aria-busy="true"
                  >
                    {allColumns.map((column) => (
                      <TableCell key={`loading-cell-${index}-${column.id}`}>
                        <div
                          className="bg-muted h-6 w-full rounded"
                          aria-hidden="true"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/50 transition-colors"
                    tabIndex={0}
                    onKeyDown={handleRowKeyDown}
                    role="row"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} role="gridcell">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={allColumns.length}
                    className="h-32 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-muted-foreground">No results found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memoization
    return (
      prevProps.data === nextProps.data &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.sortBy === nextProps.sortBy &&
      prevProps.order === nextProps.order &&
      prevProps.columnVisibility === nextProps.columnVisibility &&
      prevProps.columns === nextProps.columns
    );
  },
) as <TItem>(props: TableViewProps<TItem>) => React.ReactElement;

// TableView.displayName = "TableView";
