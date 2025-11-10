import { Button } from "@/core/components/ui/button";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { cn } from "@/core/utils";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { Table as TableType } from "@tanstack/react-table";
import React from "react";

interface DataPaginationProps<TData> {
  table: TableType<TData>;
  total?: number;
  showEntryCount?: boolean;
  showPageSizeOptions?: boolean;
  pageSizeOptions?: number[];
  ariaLabel?: string;
}

/**
 * DataPagination - Pagination controls for data table
 */
export function DataPagination<TData>({
  table,
  total,
  showEntryCount = true,
  showPageSizeOptions = true,
  pageSizeOptions = [10, 20, 50, 100],
  ariaLabel = "Table pagination",
}: DataPaginationProps<TData>) {
  const {
    getState,
    getCanPreviousPage,
    getCanNextPage,
    getPageCount,
    setPageIndex,
    setPageSize,
    previousPage,
    nextPage,
    firstPage,
    lastPage,
  } = table;

  const { pagination } = getState();
  const pageCount = total ? Math.ceil(total / pagination.pageSize) : getPageCount();
  const currentPage = pagination.pageIndex + 1;
  const startEntry = pagination.pageIndex * pagination.pageSize + 1;
  const endEntry = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    total ?? 0,
  );

  return (
    <div
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      role="navigation"
      aria-label={ariaLabel}
    >
      {showEntryCount && total !== undefined && (
        <div className="text-sm text-muted-foreground">
          Showing {startEntry} to {endEntry} of {total} entries
        </div>
      )}

      <div className="flex items-center gap-2">
        {showPageSizeOptions && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <SelectRoot
              value={String(pagination.pageSize)}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                // Use table's setPageSize which will trigger onPaginationChange
                // The onPaginationChange handler will reset pageIndex to 0 automatically
                setPageSize(newPageSize);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => firstPage()}
            disabled={!getCanPreviousPage()}
            aria-label="Go to first page"
          >
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => previousPage()}
            disabled={!getCanPreviousPage()}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 px-2 text-sm">
            <span>
              Page {currentPage} of {pageCount || 1}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => nextPage()}
            disabled={!getCanNextPage()}
            aria-label="Go to next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => lastPage()}
            disabled={!getCanNextPage()}
            aria-label="Go to last page"
          >
            <ChevronDoubleRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

