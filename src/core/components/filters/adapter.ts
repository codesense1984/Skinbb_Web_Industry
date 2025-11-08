import type { ServerTableFetcher } from "@/core/components/data-table";
import { api } from "@/core/services/http";
import type {
  AppliedFilters,
  OptionsFetcher,
  OptionsFetchResult,
  PagedSearchAdapterConfig,
} from "./types";

/**
 * Wraps an OptionsFetcher to work with PaginationComboBox's ServerTableFetcher signature
 * This allows the function-based fetcher to integrate seamlessly with PaginationComboBox
 */
export function wrapOptionsFetcher(
  fetcher: OptionsFetcher,
  getContext: () => { working: AppliedFilters; applied: AppliedFilters },
): ServerTableFetcher<{ value: string; label: string; meta?: unknown }> {
  return async ({ pageIndex, pageSize, globalFilter, signal }) => {
    const context = getContext();

    // Convert PaginationComboBox params to OptionsFetchInput
    const input = {
      page: pageIndex + 1, // Convert 0-based to 1-based
      limit: pageSize,
      search: globalFilter ?? "",
      signal,
      working: context.working,
      applied: context.applied,
    };

    // Call the provided fetcher
    const result: OptionsFetchResult = await fetcher(input);

    // Convert OptionsFetchResult to ServerTableResult
    // rows = options array, total = totalPages * pageSize or fallback to options.length
    const total = result.totalPages
      ? result.totalPages * pageSize
      : result.options.length;

    return {
      rows: result.options,
      total: Math.max(total, result.options.length),
    };
  };
}

/**
 * Creates a shim OptionsFetcher from legacy PagedSearchAdapterConfig
 * This provides backward compatibility for old filter configs
 */
export function createLegacyFetcher(
  adapter: PagedSearchAdapterConfig,
): OptionsFetcher {
  return async ({ page, limit, search, signal, working, applied }) => {
    // Resolve endpoint (can be a function or string)
    const endpoint =
      typeof adapter.endpoint === "function"
        ? adapter.endpoint({ working, applied })
        : adapter.endpoint;

    // Build extra params if provided
    const extraParams = adapter.buildExtraParams
      ? adapter.buildExtraParams({ working, applied })
      : {};

    // Build query parameters
    const params: Record<string, unknown> = {
      page: String(page),
      limit: String(limit),
      ...(search && { search }),
      ...extraParams,
    };

    // Call the API
    const response = await api.get<{
      statusCode: number;
      data: {
        [key: string]: unknown;
        totalPages?: number | null;
        totalRecords?: number;
        total?: number;
      };
      message: string;
      success: boolean;
    }>(endpoint, {
      params,
      signal,
    });

    // Extract items from the response using resourceKey
    // Handle both the user's specified format (data[resourceKey]) and common alternatives
    const items =
      (response.data?.[adapter.resourceKey] as Array<
        Record<string, unknown>
      >) ||
      (response.data?.items as Array<Record<string, unknown>>) ||
      [];

    // Try to get totalPages, totalRecords, or calculate from total
    const totalPages = response.data?.totalPages ?? null;
    const totalRecords =
      response.data?.totalRecords ?? response.data?.total ?? null;

    // Normalize into dropdown options
    const options = items.map((item) => {
      const id = String(item[adapter.idField] ?? "");
      const label = String(item[adapter.labelField] ?? "");
      return {
        value: id,
        label,
        meta: item,
      };
    });

    const computedTotalPages =
      totalPages ?? (totalRecords ? Math.ceil(totalRecords / limit) : null);

    return {
      options,
      totalPages: computedTotalPages,
    };
  };
}

/**
 * Creates a transform function for PaginationComboBox
 * Since our fetcher already returns { value, label, meta }, this is just an identity transform
 */
export function createTransform(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _fetcher: OptionsFetcher,
): (item: { value: string; label: string; meta?: unknown }) => {
  value: string;
  label: string;
  meta?: unknown;
} {
  return (item) => {
    const result: { value: string; label: string; meta?: unknown } = {
      value: item.value,
      label: item.label,
    };
    if (item.meta) {
      result.meta = item.meta;
    }
    return result;
  };
}
