import React, { useEffect, useRef, useCallback } from "react";

/**
 * Props for GridView component
 * @template TItem - Type of items in the grid
 */
interface GridViewProps<TItem> {
  items: TItem[];
  renderCard: (item: TItem) => React.ReactNode;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

/**
 * Grid view component with infinite scroll
 * @template TItem - Type of items in the grid
 */
export const GridView = React.memo(
  <TItem,>({
    items,
    renderCard,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  }: GridViewProps<TItem>) => {
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for infinite scroll
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
          if (
            entries[0]?.isIntersecting &&
            hasNextPage &&
            !isFetchingNextPage
          ) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 },
      );

      observer.observe(sentinelRef.current);

      return () => {
        observer.disconnect();
      };
    }, [hasNextPage, isLoading, isFetchingNextPage, fetchNextPage]);

    const handleSentinelKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      [hasNextPage, isFetchingNextPage, fetchNextPage],
    );

    if (isLoading && items.length === 0) {
      return (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
          role="grid"
          aria-label="Loading grid"
          aria-busy="true"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`loading-grid-${index}`}
              className="animate-pulse"
              role="gridcell"
            >
              <div className="bg-muted space-y-3 rounded-2xl p-4 shadow-sm">
                <div
                  className="bg-muted-foreground/20 h-32 w-full rounded-lg"
                  aria-hidden="true"
                />
                <div
                  className="bg-muted-foreground/20 h-4 w-3/4 rounded"
                  aria-hidden="true"
                />
                <div
                  className="bg-muted-foreground/20 h-3 w-1/2 rounded"
                  aria-hidden="true"
                />
                <div
                  className="bg-muted-foreground/20 h-3 w-2/3 rounded"
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div
          className="bg-background w-full rounded-2xl p-12 text-center shadow-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground text-lg font-medium">
              No data yet
            </p>
            <p className="text-muted-foreground text-sm">
              Get started by adding your first item.
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
          role="grid"
          aria-label="Data grid"
        >
          {items.map((item, index) => (
            <div key={index} role="gridcell">
              {renderCard(item)}
            </div>
          ))}
        </div>

        {/* Sentinel for infinite scroll */}
        {hasNextPage && (
          <div
            ref={sentinelRef}
            className="h-10 w-full"
            aria-hidden="true"
            tabIndex={0}
            onKeyDown={handleSentinelKeyDown}
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
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memoization
    return (
      prevProps.items === nextProps.items &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.isFetchingNextPage === nextProps.isFetchingNextPage &&
      prevProps.hasNextPage === nextProps.hasNextPage &&
      prevProps.renderCard === nextProps.renderCard
    );
  },
) as <TItem>(props: GridViewProps<TItem>) => React.ReactElement;

(GridView as React.ComponentType<GridViewProps<unknown>>).displayName =
  "GridView";
