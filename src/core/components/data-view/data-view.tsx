import React from "react";
import { FilterProvider } from "@/core/components/dynamic-filter/context";
import { useDataView, DataViewProvider } from "./context";
import { DataTableWithSkeleton } from "./components/data-table";
import { DataGridWithSkeleton } from "./components/data-grid";
import { DataViewControls } from "./components/data-view-controls";
import { DataErrorState } from "./components/data-error-state";
import { DataEmptyState } from "./components/data-empty-state";
import { DataPagination } from "./components/data-pagination";
import type { DataViewColumnDef, ServerDataFetcher, ViewMode } from "./types";

export interface DataViewProps<TData extends object> {
  /**
   * Server-side data fetcher
   */
  fetcher: ServerDataFetcher<TData>;
  /**
   * Column definitions for table view
   */
  columns: DataViewColumnDef<TData>[];
  /**
   * Custom card renderer for grid view
   */
  renderCard: (row: TData, index: number) => React.ReactNode;
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
}: DataViewProps<TData>) {
  return (
    <FilterProvider>
      <DataViewProvider
        fetcher={fetcher}
        columns={columns}
        defaultViewMode={defaultViewMode}
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
  loadingRows,
  ariaLabels,
  searchPlaceholder,
  additionalControls,
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
>) {
  const {
    viewMode,
    setViewMode,
    search,
    setSearch,
    filters: contextFilters,
    setFilters,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
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

  // Handle retry
  const handleRetry = () => {
    refetch();
  };

  // Error state
  if (error && !isLoading) {
    return (
      <div className="space-y-4">
        <DataViewControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          searchAriaLabel={ariaLabels?.search}
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        searchPlaceholder={searchPlaceholder}
        searchAriaLabel={ariaLabels?.search}
      >
        {additionalControls}
      </DataViewControls>

      {/* Content */}
      {viewMode === "table" ? (
        <>
          {table && (
            <>
              <DataTableWithSkeleton
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
          {isEmpty && hasFilters ? (
            <DataEmptyState
              message={emptyMessage}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <DataGridWithSkeleton
              rows={data ?? []}
              renderCard={renderCard}
              emptyMessage={emptyMessage}
              loadingItems={(loadingRows ?? 5) * 2}
              isLoading={isLoading}
              hasNextPage={hasNextPage ?? false}
              isFetchingNextPage={isFetchingNextPage ?? false}
              onLoadMore={() => {
                fetchNextPage?.();
              }}
              ariaLabel={ariaLabels?.grid}
            />
          )}
        </>
      )}

      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isLoading && "Loading data..."}
        {!isLoading && isEmpty && "No data available"}
        {!isLoading && !isEmpty && data && `${data.length} items displayed`}
      </div>
    </div>
  );
}
