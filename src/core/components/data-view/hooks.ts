import {
  useQuery,
  useInfiniteQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { useMemo, useRef, useEffect } from "react";
import { useDataViewContext } from "./context";
import type { Fetcher, DataViewFilters, FetcherParams } from "./types";

/**
 * Query result shape for table view
 */
interface TableQueryResult<TItem> {
  data:
    | { data: { items: TItem[]; totalRecords: number; totalPages: number } }
    | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  isError: boolean;
}

/**
 * Query result shape for grid view (infinite query)
 */
interface GridQueryResult<TItem> {
  data:
    | {
        pages: Array<{
          data: { items: TItem[]; totalRecords: number; totalPages: number };
        }>;
      }
    | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isError: boolean;
}

/**
 * Hook to fetch data for DataView component
 * Uses regular query for table view and infinite query for grid view
 * @template TItem - Type of items returned
 * @template TFilters - Filter type extending DataViewFilters
 */
export function useDataViewQuery<
  TItem,
  TFilters extends DataViewFilters = DataViewFilters,
>(
  fetcher: Fetcher<TItem, TFilters>,
  resourceKey: string,
  view: "table" | "grid",
  externalFilters?: Record<string, unknown>,
): TableQueryResult<TItem> | GridQueryResult<TItem> {
  const { state } = useDataViewContext<TFilters>();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Build query params with stable reference
  const queryParams = useMemo<FetcherParams<TFilters>>(() => {
    const params: FetcherParams<TFilters> = {
      page: state.page,
      limit: state.limit,
      ...state.filters,
    };

    if (state.search) {
      params.search = state.search;
    }

    if (state.sortBy) {
      params.sortBy = state.sortBy;
    }

    if (state.order) {
      params.order = state.order;
    }

    return params;
  }, [
    state.page,
    state.limit,
    state.search,
    state.sortBy,
    state.order,
    state.filters,
  ]);

  // Include external filters in query key to trigger refetch when they change
  // This ensures that when external filters (companyId, locationId, brandId) change,
  // the query key changes and React Query refetches
  const externalFiltersKey = useMemo(() => {
    if (!externalFilters || Object.keys(externalFilters).length === 0)
      return null;
    // Create a stable, sorted key from external filters
    // Filter out undefined/null/empty values to keep key stable
    const filtered = Object.entries(externalFilters)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      )
      .sort(([a], [b]) => a.localeCompare(b));

    if (filtered.length === 0) return null;

    return filtered.map(([key, value]) => `${key}:${value}`).join("|");
  }, [externalFilters]);

  // Stable query key to prevent unnecessary refetches
  const tableQueryKey = useMemo(
    () =>
      [resourceKey, "table", queryParams, externalFiltersKey].filter(Boolean),
    [resourceKey, queryParams, externalFiltersKey],
  );

  const gridQueryKey = useMemo(
    () =>
      [
        resourceKey,
        "grid",
        { ...queryParams, page: undefined },
        externalFiltersKey,
      ].filter(Boolean),
    [resourceKey, queryParams, externalFiltersKey],
  );

  // Table: use regular query with pagination
  const tableQuery = useQuery({
    queryKey: tableQueryKey,
    queryFn: async ({ signal }) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Combine signals: React Query's signal and our AbortController
      const combinedSignal = signal || abortControllerRef.current.signal;
      return fetcher(queryParams, combinedSignal);
    },
    enabled: view === "table",
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  // Grid: use infinite query
  const gridQuery = useInfiniteQuery({
    queryKey: gridQueryKey,
    queryFn: async ({ pageParam = 1, signal }) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const combinedSignal = signal || abortControllerRef.current.signal;
      return fetcher({ ...queryParams, page: pageParam }, combinedSignal);
    },
    enabled: view === "grid",
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  // Cleanup on unmount or when query params change
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [queryParams]);

  if (view === "grid") {
    return {
      data: gridQuery.data,
      isLoading: gridQuery.isPending,
      isFetching: gridQuery.isFetching,
      isFetchingNextPage: gridQuery.isFetchingNextPage,
      error: gridQuery.error,
      refetch: gridQuery.refetch,
      fetchNextPage: gridQuery.fetchNextPage,
      hasNextPage: gridQuery.hasNextPage ?? false,
      isError: gridQuery.isError,
    } as GridQueryResult<TItem>;
  }

  return {
    data: tableQuery.data,
    isLoading: tableQuery.isPending,
    isFetching: tableQuery.isFetching,
    error: tableQuery.error,
    refetch: tableQuery.refetch,
    isError: tableQuery.isError,
  } as TableQueryResult<TItem>;
}
