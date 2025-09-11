import {
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import type { ServerTableFetcher } from "./types";

type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

type Elem<T> =
  T extends ReadonlyArray<infer U> ? U : T extends Array<infer U> ? U : never;

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
export function createSimpleFetcher<
  TPayload extends Record<string, unknown>,
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

  return createGenericFetcher(
    apiCall as (
      payload: Record<string, unknown>,
      signal?: AbortSignal,
    ) => Promise<TApiResponse>,
    config,
  );
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
export function createGenericFetcher<TData, TApiResponse = unknown>(
  apiCall: (
    payload: Record<string, unknown>,
    signal?: AbortSignal,
  ) => Promise<TApiResponse>,
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
      string | ((value: unknown) => Record<string, unknown>)
    >;
    /** Custom payload builder function for advanced use cases */
    customPayloadBuilder?: (params: {
      pageIndex: number;
      pageSize: number;
      sorting: SortingState;
      columnFilters: ColumnFiltersState;
      globalFilter: string;
    }) => Record<string, unknown>;
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
    let payload: Record<string, unknown> = {};

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
    const getNestedValue = (obj: unknown, path: string) => {
      return path
        .split(".")
        .reduce(
          (current, key) => (current as Record<string, unknown>)?.[key],
          obj,
        );
    };

    const rows = (getNestedValue(response, options.dataPath) as TData[]) || [];
    const total = (getNestedValue(response, options.totalPath) as number) || 0;

    return { rows, total };
  };
}
