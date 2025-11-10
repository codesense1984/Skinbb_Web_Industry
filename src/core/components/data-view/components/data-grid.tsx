import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/utils";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useRef } from "react";
import type { DataGridProps } from "../types";
import { DataSkeleton } from "./data-skeleton";

/**
 * DataGrid component with infinite scroll using Intersection Observer
 */
export function DataGrid<TData extends object>({
  rows,
  renderCard,
  emptyMessage = "No data available",
  isLoading = false,
  loadingItems = 8,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  ariaLabel = "Data grid",
  className,
}: DataGridProps<TData>) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !sentinelRef.current ||
      !hasNextPage ||
      isLoading ||
      isFetchingNextPage
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore?.();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isLoading, isFetchingNextPage, onLoadMore]);

  const handleLoadMoreKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && hasNextPage && !isFetchingNextPage) {
        onLoadMore?.();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore],
  );

  if (rows.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-64 items-center justify-center rounded-md border"
      >
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-4", className)}
      role="grid"
      aria-label={ariaLabel}
    >
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        role="rowgroup"
      >
        {rows.map((row, index) => (
          <div key={index} role="gridcell">
            {renderCard(row, index)}
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="h-10 w-full"
          aria-hidden="true"
          tabIndex={0}
          onKeyDown={handleLoadMoreKeyDown}
          role="button"
          aria-label="Load more items"
        >
          {isFetchingNextPage && (
            <div
              className="flex items-center justify-center py-4"
              role="status"
              aria-live="polite"
            >
              <div className="text-muted-foreground text-sm">
                Loading more...
              </div>
            </div>
          )}
        </div>
      )}

      {isFetchingNextPage && (
        <div role="status" aria-live="polite" aria-label="Loading more items">
          <DataSkeleton type="grid" count={loadingItems} gridColumns={4} />
        </div>
      )}
    </div>
  );
}

/**
 * DataGrid with loading skeleton
 */
export function DataGridWithSkeleton<TData extends object>(
  props: DataGridProps<TData> & { isLoading?: boolean },
) {
  const { isLoading } = props;

  if (isLoading) {
    return (
      <DataSkeleton type="grid" count={props.loadingItems} gridColumns={4} />
    );
  }

  return <DataGrid {...props} />;
}
