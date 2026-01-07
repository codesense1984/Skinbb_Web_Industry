import type { DataEmptyStateProps } from "../types";

/**
 * DataEmptyState - Empty state with clear filters option
 */
export function DataEmptyState({
  message = "No data found",
  // onClearFilters,
  ariaLabel = "Empty state",
}: DataEmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className="bg-background flex flex-col items-center justify-center rounded-md border p-12"
    >
      <p className="text-muted-foreground text-center">{message}</p>
      {/* {onClearFilters && (
        <Button
          onClick={onClearFilters}
          variant="outlined"
          size="sm"
          aria-label="Clear all filters"
        >
          <XMarkIcon className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )} */}
    </div>
  );
}
