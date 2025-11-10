import { Button } from "@/core/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React from "react";
import type { DataEmptyStateProps } from "../types";

/**
 * DataEmptyState - Empty state with clear filters option
 */
export function DataEmptyState({
  message = "No data found",
  onClearFilters,
  ariaLabel = "Empty state",
}: DataEmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className="flex flex-col items-center justify-center rounded-md border p-8"
    >
      <p className="text-muted-foreground mb-4 text-center">{message}</p>
      {onClearFilters && (
        <Button
          onClick={onClearFilters}
          variant="outline"
          size="sm"
          aria-label="Clear all filters"
        >
          <XMarkIcon className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

