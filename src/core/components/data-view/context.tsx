import { useDebounce } from "@/core/hooks/useDebounce";
import { useFilters } from "@/core/components/dynamic-filter/hooks";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DataViewContextValue,
  DataViewProviderProps,
  ServerDataResult,
} from "./types";
// import { useUrlStateSync } from "./hooks/use-url-state-sync";
import type { FilterOption } from "../dynamic-filter";
import { useUrlStateSync } from "./hooks/use-url-state-sync";

const DataViewContext = React.createContext<DataViewContextValue<any> | null>(
  null,
);

/**
 * Hook to access data view context
 */
export function useDataView<TData = unknown>(): DataViewContextValue<TData> {
  const context = React.useContext(DataViewContext);
  if (!context) {
    throw new Error("useDataView must be used within DataViewProvider");
  }
  return context as DataViewContextValue<TData>;
}

/**
 * DataViewProvider - Manages all state for data view (filters, search, pagination, sorting, view mode)
 */
export function DataViewProvider<TData extends object>({
  children,
  fetcher,
  columns,
  defaultViewMode = "table",
  defaultPageSize = 10,
  searchDebounceMs = 400,
  queryKeyPrefix = "data-view",
  enableUrlSync = false,
  urlParams = {},
}: DataViewProviderProps<TData>) {
  // View mode state
  const [viewMode, setViewMode] = useState<"table" | "grid">(defaultViewMode);

  // Search state
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, searchDebounceMs);

  // Filter state (from FilterProvider)
  const { value: filters, setItem, clearAll } = useFilters();

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Row selection state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // URL state sync
  useUrlStateSync({
    enabled: enableUrlSync,
    viewMode,
    search: debouncedSearch,
    pageIndex,
    pageSize,
    sorting,
    filters,
    urlParams,
    onViewModeChange: setViewMode,
    onPageIndexChange: setPageIndex,
    onPageSizeChange: setPageSize,
    onSortingChange: setSorting,
    onSearchChange: setSearch,
  });

  // Build query key for react-query (shared between table and grid)
  const baseQueryKey = useMemo(
    () => [queryKeyPrefix, "data", sorting, debouncedSearch, filters],
    [queryKeyPrefix, sorting, debouncedSearch, filters],
  );

  // Table view: use useQuery with pagination
  const tableQuery = useQuery<ServerDataResult<TData>>({
    queryKey: [...baseQueryKey, "table", pageIndex, pageSize],
    queryFn: async ({ signal }) => {
      return fetcher({
        pageIndex,
        pageSize,
        sorting,
        columnFilters: [], // Column filters handled separately via FilterProvider
        globalFilter: debouncedSearch,
        filters,
        signal,
      });
    },
    enabled: !!fetcher && viewMode === "table",
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
    // Remove placeholderData to ensure fresh data on page change
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  // Grid view: use useInfiniteQuery for infinite scroll
  const gridQuery = useInfiniteQuery<ServerDataResult<TData>>({
    queryKey: [...baseQueryKey, "grid", pageSize],
    queryFn: async ({ pageParam = 0, signal }) => {
      return fetcher({
        pageIndex: pageParam as number,
        pageSize,
        sorting,
        columnFilters: [], // Column filters handled separately via FilterProvider
        globalFilter: debouncedSearch,
        filters,
        signal,
      });
    },
    enabled: viewMode === "grid",
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, page) => sum + page.rows.length,
        0,
      );
      const total = lastPage.total;
      // If we've fetched all data, return undefined to stop fetching
      if (totalFetched >= total) {
        return undefined;
      }
      // Return next page index
      return allPages.length;
    },
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Extract data based on view mode
  const tableData = tableQuery.data?.rows;
  const tableTotal = tableQuery.data?.total ?? 0;
  const tableIsLoading = tableQuery.isPending;
  const tableIsRefetching = tableQuery.isFetching;
  const tableError = tableQuery.error
    ? tableQuery.error instanceof Error
      ? tableQuery.error.message
      : "An error occurred"
    : null;

  // For grid, accumulate all pages
  const gridData = useMemo(() => {
    if (!gridQuery.data?.pages) return [];
    return gridQuery.data.pages.flatMap((page) => page.rows);
  }, [gridQuery.data?.pages]);
  const gridTotal = gridQuery.data?.pages?.[0]?.total ?? 0;
  const gridIsLoading = gridQuery.isPending;
  const gridIsRefetching = gridQuery.isFetchingNextPage;
  const gridError = gridQuery.error
    ? gridQuery.error instanceof Error
      ? gridQuery.error.message
      : "An error occurred"
    : null;
  const hasNextPage = gridQuery.hasNextPage ?? false;
  const fetchNextPage = gridQuery.fetchNextPage;

  // Use appropriate data based on view mode
  const data = viewMode === "table" ? tableData : gridData;
  const total = viewMode === "table" ? tableTotal : gridTotal;
  const isLoading = viewMode === "table" ? tableIsLoading : gridIsLoading;
  const isRefetching =
    viewMode === "table" ? tableIsRefetching : gridIsRefetching;
  const error = viewMode === "table" ? tableError : gridError;

  // Track previous filter/search/sort values to detect actual changes
  const prevFiltersRef = React.useRef(filters);
  const prevSearchRef = React.useRef(debouncedSearch);
  const prevSortingRef = React.useRef(sorting);

  // Shallow comparison for filters (assuming flat structure)
  // For nested structures, use a proper deep equality library
  const filtersChanged = React.useMemo(() => {
    const prev = prevFiltersRef.current;
    const curr = filters;
    const prevKeys = Object.keys(prev);
    const currKeys = Object.keys(curr);
    if (prevKeys.length !== currKeys.length) return true;
    return prevKeys.some((key) => {
      const prevVal = prev[key];
      const currVal = curr[key];
      if (prevVal?.length !== currVal?.length) return true;
      return prevVal?.some((item, i) => item.value !== currVal[i]?.value);
    });
  }, [filters]);

  const sortingChanged = React.useMemo(() => {
    const prev = prevSortingRef.current;
    const curr = sorting;
    if (prev.length !== curr.length) return true;
    return prev.some(
      (p, i) => p.id !== curr[i]?.id || p.desc !== curr[i]?.desc,
    );
  }, [sorting]);

  // Reset to first page and reset infinite query when filters/search/sorting actually change
  useEffect(() => {
    const searchChanged = prevSearchRef.current !== debouncedSearch;

    if (filtersChanged || searchChanged || sortingChanged) {
      setPageIndex(0);
      // Reset infinite query when filters/search/sorting change (for grid view)
      if (viewMode === "grid") {
        gridQuery.refetch();
      }
    }

    // Update refs
    prevFiltersRef.current = filters;
    prevSearchRef.current = debouncedSearch;
    prevSortingRef.current = sorting;
  }, [debouncedSearch, filtersChanged, sortingChanged, viewMode, gridQuery]);

  // Create table instance for table view
  const table = useReactTable<TData>({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: true,
    // Use _id as row identifier if available
    getRowId: (row) => {
      // Check if row has _id property (common in MongoDB documents)
      if (row && typeof row === "object" && "_id" in row) {
        return String((row as { _id: unknown })._id);
      }
      // Fallback to index-based ID
      return String(data?.indexOf(row) ?? -1);
    },
    pageCount: Math.ceil(total / pageSize),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting,
      rowSelection,
    },
    onPaginationChange: (updater) => {
      const currentState = { pageIndex, pageSize };
      const next =
        typeof updater === "function" ? updater(currentState) : updater;

      // Update page size first, then page index
      // If page size changed, reset to first page
      if (next.pageSize !== pageSize) {
        setPageSize(next.pageSize);
        setPageIndex(0);
      } else {
        setPageIndex(next.pageIndex);
        setPageSize(next.pageSize);
      }
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next);
    },
    onRowSelectionChange: setRowSelection,
  });

  // Wrapper for setFilters that works with FilterProvider
  const handleSetFilters = useCallback(
    (newFilters: Record<string, FilterOption[]>) => {
      // Clear all first
      clearAll();
      // Then set each filter
      Object.entries(newFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          setItem(key, values, {
            mode: values.length > 1 ? "multi" : "single",
          });
        }
      });
    },
    [setItem, clearAll],
  );

  // Refetch wrapper
  const refetch = useCallback(() => {
    if (viewMode === "table") {
      tableQuery.refetch();
    } else {
      gridQuery.refetch();
    }
  }, [viewMode, tableQuery, gridQuery]);

  // Context value
  const contextValue = useMemo<DataViewContextValue<TData>>(
    () => ({
      viewMode,
      setViewMode,
      search,
      setSearch,
      debouncedSearch,
      filters,
      setFilters: handleSetFilters,
      pageIndex,
      pageSize,
      setPageIndex,
      setPageSize,
      sorting,
      setSorting,
      data,
      total,
      isLoading,
      isRefetching,
      error,
      refetch,
      table,
      // Grid infinite scroll
      hasNextPage: viewMode === "grid" ? hasNextPage : undefined,
      fetchNextPage: viewMode === "grid" ? fetchNextPage : undefined,
      isFetchingNextPage: viewMode === "grid" ? gridIsRefetching : undefined,
    }),
    [
      viewMode,
      search,
      debouncedSearch,
      filters,
      handleSetFilters,
      pageIndex,
      pageSize,
      sorting,
      data,
      total,
      isLoading,
      isRefetching,
      error,
      refetch,
      table,
      hasNextPage,
      fetchNextPage,
      gridIsRefetching,
    ],
  );

  return (
    <DataViewContext.Provider value={contextValue}>
      {children}
    </DataViewContext.Provider>
  );
}
