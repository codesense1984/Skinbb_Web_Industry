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
import type { Table as TableType } from "@tanstack/react-table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "../../ui/pagination";

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
    setPageSize,
    previousPage,
    nextPage,
    firstPage,
    lastPage,
  } = table;

  const { pagination } = getState();
  const startEntry = pagination.pageIndex * pagination.pageSize + 1;
  const endEntry = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    total ?? 0,
  );

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 py-1 md:gap-4 md:gap-8"
      role="navigation"
      aria-label={ariaLabel}
    >
      {showPageSizeOptions && (
        <div className="flex flex-1 items-center gap-2">
          <span className="hidden md:block">Rows per page</span>
          <SelectRoot
            value={String(pagination.pageSize)}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              setPageSize(newPageSize);
            }}
          >
            <SelectTrigger className="h-8 w-fit py-1" size="sm">
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

      {showEntryCount && total !== undefined && (
        <div className="text-muted-foreground flex justify-end whitespace-nowrap">
          <p
            className="text-muted-foreground whitespace-nowrap"
            aria-live="polite"
          >
            <span className="text-foreground">
              {startEntry}-{endEntry}
            </span>{" "}
            of <span className="text-foreground">{total}</span>
          </p>
        </div>
      )}

      <Pagination className="w-fit">
        <PaginationContent>
          {/* First page button */}
          <PaginationItem className="hidden md:block">
            <Button
              size="icon"
              variant="outlined"
              className="disabled:bg-muted/50 size-8 disabled:pointer-events-none [&_svg]:size-4"
              onClick={() => firstPage()}
              disabled={!getCanPreviousPage()}
              aria-label="Go to first page"
            >
              <ChevronDoubleLeftIcon aria-hidden="true" />
            </Button>
          </PaginationItem>
          {/* Previous page button */}
          <PaginationItem>
            <Button
              size="icon"
              variant="outlined"
              className="disabled:bg-muted/50 size-8 disabled:pointer-events-none [&_svg]:size-4"
              onClick={() => previousPage()}
              disabled={!getCanPreviousPage()}
              aria-label="Go to previous page"
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Button>
          </PaginationItem>
          {/* Next page button */}
          <PaginationItem>
            <Button
              size="icon"
              variant="outlined"
              className="disabled:bg-muted/50 size-8 disabled:pointer-events-none [&_svg]:size-4"
              onClick={() => nextPage()}
              disabled={!getCanNextPage()}
              aria-label="Go to next page"
            >
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </PaginationItem>
          {/* Last page button */}
          <PaginationItem className="hidden md:block">
            <Button
              size="icon"
              variant="outlined"
              className="disabled:bg-muted/50 size-8 disabled:pointer-events-none [&_svg]:size-4"
              onClick={() => lastPage()}
              disabled={!getCanNextPage()}
              aria-label="Go to last page"
            >
              <ChevronDoubleRightIcon aria-hidden="true" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
