import React, { useMemo, useCallback } from "react";
import { Button } from "@/core/components/ui/button";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

/**
 * Props for Pagination component
 */
interface PaginationProps {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

/**
 * Pagination component with page navigation and page size selection
 */
export const Pagination = React.memo<PaginationProps>(
  ({
    page,
    limit,
    totalRecords,
    totalPages,
    pageSizeOptions = [10, 20, 50, 100],
    onPageChange,
    onLimitChange,
  }) => {
    const start = useMemo(
      () => (totalRecords === 0 ? 0 : (page - 1) * limit + 1),
      [totalRecords, page, limit],
    );
    const end = useMemo(
      () => Math.min(page * limit, totalRecords),
      [page, limit, totalRecords],
    );

    const handleFirstPage = useCallback(() => {
      onPageChange(1);
    }, [onPageChange]);

    const handlePreviousPage = useCallback(() => {
      onPageChange(page - 1);
    }, [onPageChange, page]);

    const handleNextPage = useCallback(() => {
      onPageChange(page + 1);
    }, [onPageChange, page]);

    const handleLastPage = useCallback(() => {
      onPageChange(totalPages);
    }, [onPageChange, totalPages]);

    const handleLimitChange = useCallback(
      (value: string) => {
        onLimitChange(parseInt(value, 10));
      },
      [onLimitChange],
    );

    const paginationLabel = useMemo(
      () => `Pagination: Showing ${start} to ${end} of ${totalRecords} results`,
      [start, end, totalRecords],
    );

    return (
      <div
        className="flex flex-col gap-4 rounded-2xl border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        role="navigation"
        aria-label={paginationLabel}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span aria-live="polite" aria-atomic="true">
            {start}–{end} of {totalRecords}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="page-size-select" className="text-sm text-muted-foreground">
              Rows per page:
            </label>
            <SelectRoot
              value={limit.toString()}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="w-20" id="page-size-select" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>

          <div className="flex items-center gap-1" role="group" aria-label="Page navigation">
            <Button
              variant="outlined"
              size="sm"
              onClick={handleFirstPage}
              disabled={page === 1}
              aria-label="First page"
              aria-disabled={page === 1}
            >
              <ChevronDoubleLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={handlePreviousPage}
              disabled={page === 1}
              aria-label="Previous page"
              aria-disabled={page === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <div className="flex items-center gap-1 px-2 text-sm" aria-current="page">
              <span className="text-muted-foreground">Page</span>
              <span className="font-medium">{page}</span>
              <span className="text-muted-foreground">of</span>
              <span className="font-medium">{totalPages}</span>
            </div>
            <Button
              variant="outlined"
              size="sm"
              onClick={handleNextPage}
              disabled={page >= totalPages}
              aria-label="Next page"
              aria-disabled={page >= totalPages}
            >
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={handleLastPage}
              disabled={page >= totalPages}
              aria-label="Last page"
              aria-disabled={page >= totalPages}
            >
              <ChevronDoubleRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memoization
    return (
      prevProps.page === nextProps.page &&
      prevProps.limit === nextProps.limit &&
      prevProps.totalRecords === nextProps.totalRecords &&
      prevProps.totalPages === nextProps.totalPages &&
      prevProps.pageSizeOptions === nextProps.pageSizeOptions
    );
  },
);

Pagination.displayName = "Pagination";
