import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Table as TableType,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { FilterOption } from "../dynamic-filter/types";

/**
 * View mode for data display
 */
export type ViewMode = "table" | "grid";

/**
 * Server-side data fetcher result
 */
export interface ServerDataResult<TData> {
  rows: TData[];
  total: number;
}

/**
 * Server-side data fetcher function
 */
export type ServerDataFetcher<TData> = (params: {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  filters: Record<string, FilterOption[]>;
  signal: AbortSignal;
}) => Promise<ServerDataResult<TData>>;

/**
 * Column definition with custom cell render support
 * This is just a type alias - DataView accepts standard TanStack Table ColumnDef
 */
export type DataViewColumnDef<TData> = ColumnDef<TData, unknown>;

/**
 * Data view context value
 */
export interface DataViewContextValue<TData> {
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Search
  search: string;
  setSearch: (search: string) => void;
  debouncedSearch: string;

  // Filters (from FilterProvider)
  filters: Record<string, FilterOption[]>;
  setFilters: (filters: Record<string, FilterOption[]>) => void;

  // Pagination
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;

  // Sorting
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;

  // Data
  data: TData[] | undefined;
  total: number;
  isLoading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => void;

  // Table instance (for table view)
  table: TableType<TData> | null;

  // Grid infinite scroll (for grid view)
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

/**
 * Data view provider props
 */
export interface DataViewProviderProps<TData> {
  children: ReactNode;
  /**
   * Server-side data fetcher
   */
  fetcher: ServerDataFetcher<TData>;
  /**
   * Column definitions for table view
   */
  columns: DataViewColumnDef<TData>[];
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
}

/**
 * Data table props
 */
export interface DataTableProps<TData> {
  /**
   * Table instance from TanStack Table
   */
  table: TableType<TData>;
  /**
   * Custom cell renderer for a column
   */
  renderCell?: (columnId: string, value: unknown, row: TData) => ReactNode;
  /**
   * Empty state message
   */
  emptyMessage?: string | ReactNode;
  /**
   * Loading skeleton row count
   */
  loadingRows?: number;
  /**
   * Show column visibility toggle
   */
  showColumnVisibility?: boolean;
  /**
   * ARIA label for the table
   */
  ariaLabel?: string;
}

/**
 * Data grid props
 */
export interface DataGridProps<TData> {
  /**
   * Whether the grid is loading
   */
  isLoading?: boolean;
  /**
   * Data rows to display
   */
  rows: TData[];
  /**
   * Custom card renderer
   */
  renderCard: (row: TData, index: number) => ReactNode;
  /**
   * Empty state message
   */
  emptyMessage?: string | ReactNode;
  /**
   * Loading skeleton count
   */
  loadingItems?: number;
  /**
   * Whether more data is available
   */
  hasNextPage?: boolean;
  /**
   * Whether next page is loading
   */
  isFetchingNextPage?: boolean;
  /**
   * Load more callback
   */
  onLoadMore?: () => void;
  /**
   * ARIA label for the grid
   */
  ariaLabel?: string;
  /**
   * Grid container className
   */
  className?: string;
}

/**
 * Data view controls props
 */
export interface DataViewControlsProps {
  /**
   * Current view mode
   */
  viewMode: ViewMode;
  /**
   * View mode change handler
   */
  onViewModeChange: (mode: ViewMode) => void;
  /**
   * Search value
   */
  search: string;
  /**
   * Search change handler
   */
  onSearchChange: (search: string) => void;
  /**
   * Search placeholder
   */
  searchPlaceholder?: string;
  /**
   * Filter components (FilterDataItem components)
   */
  filters?: ReactNode;
  /**
   * Additional controls
   */
  children?: ReactNode;
  /**
   * ARIA label for search input
   */
  searchAriaLabel?: string;
}

/**
 * Data error state props
 */
export interface DataErrorStateProps {
  /**
   * Error message
   */
  error: string;
  /**
   * Retry callback
   */
  onRetry: () => void;
  /**
   * Clear filters callback
   */
  onClearFilters?: () => void;
  /**
   * ARIA label
   */
  ariaLabel?: string;
}

/**
 * Data empty state props
 */
export interface DataEmptyStateProps {
  /**
   * Empty state message
   */
  message?: string | ReactNode;
  /**
   * Clear filters callback
   */
  onClearFilters?: () => void;
  /**
   * ARIA label
   */
  ariaLabel?: string;
}

/**
 * Data skeleton props
 */
export interface DataSkeletonProps {
  /**
   * Number of skeleton items
   */
  count?: number;
  /**
   * Skeleton type
   */
  type?: "table" | "grid";
  /**
   * Grid columns (for grid type)
   */
  gridColumns?: number;
}
