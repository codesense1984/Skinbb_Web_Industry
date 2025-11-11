import React from "react";
import { FilterProvider } from "@/core/components/dynamic-filter/context";
import { useDataView, DataViewProvider } from "./context";
import { DataGridWithSkeleton } from "./components/data-grid";
import { DataViewControls } from "./components/data-view-controls";
import { DataErrorState } from "./components/data-error-state";
import { DataEmptyState } from "./components/data-empty-state";
import { DataPagination } from "./components/data-pagination";
import { FilterBadges } from "@/core/components/dynamic-filter/filter-badges";
import type { DataViewColumnDef, ServerDataFetcher, ViewMode } from "./types";
import type { FilterOption } from "@/core/components/dynamic-filter/types";
import { DataTable } from "./components/data-table";

export interface DataViewProps<TData extends object> {
  /**
   * Server-side data fetcher
   */
  fetcher: ServerDataFetcher<TData>;
  /**
   * Column definitions for table view (required for table view)
   */
  columns?: DataViewColumnDef<TData>[];
  /**
   * Custom card renderer for grid view (required for grid view)
   */
  renderCard?: (row: TData, index: number) => React.ReactNode;
  /**
   * Custom cell renderer for table view (optional, falls back to column definition)
   */
  renderCell?: (
    columnId: string,
    value: unknown,
    row: TData,
  ) => React.ReactNode;
  /**
   * Filter components (FilterDataItem components)
   */
  filters?: React.ReactNode;
  /**
   * Initial view mode
   */
  defaultViewMode?: ViewMode;
  /**
   * Initial page size
   */
  defaultPageSize?: number;
  /**
   * Search debounce delay in milliseconds
   */
  searchDebounceMs?: number;
  /**
   * Query key prefix for react-query caching
   */
  queryKeyPrefix?: string;
  /**
   * Enable URL state synchronization
   */
  enableUrlSync?: boolean;
  /**
   * Custom URL parameter names
   */
  urlParams?: {
    search?: string;
    page?: string;
    pageSize?: string;
    sort?: string;
    view?: string;
  };
  /**
   * Empty state message
   */
  emptyMessage?: string | React.ReactNode;
  /**
   * Error state message override
   */
  errorMessage?: string | React.ReactNode;
  /**
   * Show pagination controls
   */
  showPagination?: boolean;
  /**
   * Show column visibility toggle in table view
   */
  showColumnVisibility?: boolean;
  /**
   * Loading skeleton count
   */
  loadingRows?: number;
  /**
   * ARIA labels
   */
  ariaLabels?: {
    table?: string;
    grid?: string;
    search?: string;
    pagination?: string;
  };
  /**
   * Search input placeholder
   */
  searchPlaceholder?: string;
  /**
   * Additional controls to render in the controls bar
   */
  additionalControls?: React.ReactNode;
  /**
   * Default filter values to initialize filters with
   * Format: { filterKey: [{ label: string, value: string }] }
   */
  defaultFilters?: Record<string, FilterOption[]>;
  /**
   * Grid container className
   */
  gridClassName?: string;
  tableClassName?: string;
}

/**
 * DataView - Main component that provides table and grid views with filtering, search, and pagination
 */
export function DataView<TData extends object>({
  fetcher,
  columns,
  renderCard,
  renderCell,
  filters,
  defaultViewMode = "table",
  defaultPageSize = 10,
  searchDebounceMs = 400,
  queryKeyPrefix = "data-view",
  enableUrlSync = true,
  urlParams,
  emptyMessage = "No data available",
  errorMessage,
  showPagination = true,
  showColumnVisibility = true,
  loadingRows = 5,
  ariaLabels = {},
  additionalControls,
  defaultFilters,
  gridClassName,
  tableClassName,
}: DataViewProps<TData>) {
  // Determine available view modes
  const hasTable = !!columns;
  const hasGrid = !!renderCard;

  // Auto-determine view mode if only one is available
  const resolvedDefaultViewMode = React.useMemo(() => {
    if (!hasTable && hasGrid) return "grid";
    if (hasTable && !hasGrid) return "table";
    return defaultViewMode;
  }, [hasTable, hasGrid, defaultViewMode]);

  // Hide toggle if only one view mode is available
  const hideViewToggle = !hasTable || !hasGrid;

  // Validate that at least one view mode is provided
  if (!hasTable && !hasGrid) {
    throw new Error(
      "DataView requires either 'columns' (for table view) or 'renderCard' (for grid view), or both.",
    );
  }

  return (
    <FilterProvider defaultValue={defaultFilters}>
      <DataViewProvider
        fetcher={fetcher}
        columns={columns || []}
        defaultViewMode={resolvedDefaultViewMode}
        defaultPageSize={defaultPageSize}
        searchDebounceMs={searchDebounceMs}
        queryKeyPrefix={queryKeyPrefix}
        enableUrlSync={enableUrlSync}
        urlParams={urlParams}
      >
        <DataViewInner
          renderCard={renderCard}
          renderCell={renderCell}
          filters={filters}
          emptyMessage={emptyMessage}
          errorMessage={errorMessage}
          showPagination={showPagination}
          showColumnVisibility={showColumnVisibility}
          loadingRows={loadingRows}
          ariaLabels={ariaLabels}
          additionalControls={additionalControls}
          gridClassName={gridClassName}
          tableClassName={tableClassName}
          hideViewToggle={hideViewToggle}
          hasTable={hasTable}
          hasGrid={hasGrid}
        />
      </DataViewProvider>
    </FilterProvider>
  );
}

/**
 * Inner component that uses the DataView context
 */
function DataViewInner<TData extends object>({
  renderCard,
  renderCell,
  filters,
  emptyMessage,
  errorMessage,
  showPagination,
  showColumnVisibility,
  loadingRows = 5,
  ariaLabels,
  searchPlaceholder,
  additionalControls,
  gridClassName,
  hideViewToggle = false,
  hasTable = true,
  hasGrid = true,
}: Omit<
  DataViewProps<TData>,
  | "fetcher"
  | "columns"
  | "defaultViewMode"
  | "defaultPageSize"
  | "searchDebounceMs"
  | "queryKeyPrefix"
  | "enableUrlSync"
  | "urlParams"
> & {
  hideViewToggle?: boolean;
  hasTable?: boolean;
  hasGrid?: boolean;
}) {
  const {
    viewMode,
    setViewMode,
    search,
    setSearch,
    filters: contextFilters,
    setFilters,
    data,
    total,
    isLoading,
    isRefetching,
    error,
    refetch,
    table,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useDataView<TData>();

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
  };

  // Create setFilterValue adapter for FilterBadges
  const setFilterValue = React.useCallback(
    (updater: React.SetStateAction<Record<string, FilterOption[]>>) => {
      const newFilters =
        typeof updater === "function" ? updater(contextFilters) : updater;
      setFilters(newFilters);
    },
    [contextFilters, setFilters],
  );

  // Handle retry
  const handleRetry = () => {
    refetch();
  };

  // Memoize load more callback to prevent grid re-renders
  const handleLoadMore = React.useCallback(() => {
    fetchNextPage?.();
  }, [fetchNextPage]);

  // Track data length for announcements
  const prevDataLengthRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (data) prevDataLengthRef.current = data.length;
  }, [data]);

  // Error state
  if (error && !isLoading) {
    return (
      <div className="space-y-4">
        <DataViewControls
          table={table ?? undefined}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          searchAriaLabel={ariaLabels?.search}
          hideViewToggle={hideViewToggle}
        >
          {additionalControls}
        </DataViewControls>
        <DataErrorState
          error={
            errorMessage ? String(errorMessage) : error || "An error occurred"
          }
          onRetry={handleRetry}
          onClearFilters={handleClearFilters}
          ariaLabel={ariaLabels?.search}
        />
      </div>
    );
  }

  // Empty state
  const isEmpty = !isLoading && !isRefetching && (!data || data.length === 0);
  const hasFilters =
    Object.keys(contextFilters).length > 0 || search.length > 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <DataViewControls
        table={table ?? undefined}
        showColumnVisibility={showColumnVisibility}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        searchPlaceholder={searchPlaceholder}
        searchAriaLabel={ariaLabels?.search}
        hideViewToggle={hideViewToggle}
      >
        {additionalControls}
      </DataViewControls>

      {/* Filter Badges - Show active filters with remove functionality */}
      {Object.keys(contextFilters)?.length > 0 && (
        <FilterBadges
          filters={contextFilters}
          setFilterValue={setFilterValue}
        />
      )}

      {/* Content */}
      {viewMode === "table" ? (
        <>
          {hasTable && table && (
            <>
              <DataTable
                table={table}
                renderCell={renderCell}
                emptyMessage={emptyMessage}
                loadingRows={loadingRows}
                isLoading={isLoading}
                showColumnVisibility={showColumnVisibility}
                ariaLabel={ariaLabels?.table}
              />
              {showPagination && (
                <DataPagination
                  table={table}
                  total={total}
                  ariaLabel={ariaLabels?.pagination}
                />
              )}
            </>
          )}
        </>
      ) : (
        <>
          {hasGrid ? (
            <>
              {isEmpty && hasFilters ? (
                <DataEmptyState
                  message={emptyMessage}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <DataGridWithSkeleton
                  rows={data ?? []}
                  renderCard={renderCard!}
                  emptyMessage={emptyMessage}
                  loadingItems={(loadingRows ?? 5) * 2}
                  isLoading={isLoading}
                  hasNextPage={hasNextPage ?? false}
                  isFetchingNextPage={isFetchingNextPage ?? false}
                  onLoadMore={handleLoadMore}
                  ariaLabel={ariaLabels?.grid}
                  className={gridClassName}
                />
              )}
            </>
          ) : null}
        </>
      )}

      {/* Screen reader announcements */}
      {!isLoading && data && data.length !== prevDataLengthRef.current && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {data.length === 0
            ? "No results found"
            : `${data.length} ${data.length === 1 ? "result" : "results"} found`}
        </div>
      )}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isLoading && "Loading data..."}
        {!isLoading && isEmpty && "No data available"}
      </div>
    </div>
  );
}
