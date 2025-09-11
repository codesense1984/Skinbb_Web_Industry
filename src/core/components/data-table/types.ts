import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Table as TableType,
} from "@tanstack/react-table";
import {
  type ComponentProps,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export enum DataViewMode {
  "list" = "list",
  "grid" = "grid",
}

/** What your API returns for server-side tables */
export type ServerTableResult<TData> = {
  rows: TData[];
  total: number; // total rows across all pages (for pagination UI)
};

/** Fetcher signature for server-side tables */
export type ServerTableFetcher<TData> = (params: {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  signal: AbortSignal;
}) => Promise<ServerTableResult<TData>>;

/**
 * Options for configuring the data table hook
 */
export interface UseTableOptions<TData> {
  // Client-side options (existing functionality)
  rows?: TData[];
  columns: ColumnDef<TData, unknown>[];
  pageSize?: number;
  filterableKeys?: (keyof TData)[];
  // defaultViewMode: DataViewMode;

  // Server-side options (new functionality)
  /** Enable server-side mode */
  isServerSide?: boolean;
  /** Called to fetch rows from server when in server-side mode */
  fetcher?: ServerTableFetcher<TData>;
  /** Optional: initial sorting/filter/search you may want to hydrate from URL, etc. */
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialGlobalFilter?: string;
  /** Optional: persist key for view mode if you need different tables to keep separate prefs */
  // storageKey?: string;
  /** Debounce (ms) for global search in server-side mode */
  searchDebounceMs?: number;
  /** Optional: prefix for query keys to allow independent caching of different tables */
  queryKeyPrefix?: string;
}

export interface UseTableResponse<TData> {
  table: TableType<TData>;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setGlobalFilter: Dispatch<SetStateAction<string>>;
  // toggleViewMode: () => void;
  // viewMode: DataViewMode;
  // setViewMode: Dispatch<SetStateAction<DataViewMode>>;

  // Server-side additional return values
  isLoading?: boolean;
  isRefetching?: boolean;
  error?: string | null;
  total?: number;
  refetch?: () => void;
}

export interface DataTableBodyProps<TData> {
  table: TableType<TData>;
  emptyMessage?: string | ReactNode;
  isLoading?: boolean;
  loadingMessage?: string | ReactNode;
  loadingRows?: number;
}

export interface DataGridViewProps<TData> extends ComponentProps<"section"> {
  table: TableType<TData>;
  renderGridItem?: (row: TData) => ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string | ReactNode;
  loadingItems?: number;
}

export interface DataPaginationProps<TData> extends ComponentProps<"div"> {
  table: TableType<TData>;
  showEntryCount?: boolean;
  showPageSizeOptions?: boolean;

  /** Optional total rows from server (for manual/server-side pagination) */
  serverTotal?: number;
}

export interface DataTableActionProps<TData> extends ComponentProps<"div"> {
  tableState: UseTableResponse<TData>;
  children?: ReactNode;
  showViewToggle?: boolean;
  showColumnsFilter?: boolean;
  tableHeading?: string;
  viewMode?: DataViewMode;
}

export interface DataTableProps<TData extends object>
  extends Omit<UseTableOptions<TData>, "defaultViewMode"> {
  bodyProps?: Omit<DataTableBodyProps<TData>, "table">;
  paginationProps?: Omit<DataPaginationProps<TData>, "table">;
  actionProps?: (
    table: UseTableResponse<TData>,
  ) => Omit<DataTableActionProps<TData>, "tableState">; // Optional custom actions (e.g. filters, buttons)
  showPagination?: boolean;
  showAction?: boolean;
  tableHeading?: string;
  className?: string;
}

export interface DataTableToggleProps<TData extends object>
  extends Omit<UseTableOptions<TData>, "defaultViewMode"> {
  bodyProps?: Omit<DataTableBodyProps<TData>, "table">;
  gridProps?: Omit<DataGridViewProps<TData>, "table">;
  paginationProps?: Omit<DataPaginationProps<TData>, "table">;
  actionProps?: (
    table: UseTableResponse<TData>,
  ) => Omit<DataTableActionProps<TData>, "tableState">; // Optional custom actions (e.g. filters, buttons)
  showPagination?: boolean;
  showAction?: boolean;
}
