import type { Fetcher, FetcherParams, ResponseShape, DataViewFilters } from "./types";

export function createSimpleFetcher<TItem, TFilters extends DataViewFilters = DataViewFilters>(
  apiCall: (params: Record<string, unknown>, signal?: AbortSignal) => Promise<any>,
  options: {
    dataPath: string;
    totalPath?: string;
    filterMapping?: Record<string, string | ((value: unknown) => Record<string, unknown>)>;
  },
): Fetcher<TItem, TFilters> {
  return async (params: FetcherParams<TFilters>, signal?: AbortSignal): Promise<ResponseShape<TItem>> => {
    const payload: Record<string, unknown> = {};

    // Page and limit
    if (params.page !== undefined) {
      payload.page = params.page;
    }
    if (params.limit !== undefined) {
      payload.limit = params.limit;
    }

    // Search
    if (params.search) {
      payload.search = params.search;
    }

    // Sort
    if (params.sortBy) {
      payload.sortBy = params.sortBy;
    }
    if (params.order) {
      payload.order = params.order;
    }

    // Filters with mapping
    if (options.filterMapping) {
      Object.entries(params).forEach(([key, value]) => {
        if (key === "page" || key === "limit" || key === "search" || key === "sortBy" || key === "order") {
          return;
        }
        if (value === undefined || value === null || value === "") {
          return;
        }

        const mapping = options.filterMapping[key];
        if (mapping) {
          if (typeof mapping === "string") {
            payload[mapping] = value;
          } else if (typeof mapping === "function") {
            const customParams = mapping(value);
            Object.assign(payload, customParams);
          }
        } else {
          payload[key] = value;
        }
      });
    } else {
      // No mapping, pass filters as-is
      Object.entries(params).forEach(([key, value]) => {
        if (key === "page" || key === "limit" || key === "search" || key === "sortBy" || key === "order") {
          return;
        }
        if (value !== undefined && value !== null && value !== "") {
          payload[key] = value;
        }
      });
    }

    const response = await apiCall(payload, signal);

    // Extract data using paths
    const getNestedValue = (obj: any, path: string): any => {
      return path.split(".").reduce((acc, key) => acc?.[key], obj);
    };

    const items = getNestedValue(response, options.dataPath) || [];
    const totalRecords = options.totalPath
      ? getNestedValue(response, options.totalPath) || 0
      : items.length;

    // Extract pagination info
    const page = getNestedValue(response, "data.page") || params.page || 1;
    const limit = getNestedValue(response, "data.limit") || params.limit || 10;
    const totalPages = getNestedValue(response, "data.totalPages") || Math.ceil(totalRecords / limit);

    return {
      statusCode: response.statusCode || 200,
      data: {
        items,
        page,
        limit,
        totalRecords,
        totalPages,
      },
      message: response.message || "",
      success: response.success !== false,
    };
  };
}

