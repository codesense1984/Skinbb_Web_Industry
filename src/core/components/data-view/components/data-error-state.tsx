import { Button } from "@/core/components/ui/button";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { DataErrorStateProps } from "../types";
import { AlertCircleIcon } from "lucide-react";

/**
 * DataErrorState - Error state with retry and clear filters options
 */
export function DataErrorState({
  error,
  onRetry,
  onClearFilters,
  ariaLabel = "Error state",
}: DataErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-label={ariaLabel}
      className="border-destructive/50 bg-destructive/10 flex flex-col items-center justify-center rounded-md border p-8"
    >
      <AlertCircleIcon
        className="text-destructive mb-4 h-12 w-12"
        aria-hidden="true"
      />
      <h3 className="text-destructive mb-2 text-lg font-semibold">
        Something went wrong
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md text-center">{error}</p>
      <div className="flex gap-2">
        <Button
          onClick={onRetry}
          variant="contained"
          aria-label="Retry loading data"
        >
          <ArrowPathIcon className="mr-2 h-4 w-4" />
          Retry
        </Button>
        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="outlined"
            aria-label="Clear all filters"
          >
            <XMarkIcon className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
