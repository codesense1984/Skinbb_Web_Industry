import { Button } from "@/core/components/ui/button";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { Input } from "@/core/components/ui/input";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableProps,
} from "@/core/components/ui/table";
import { useDebounce } from "@/core/hooks/useDebounce";
import { cn } from "@/core/utils";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Header,
  type Row,
  type SortingState,
  type Table as TableType,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type Dispatch,
  type KeyboardEvent,
  type ReactNode,
  type SetStateAction,
} from "react";

export enum DataViewMode {
  "list" = "list",
  "grid" = "grid",
}

export const DEFAULT_PAGE_SIZES = [5, 10, 20, 50];
export const LOCAL_STORAGE_VIEW_MODE_KEY = "viewMode";

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

function createGlobalFilter<TData extends object>(
  filterableKeys?: (keyof TData)[],
) {
  return (row: Row<TData>, _columnId: string, filterValue: string) => {
    const keys = filterableKeys?.length
      ? filterableKeys
      : Object.keys(row.original);

    return keys.some((key) => {
      const value = row.original[key as keyof TData];
      return String(value ?? "")
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    });
  };
}

/**
 * Simplified generic fetcher for standard REST APIs with common defaults
 *
 * @param apiCall - Your API function that returns paginated data
 * @param options - Minimal configuration (only data paths needed)
 * @returns A function that can be used as a ServerTableFetcher
 *
 * @example
 * // Minimal configuration - uses standard REST API defaults
 * const fetcher = createSimpleFetcher(apiGetOrderList, {
 *   dataPath: 'data.orders',
 *   totalPath: 'data.totalRecords'
 * });
 *
 * @example
 * // With custom filter mapping
 * const fetcher = createSimpleFetcher(apiGetOrderList, {
 *   dataPath: 'data.orders',
 *   totalPath: 'data.totalRecords',
 *   filterMapping: {
 *     status: 'status',
 *     createdAt: (value) => ({ createdFrom: value.from, createdTo: value.to })
 *   }
 * });
 */

type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

type Elem<T> =
  T extends ReadonlyArray<infer U> ? U : T extends Array<infer U> ? U : never;

export function createSimpleFetcher<
  TPayload,
  TApiResponse,
  DPath extends string,
  TData extends Elem<PathValue<TApiResponse, DPath>>,
>(
  apiCall: (payload: TPayload, signal?: AbortSignal) => Promise<TApiResponse>, // <-- signal required
  options: {
    /** Path to the data array in the API response */
    dataPath: string;
    /** Path to the total count in the API response */
    totalPath: string;
    /** Optional: custom filter mapping */
    filterMapping?: Record<
      string,
      string | ((value: unknown) => Record<string, unknown>)
    >;
    /** Optional: custom result transformation */
    transformResult?: (apiResponse: TApiResponse) => {
      rows: TData[];
      total: number;
    };
  },
): ServerTableFetcher<TData> {
  const config = {
    dataPath: options.dataPath,
    totalPath: options.totalPath,
    pageParam: "page" as const,
    limitParam: "limit" as const,
    searchParam: "search" as const,
    sortByParam: "sortBy" as const,
    orderParam: "order" as const,
    filterMapping: options.filterMapping,
    transformResult: options.transformResult,
  };

  return createGenericFetcher(apiCall, config);
}

/**
 * Generic wrapper function to convert any pagination API to ServerTableResult format
 *
 * @param apiCall - Your API function that returns paginated data
 * @param options - Configuration options for the wrapper
 * @returns A function that can be used as a ServerTableFetcher
 *
 * @example
 * // Basic usage with standard pagination API
 * const fetcher = createGenericFetcher(
 *   apiGetOrderList,
 *   {
 *     dataPath: 'data.orders',
 *     totalPath: 'data.totalRecords',
 *     pageParam: 'page',
 *     limitParam: 'limit',
 *     searchParam: 'search',
 *     sortByParam: 'sortBy',
 *     orderParam: 'order',
 *     filterMapping: {
 *       status: 'status',
 *       createdAt: (value) => {
 *         const { from, to } = value as { from?: string; to?: string };
 *         return { createdFrom: from, createdTo: to };
 *       }
 *     }
 *   }
 * );
 *
 * @example
 * // Usage with custom API response structure
 * const fetcher = createGenericFetcher(
 *   apiGetUsers,
 *   {
 *     dataPath: 'users',
 *     totalPath: 'pagination.total',
 *     pageParam: 'page',
 *     limitParam: 'per_page',
 *     searchParam: 'q',
 *     sortByParam: 'sort',
 *     orderParam: 'direction',
 *     filterMapping: {
 *       role: 'user_role',
 *       active: 'is_active'
 *     }
 *   }
 * );
 */
export function createGenericFetcher<TData, TApiResponse = any>(
  apiCall: (payload: any, signal?: AbortSignal) => Promise<TApiResponse>,
  options: {
    /** Path to the data array in the API response (e.g., 'data.orders', 'users', etc.) */
    dataPath: string;
    /** Path to the total count in the API response (e.g., 'data.totalRecords', 'pagination.total', etc.) */
    totalPath: string;
    /** Parameter name for page number (e.g., 'page', 'pageNum', etc.) */
    pageParam?: string;
    /** Parameter name for page size (e.g., 'limit', 'per_page', 'size', etc.) */
    limitParam?: string;
    /** Parameter name for search/global filter (e.g., 'search', 'q', 'query', etc.) */
    searchParam?: string;
    /** Parameter name for sort field (e.g., 'sortBy', 'sort', 'field', etc.) */
    sortByParam?: string;
    /** Parameter name for sort order (e.g., 'order', 'direction', 'sort', etc.) */
    orderParam?: string;
    /** Mapping of column filter IDs to API parameter names or custom functions */
    filterMapping?: Record<
      string,
      string | ((value: any) => Record<string, any>)
    >;
    /** Custom payload builder function for advanced use cases */
    customPayloadBuilder?: (params: {
      pageIndex: number;
      pageSize: number;
      sorting: SortingState;
      columnFilters: ColumnFiltersState;
      globalFilter: string;
    }) => any;
    /** Transform function for the final result */
    transformResult?: (apiResponse: TApiResponse) => {
      rows: TData[];
      total: number;
    };
  },
): ServerTableFetcher<TData> {
  return async ({
    pageIndex,
    pageSize,
    sorting,
    columnFilters,
    globalFilter,
    signal,
  }) => {
    let payload: any = {};

    if (options.customPayloadBuilder) {
      // Use custom payload builder if provided
      payload = options.customPayloadBuilder({
        pageIndex,
        pageSize,
        sorting,
        columnFilters,
        globalFilter,
      });
    } else {
      // Build payload using standard mapping
      payload = {};

      // Page parameters
      if (options.pageParam) {
        payload[options.pageParam] = pageIndex + 1;
      }
      if (options.limitParam) {
        payload[options.limitParam] = pageSize;
      }

      // Global search
      if (globalFilter && options.searchParam) {
        payload[options.searchParam] = globalFilter;
      }

      // Sorting
      if (sorting[0] && options.sortByParam && options.orderParam) {
        payload[options.sortByParam] = sorting[0].id;
        payload[options.orderParam] = sorting[0].desc ? "desc" : "asc";
      }

      // Column filters
      if (options.filterMapping) {
        for (const filter of columnFilters) {
          if (filter.value == null || filter.value === "") continue;

          const mapping = options.filterMapping[filter.id];
          if (mapping) {
            if (typeof mapping === "string") {
              // Simple string mapping
              payload[mapping] = filter.value;
            } else if (typeof mapping === "function") {
              // Custom function mapping
              const customParams = mapping(filter.value);
              Object.assign(payload, customParams);
            }
          }
        }
      }
    }

    // Make API call
    const response = await apiCall(payload, signal);

    // Transform result
    if (options.transformResult) {
      return options.transformResult(response);
    }

    // Default transformation using paths
    const getNestedValue = (obj: any, path: string) => {
      return path.split(".").reduce((current, key) => current?.[key], obj);
    };

    const rows = getNestedValue(response, options.dataPath) || [];
    const total = getNestedValue(response, options.totalPath) || 0;

    return { rows, total };
  };
}

/**
 * Options for configuring the data table hook
 *
 * @example
 * // Basic usage with client-side data
 * const tableState = useTable({
 *   rows: data,
 *   columns: columns,
 *   defaultViewMode: DataViewMode.list
 * });
 *
 * @example
 * // Server-side usage with custom query key prefix
 * const tableState = useTable({
 *   columns: columns,
 *   isServerSide: true,
 *   fetcher: fetchOrders,
 *   queryKeyPrefix: "orders-table", // This will create query keys like ["orders-table", "storage-key", {...}]
 *   defaultViewMode: DataViewMode.list
 * });
 *
 * @example
 * // Different tables with different prefixes for independent caching
 * const ordersTable = useTable({
 *   columns: orderColumns,
 *   isServerSide: true,
 *   fetcher: fetchOrders,
 *   queryKeyPrefix: "orders",
 *   defaultViewMode: DataViewMode.list
 * });
 *
 * const usersTable = useTable({
 *   columns: userColumns,
 *   isServerSide: true,
 *   fetcher: fetchUsers,
 *   queryKeyPrefix: "users", // Different prefix for independent caching
 *   defaultViewMode: DataViewMode.list
 * });
 */
interface UseTableOptions<TData> {
  // Client-side options (existing functionality)
  rows?: TData[];
  columns: ColumnDef<TData, unknown>[];
  pageSize?: number;
  filterableKeys?: (keyof TData)[];
  defaultViewMode: DataViewMode;

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
  storageKey?: string;
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
  toggleViewMode: () => void;
  viewMode: DataViewMode;
  setViewMode: Dispatch<SetStateAction<DataViewMode>>;

  // Server-side additional return values
  isLoading?: boolean;
  isRefetching?: boolean;
  error?: string | null;
  total?: number;
  refetch?: () => void;
}

export function useTable<TData extends object>({
  rows: clientRows,
  columns,
  pageSize = 5,
  filterableKeys = [],
  defaultViewMode = DataViewMode.list,

  // Server-side options
  isServerSide = false,
  fetcher,
  initialSorting = [],
  initialColumnFilters = [],
  initialGlobalFilter = "",
  storageKey,
  searchDebounceMs = 400,
  queryKeyPrefix,
}: UseTableOptions<TData>): UseTableResponse<TData> {
  // ---- UI state (client) ----
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [viewMode, setViewMode] = useState<DataViewMode | undefined>(undefined);

  // Persist & hydrate view mode
  const storageKeyFinal =
    storageKey ?? `${LOCAL_STORAGE_VIEW_MODE_KEY}::default`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKeyFinal) as DataViewMode | null;
    if (saved) setViewMode(saved);
    else localStorage.setItem(storageKeyFinal, defaultViewMode);
  }, [storageKeyFinal, defaultViewMode]);

  useEffect(() => {
    if (viewMode) localStorage.setItem(storageKeyFinal, viewMode);
  }, [viewMode, storageKeyFinal]);

  // Server-side functionality
  let serverData: { rows: TData[]; total: number } | undefined;
  let isLoading = false;
  let isRefetching = false;
  let error: string | null = null;
  let total = 0;
  let refetch: (() => void) | undefined;

  if (isServerSide && fetcher) {
    // Debounce the search string so we don't spam the API while typing
    const debouncedGlobal = useDebounce(globalFilter, searchDebounceMs);

    // Reset to first page whenever filters/sorting/search change (classic UX)
    useEffect(() => {
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, [sorting, columnFilters, debouncedGlobal]);

    const queryKey = useMemo<
      [
        string,
        string,
        {
          p: typeof pagination;
          s: SortingState;
          f: ColumnFiltersState;
          g: string;
        },
      ]
    >(
      () => [
        queryKeyPrefix ?? "server-table",
        storageKeyFinal,
        { p: pagination, s: sorting, f: columnFilters, g: debouncedGlobal },
      ],
      [
        queryKeyPrefix,
        storageKeyFinal,
        pagination,
        sorting,
        columnFilters,
        debouncedGlobal,
      ],
    );

    const {
      data,
      error: queryError,
      isFetching,
      isPending,
      refetch: queryRefetch,
    } = useQuery<ServerTableResult<TData>>({
      queryKey,
      queryFn: ({ signal }) =>
        fetcher({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          sorting,
          columnFilters,
          globalFilter: debouncedGlobal,
          signal,
        }),
      // Cache & UX tuning
      staleTime: 30_000, // keep cached data fresh for 30s
      gcTime: 5 * 60_000, // cache garbage-collect after 5min
      placeholderData: (prev) => prev,
      refetchOnWindowFocus: false,
    });

    serverData = data;
    isLoading = isPending;
    isRefetching = isFetching;
    error = queryError?.message ?? null;
    total = data?.total ?? 0;
    refetch = queryRefetch;
  }

  // Determine which data to use
  const finalRows = isServerSide
    ? (serverData?.rows ?? [])
    : (clientRows ?? []);
  const finalTotal = isServerSide ? total : (clientRows?.length ?? 0);

  const table = useReactTable({
    data: finalRows,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    // Use appropriate pagination model based on mode
    ...(isServerSide
      ? {
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          pageCount: Math.max(
            1,
            Math.ceil(finalTotal / Math.max(1, pagination.pageSize)),
          ),
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          globalFilterFn: createGlobalFilter<TData>(filterableKeys),
        }),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      pagination,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  });

  return {
    table,
    pagination,
    setGlobalFilter,
    toggleViewMode: () =>
      setViewMode((prev) =>
        prev === DataViewMode.list ? DataViewMode.grid : DataViewMode.list,
      ),
    viewMode: viewMode ?? defaultViewMode,
    setViewMode: setViewMode as Dispatch<SetStateAction<DataViewMode>>,

    // Server-side additional return values
    ...(isServerSide && {
      isLoading,
      isRefetching,
      error,
      total,
      refetch,
    }),
  };
}

function SortableHeader<TData>({ header }: { header: Header<TData, unknown> }) {
  const isSorted = header.column.getIsSorted() as string;
  const toggleHandler = header.column.getToggleSortingHandler();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      toggleHandler?.(e);
    }
  };

  return (
    /* NOSONAR */ // Suppresses this line from being flagged
    <div
      role="button"
      tabIndex={0}
      aria-pressed={!!isSorted}
      aria-label={`Sort by ${String(header.column.columnDef.header)}`}
      onKeyDown={handleKeyDown}
      className={cn(
        "group hover:bg-accent flex h-full w-full items-center gap-2 px-3 focus:outline-none",
        header.column.getCanSort() ? "cursor-pointer" : "text-left",
      )}
      onClick={(e) => {
        // Prevent toggling sort if clicking inside an actual button
        if ((e.target as HTMLElement).closest("button")) return;

        toggleHandler?.(e);
      }}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      {(header.column.getCanSort() && (
        <button
          type="button"
          className={cn(
            "hover:bg-background grid size-7 cursor-pointer place-content-center rounded-md opacity-0 group-hover:opacity-100",
            header.column.getIsSorted() && "opacity-100",
          )}
          onClick={header.column.getToggleSortingHandler()}
        >
          {
            {
              asc: <ArrowUpIcon className="text-muted-foreground size-4" />,
              desc: <ArrowDownIcon className="text-muted-foreground size-4" />,
              false: <ArrowUpIcon className="text-border size-4" />,
            }[header.column.getIsSorted() as string]
          }
        </button>
      )) ??
        null}
    </div>
  );
}

interface DataTableBodyProps<TData> extends TableProps {
  table: TableType<TData>;
  emptyMessage?: string | ReactNode;
  isLoading?: boolean;
  loadingMessage?: string | ReactNode;
  loadingRows?: number;
}

export function DataTableBody<TData>({
  table,
  emptyMessage,
  isLoading = false,
  loadingMessage,
  loadingRows = 5,
  ...props
}: DataTableBodyProps<TData> & TableProps) {
  return (
    <Table {...props}>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead key={header.id} className="p-0">
                {!header.isPlaceholder && <SortableHeader header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          // Loading skeleton rows
          Array.from({ length: loadingRows }).map((_, index) => (
            <TableRow key={`loading-${index}`} className="animate-pulse">
              {table.getAllColumns().map((column) => (
                <TableCell key={`loading-cell-${index}-${column.id}`}>
                  <div className="bg-muted h-4 w-3/4 rounded"></div>
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-accent">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={table.getAllColumns().length}
              className="h-30 text-center"
              data-cell="empty"
            >
              {emptyMessage ?? (
                <div className="flex h-[228px] items-center justify-center">
                  {loadingMessage ?? "No result found."}
                </div>
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

interface DataGridViewProps<TData> extends ComponentProps<"section"> {
  table: TableType<TData>;
  renderGridItem?: (row: TData) => ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string | ReactNode;
  loadingItems?: number;
}

export function DataGridView<TData>({
  table,
  emptyMessage,
  renderGridItem,
  className,
  isLoading = false,
  loadingMessage,
  loadingItems = 6,
  ...props
}: DataGridViewProps<TData>) {
  const rowModel = table.getRowModel();

  const memoizedItems = useMemo(
    () =>
      renderGridItem
        ? rowModel.rows.map((row) => renderGridItem(row.original))
        : [],
    [rowModel, renderGridItem],
  );

  if (!renderGridItem) return <>Please provide grid layout</>;

  if (isLoading) {
    return (
      <section
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3",
          className,
        )}
        {...props}
      >
        {Array.from({ length: loadingItems }).map((_, index) => (
          <div key={`loading-grid-${index}`} className="animate-pulse">
            <div className="bg-muted space-y-3 rounded-lg p-4">
              <div className="bg-muted-foreground/20 h-4 w-3/4 rounded"></div>
              <div className="bg-muted-foreground/20 h-3 w-1/2 rounded"></div>
              <div className="bg-muted-foreground/20 h-3 w-2/3 rounded"></div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return table.getRowModel().rows.length ? (
    <section
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3",
        className,
      )}
      {...props}
    >
      {memoizedItems}
    </section>
  ) : (
    <div className="bg-background w-full rounded-md p-5 text-center">
      {loadingMessage ?? emptyMessage ?? "No results."}
    </div>
  );
}

interface DataPaginationProps<TData> extends ComponentProps<"div"> {
  table: TableType<TData>;
  showEntryCount?: boolean;
  showPageSizeOptions?: boolean;

  /** Optional total rows from server (for manual/server-side pagination) */
  serverTotal?: number;
}

export function DataPagination<TData>({
  table,
  showEntryCount = true,
  showPageSizeOptions = true,
  serverTotal,
  className,
  ...props
}: DataPaginationProps<TData>) {
  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  // If serverTotal is provided, prefer it; otherwise keep existing behavior
  const total =
    typeof serverTotal === "number" ? serverTotal : table.getRowCount();

  // Avoid "1 to 0 of 0" when total is zero
  const startEntry = total > 0 ? pageIndex * pageSize + 1 : 0;
  const endEntry = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 py-1 md:gap-4",
        className,
      )}
      {...props}
    >
      {showEntryCount && (
        <div>
          Showing {startEntry} to {endEntry} of {total} entries
          {!!table.getFilteredSelectedRowModel().rows.length && (
            <>
              {" "}
              (row {table.getFilteredSelectedRowModel().rows.length} selected)
            </>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        {showPageSizeOptions && (
          <div className="flex items-center gap-2">
            <SelectRoot
              value={String(pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[80px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            Entries per page
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            startIcon={<ChevronLeftIcon className="!size-5" />}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            startIcon={<ChevronRightIcon className="!size-5" />}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          />
        </div>
      </div>
    </div>
  );
}

interface DataTableActionProps<TData> extends ComponentProps<"div"> {
  tableState: UseTableResponse<TData>;
  children?: ReactNode;
  showViewToggle?: boolean;
  showColumnsFilter?: boolean;
  tableHeading?: string;
}

export function DataTableAction<TData>({
  tableState,
  children,
  className,
  tableHeading = "",
  showViewToggle = true,
  showColumnsFilter = true,
  ...props
}: DataTableActionProps<TData>) {
  const { table, viewMode, toggleViewMode } = tableState;

  const columnFilter = () => {
    if (viewMode === DataViewMode.grid) return;
    return (
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <Button variant="outlined" className="ml-auto">
            Columns <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            ?.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenuRoot>
    );
  };
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      <h5 className="table-heading">{tableHeading}</h5>
      <div className="flex flex-wrap gap-2 md:gap-4">
        <Input
          startIcon={<MagnifyingGlassIcon />}
          placeholder="Search..."
          onChange={(event) => table?.setGlobalFilter(event.target.value)}
          className="max-w-52"
          aria-label="Search table content"
        />

        {children}
        {showColumnsFilter && columnFilter()}
        {/* {viewMode === DataViewMode.list && } */}
        {showViewToggle && (
          <Button variant={"outlined"} size={"icon"} onClick={toggleViewMode}>
            {viewMode !== DataViewMode.grid ? (
              <TableCellsIcon />
            ) : (
              <Squares2X2Icon />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
interface DataTableProps<TData extends object>
  extends Omit<UseTableOptions<TData>, "defaultViewMode"> {
  bodyProps?: Omit<DataTableBodyProps<TData>, "table">;
  paginationProps?: Omit<DataPaginationProps<TData>, "table">;
  actionProps?: Omit<DataTableActionProps<TData>, "tableState">; // Optional custom actions (e.g. filters, buttons)
  showPagination?: boolean;
  showAction?: boolean;
  tableHeading?: string;
  className?: string;
}

export function DataTable<TData extends object>({
  rows,
  columns,
  bodyProps = {},
  paginationProps = {},
  actionProps,
  showAction = true,
  showPagination = true,
  tableHeading,
  className,
  pageSize,
  ...props
}: DataTableProps<TData>) {
  const tableState = useTable({
    rows,
    columns,
    defaultViewMode: DataViewMode.list,
    pageSize: !showPagination ? -1 : pageSize,
    ...props,
  });
  const { table } = tableState;
  return (
    <div className={cn("space-y-5", className)}>
      {showAction && (
        <DataTableAction
          tableState={tableState}
          showViewToggle={false}
          {...actionProps}
          tableHeading={tableHeading}
        ></DataTableAction>
      )}

      <DataTableBody table={table} {...bodyProps} />
      {showPagination && <DataPagination table={table} {...paginationProps} />}
    </div>
  );
}
interface DataTableToggleProps<TData extends object>
  extends Omit<UseTableOptions<TData>, "defaultViewMode"> {
  bodyProps?: Omit<DataTableBodyProps<TData>, "table">;
  gridProps?: Omit<DataGridViewProps<TData>, "table">;
  paginationProps?: Omit<DataPaginationProps<TData>, "table">;
  actionProps?: Omit<DataTableActionProps<TData>, "tableState">; // Optional custom actions (e.g. filters, buttons)
  showPagination?: boolean;
  showAction?: boolean;
}

export function DataTableToogle<TData extends object>({
  rows,
  columns,
  bodyProps = {},
  gridProps = {},
  paginationProps = {},
  actionProps,
  showAction = true,
  showPagination = true,
  ...props
}: DataTableToggleProps<TData>) {
  const tableState = useTable({
    rows,
    columns,
    defaultViewMode: DataViewMode.grid,
    ...props,
  });
  const { table, viewMode } = tableState;
  return (
    <div className="space-y-5">
      {showAction && (
        <DataTableAction
          tableState={tableState}
          {...actionProps}
        ></DataTableAction>
      )}

      {viewMode === DataViewMode.list ? (
        <DataTableBody
          table={table}
          className="overflow-hidden rounded-md shadow-md"
          {...bodyProps}
        />
      ) : (
        <DataGridView
          table={table}
          isLoading={bodyProps?.isLoading}
          loadingMessage={bodyProps?.loadingMessage}
          loadingItems={bodyProps?.loadingRows}
          {...gridProps}
        />
      )}
      {showPagination && <DataPagination table={table} {...paginationProps} />}
    </div>
  );
}
