import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { ColumnVisibility } from "./components/ColumnVisibility";
import { GridView } from "./components/GridView";
import { Pagination } from "./components/Pagination";
import { TableView } from "./components/TableView";
import { useDataViewContext } from "./context";
import { useDataViewQuery } from "./hooks";
import type { DataViewFilters, DataViewProps } from "./types";
import { useDebounce } from "./utils/useDebounce";
import {
  extractTableData,
  extractGridData,
  extractTableTotalRecords,
  extractGridTotalRecords,
  extractTableTotalPages,
  extractGridTotalPages,
} from "./utils/extractData";

/**
 * Error state component
 */
const ErrorState = React.memo<{
  error: Error | null;
  onRetry: () => void;
}>(({ error, onRetry }) => (
  <div
    className="bg-background rounded-2xl border p-12 text-center shadow-sm"
    role="alert"
    aria-live="assertive"
  >
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-destructive text-lg font-medium">Error loading data</p>
      <p className="text-muted-foreground text-sm">
        {error?.message || "An error occurred"}
      </p>
      <Button
        onClick={onRetry}
        variant="outlined"
        aria-label="Retry loading data"
      >
        Retry
      </Button>
    </div>
  </div>
));
ErrorState.displayName = "ErrorState";

/**
 * Empty state component
 */
const EmptyState = React.memo<{
  onClearFilters: () => void;
}>(({ onClearFilters }) => (
  <div
    className="bg-background rounded-2xl border p-12 text-center shadow-sm"
    role="status"
    aria-live="polite"
  >
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-lg font-medium">No results for current filters</p>
      <Button
        onClick={onClearFilters}
        variant="outlined"
        aria-label="Clear all filters"
      >
        Clear filters
      </Button>
    </div>
  </div>
));
EmptyState.displayName = "EmptyState";

/**
 * View toggle buttons component
 */
const ViewToggle = React.memo<{
  currentView: "table" | "grid";
  onViewChange: (view: "table" | "grid") => void;
}>(({ currentView, onViewChange }) => (
  <div
    className="ml-auto flex items-center gap-1 rounded-lg border p-1"
    role="group"
    aria-label="View mode"
  >
    <Button
      variant={currentView === "table" ? "contained" : "ghost"}
      size="sm"
      onClick={() => onViewChange("table")}
      aria-pressed={currentView === "table"}
      aria-label="Table view"
    >
      <TableCellsIcon className="h-4 w-4" aria-hidden="true" />
    </Button>
    <Button
      variant={currentView === "grid" ? "contained" : "ghost"}
      size="sm"
      onClick={() => onViewChange("grid")}
      aria-pressed={currentView === "grid"}
      aria-label="Grid view"
    >
      <Squares2X2Icon className="h-4 w-4" aria-hidden="true" />
    </Button>
  </div>
));
ViewToggle.displayName = "ViewToggle";

/**
 * Search input component
 */
const SearchInput = React.memo<{
  value: string;
  onChange: (value: string) => void;
}>(({ value, onChange }) => (
  <Input
    type="text"
    placeholder="Search..."
    startIcon={<MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full max-w-36"
    aria-label="Search"
  />
));
SearchInput.displayName = "SearchInput";

/**
 * Toolbar component
 */
const Toolbar = React.memo<{
  view: "table" | "grid";
  searchInput: string;
  onSearchChange: (value: string) => void;
  onViewChange: (view: "table" | "grid") => void;
  actions?: React.ReactNode;
  columnVisibility?: React.ReactNode;
}>(
  ({
    view,
    searchInput,
    onSearchChange,
    onViewChange,
    actions,
    columnVisibility,
  }) => {
    if (!actions && !columnVisibility) return null;

    return (
      <div
        className="flex items-center justify-between gap-4"
        role="toolbar"
        aria-label="Data view toolbar"
      >
        <div className="flex flex-1 flex-wrap items-center gap-4">
          {actions}
          <ViewToggle currentView={view} onViewChange={onViewChange} />
          <SearchInput value={searchInput} onChange={onSearchChange} />
          {columnVisibility}
        </div>
      </div>
    );
  },
);
Toolbar.displayName = "Toolbar";

/**
 * Main DataView component
 * Provides a flexible data view with table and grid modes, filtering, sorting, and pagination
 * @template TItem - Type of items to display
 * @template TFilters - Filter type extending DataViewFilters
 */
export function DataView<
  TItem,
  TFilters extends DataViewFilters = DataViewFilters,
>({
  title,
  fetcher,
  columns,
  renderCard,
  filterSchema: _filterSchema,
  filterFields: _filterFields,
  initialState: _initialState = {},
  getRowId,
  actions,
  pageSizeOptions = [10, 20, 50, 100],
  resourceKey,
  virtualize: _virtualize = false,
  externalFilters,
}: DataViewProps<TItem, TFilters>) {
  const {
    state,
    setView,
    setPage,
    setLimit,
    setSearch,
    setFilter,
    replaceFilters,
    clearFilters,
    setColumnVisibility,
    toggleColumnVisibility,
    resetSort: _resetSort,
  } = useDataViewContext<TFilters>();

  const [searchInput, setSearchInput] = useState(state.search || "");
  const debouncedSearch = useDebounce(searchInput, 400);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Sync debounced search to state
  useEffect(() => {
    if (debouncedSearch !== state.search) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, state.search, setSearch]);

  // Query data
  const queryResult = useDataViewQuery(
    fetcher,
    resourceKey,
    state.view,
    externalFilters,
  );

  // Extract data based on view mode with proper type narrowing
  const tableData = useMemo(() => {
    if (state.view === "table") {
      return extractTableData(
        queryResult.data as { data: { items: TItem[] } } | undefined,
      );
    }
    return extractGridData(
      queryResult.data as
        | { pages: Array<{ data: { items: TItem[] } }> }
        | undefined,
    );
  }, [state.view, queryResult.data]);

  const totalRecords = useMemo(() => {
    if (state.view === "table") {
      return extractTableTotalRecords(
        queryResult.data as { data: { totalRecords: number } } | undefined,
      );
    }
    return extractGridTotalRecords(
      queryResult.data as
        | { pages: Array<{ data: { totalRecords: number } }> }
        | undefined,
    );
  }, [state.view, queryResult.data]);

  const totalPages = useMemo(() => {
    if (state.view === "table") {
      return extractTableTotalPages(
        queryResult.data as { data: { totalPages: number } } | undefined,
      );
    }
    return extractGridTotalPages(
      queryResult.data as
        | { pages: Array<{ data: { totalPages: number } }> }
        | undefined,
    );
  }, [state.view, queryResult.data]);

  // Stable callbacks
  const handleSortChange = useCallback(
    (sortBy?: string, order?: "asc" | "desc") => {
      setFilter("sortBy", sortBy);
      setFilter("order", order);
    },
    [setFilter],
  );

  const handleRetry = useCallback(() => {
    queryResult.refetch();
  }, [queryResult]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Actions context - memoized to prevent unnecessary re-renders
  const actionsContext = useMemo(
    () => ({
      filters: state.filters as TFilters,
      setFilter,
      replaceFilters,
      clearFilters,
      refetch: queryResult.refetch,
    }),
    [
      state.filters,
      setFilter,
      replaceFilters,
      clearFilters,
      queryResult.refetch,
    ],
  );

  // Render actions
  const renderedActions = useMemo(
    () => (actions ? actions(actionsContext) : null),
    [actions, actionsContext],
  );

  // Announce data changes to screen readers
  useEffect(() => {
    if (announcementRef.current && !queryResult.isLoading) {
      const message =
        tableData.length === 0
          ? "No results found"
          : `Showing ${tableData.length} of ${totalRecords} results`;
      announcementRef.current.textContent = message;
    }
  }, [tableData.length, totalRecords, queryResult.isLoading]);

  // Error state
  if (queryResult.isError) {
    return <ErrorState error={queryResult.error} onRetry={handleRetry} />;
  }

  // Check if filters are active
  const hasActiveFilters =
    Object.keys(state.filters || {}).length > 0 || state.search;

  // Grid query result type guard
  const isGridQuery = state.view === "grid" && "fetchNextPage" in queryResult;

  return (
    <div className="space-y-5" role="region" aria-label={title || "Data view"}>
      {/* Hidden live region for announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Toolbar */}
      <Toolbar
        view={state.view}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onViewChange={setView}
        actions={renderedActions}
        // columnVisibility={
        //   state.view === "table" && columns ? (
        //     <ColumnVisibility
        //       columns={columns}
        //       columnVisibility={state.columnVisibility}
        //       toggleColumnVisibility={toggleColumnVisibility}
        //     />
        //   ) : null
        // }
      />

      {/* Content */}
      {state.view === "table" ? (
        <>
          {columns && (
            <TableView
              columns={columns}
              data={tableData}
              isLoading={queryResult.isLoading}
              getRowId={getRowId}
              columnVisibility={state.columnVisibility}
              setColumnVisibility={setColumnVisibility}
              onSortChange={handleSortChange}
              sortBy={state.sortBy}
              order={state.order}
            />
          )}
          {state.view === "table" && (
            <Pagination
              page={state.page}
              limit={state.limit}
              totalRecords={totalRecords}
              totalPages={totalPages}
              pageSizeOptions={pageSizeOptions}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </>
      ) : (
        renderCard && (
          <GridView
            items={tableData}
            renderCard={renderCard}
            isLoading={queryResult.isLoading}
            isFetchingNextPage={
              isGridQuery ? queryResult.isFetchingNextPage : false
            }
            hasNextPage={isGridQuery ? queryResult.hasNextPage : false}
            fetchNextPage={
              isGridQuery
                ? queryResult.fetchNextPage
                : () => {
                    // No-op fallback
                  }
            }
          />
        )
      )}

      {/* Empty state with clear filters */}
      {!queryResult.isLoading && tableData.length === 0 && hasActiveFilters && (
        <EmptyState onClearFilters={handleClearFilters} />
      )}
    </div>
  );
}
