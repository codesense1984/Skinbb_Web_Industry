import { useDebounce } from "@/core/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { createGlobalFilter } from "./utils";
// import { LOCAL_STORAGE_VIEW_MODE_KEY } from "./constants";
import { type UseTableOptions, type UseTableResponse } from "./types";

export function useTable<TData extends object>({
  rows: clientRows,
  columns,
  pageSize = 10,
  filterableKeys = [],
  // defaultViewMode = DataViewMode.list,

  // Server-side options
  isServerSide = false,
  fetcher,
  initialSorting = [],
  initialColumnFilters = [],
  initialGlobalFilter = "",
  // storageKey,
  searchDebounceMs = 400,
  queryKeyPrefix,
  meta,
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
  // const [viewMode, setViewMode] = useState<DataViewMode | undefined>(undefined);

  // // Persist & hydrate view mode
  // const storageKeyFinal =
  //   storageKey ?? `${LOCAL_STORAGE_VIEW_MODE_KEY}::default`;

  // useEffect(() => {
  //   const saved = localStorage.getItem(storageKeyFinal) as DataViewMode | null;
  //   if (saved) setViewMode(saved);
  //   else localStorage.setItem(storageKeyFinal, defaultViewMode);
  // }, [storageKeyFinal, defaultViewMode]);

  // useEffect(() => {
  //   if (viewMode) localStorage.setItem(storageKeyFinal, viewMode);
  // }, [viewMode, storageKeyFinal]);

  // Always call hooks, but conditionally use their results
  // Debounce the search string so we don't spam the API while typing
  const debouncedGlobal = useDebounce(globalFilter, searchDebounceMs);

  // Reset to first page whenever filters/sorting/search change (classic UX)
  useEffect(() => {
    if (isServerSide && fetcher) {
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }
  }, [isServerSide, fetcher, sorting, columnFilters, debouncedGlobal]);

  const queryKey = useMemo<
    [
      string,
      // string,
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
      // storageKeyFinal,
      // For server-side: include all state changes
      // For client-side: only include global filter (search) changes
      isServerSide && !!fetcher
        ? { p: pagination, s: sorting, f: columnFilters, g: debouncedGlobal }
        : { p: pagination, s: [], f: [], g: debouncedGlobal },
    ],
    [
      queryKeyPrefix,
      // storageKeyFinal,
      isServerSide,
      fetcher,
      // Only include pagination, sorting, columnFilters for server-side
      ...(isServerSide && !!fetcher
        ? [pagination, sorting, columnFilters]
        : []),
      // Always include global filter for both scenarios
      debouncedGlobal,
    ],
  );

  // Always call useQuery, but conditionally enable it
  const {
    data,
    error: queryError,
    isFetching,
    isPending,
    refetch: queryRefetch,
  } = useQuery({
    queryKey,
    queryFn: ({ signal }) => {
      if (!fetcher) {
        throw new Error("Fetcher not provided");
      }

      // For scenario 3 (client-side with auto-recall), we fetch all data without pagination
      // For scenario 2 (server-side), we pass pagination parameters
      if (isServerSide) {
        return fetcher({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          sorting,
          columnFilters,
          globalFilter: debouncedGlobal,
          signal,
        });
      } else {
        // Scenario 3: Fetch all data for client-side processing
        // Only use global filter for server-side search, everything else is client-side
        return fetcher({
          pageIndex: 0,
          pageSize: -1, // Large page size to get all data
          sorting: [], // No server-side sorting
          columnFilters: [], // No server-side filtering
          globalFilter: debouncedGlobal, // Only use global filter for search
          signal,
        });
      }
    },
    // Enable query if fetcher is provided
    enabled: !!fetcher,
    // Cache & UX tuning
    staleTime: 30_000, // keep cached data fresh for 30s
    gcTime: 5 * 60_000, // cache garbage-collect after 5min
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });

  // Server-side functionality - conditionally assign values
  const serverData = fetcher ? data : undefined;
  const isLoading = fetcher ? isPending : false;
  const isRefetching = fetcher ? isFetching : false;
  const error = fetcher ? (queryError?.message ?? null) : null;
  const total = isServerSide && fetcher ? (data?.total ?? 0) : 0;
  const refetch = fetcher ? queryRefetch : undefined;

  // Determine which data to use
  let finalRows: TData[];
  let finalTotal: number;

  if (fetcher) {
    if (isServerSide) {
      // Scenario 2: Server-side pagination
      finalRows = serverData?.rows ?? [];
      finalTotal = total;
    } else {
      // Scenario 3: Client-side pagination with auto-recall
      finalRows = serverData?.rows ?? [];
      finalTotal = serverData?.rows.length ?? 0;
    }
  } else {
    // Scenario 1: Basic client-side
    finalRows = clientRows ?? [];
    finalTotal = clientRows?.length ?? 0;
  }

  const table = useReactTable({
    data: finalRows,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    // Use appropriate pagination model based on scenario
    ...(isServerSide && !!fetcher
      ? {
          // Scenario 2: Server-side pagination
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          pageCount: Math.max(
            1,
            Math.ceil(finalTotal / Math.max(1, pagination.pageSize)),
          ),
        }
      : {
          // Scenario 1 & 3: Client-side pagination
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          globalFilterFn: createGlobalFilter<TData>(filterableKeys),
        }),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    meta,
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

    // toggleViewMode: () =>
    //   setViewMode((prev) =>
    //     prev === DataViewMode.list ? DataViewMode.grid : DataViewMode.list,
    //   ),
    // viewMode: viewMode ?? defaultViewMode,
    // setViewMode: setViewMode as any,

    // Server-side additional return values (for both server-side and client-side with auto-recall)
    ...(fetcher && {
      isLoading,
      isRefetching,
      error,
      total: finalTotal,
      refetch,
    }),
  };
}
