import type React from "react";
import type { Option } from "@/core/types";

/**
 * Filter value with both value and label for proper display
 */
export type FilterValue = {
  value: string;
  label: string;
};

/**
 * Applied filters state - maps filter keys to their selected values
 * - Single select: { key: { value, label } }
 * - Multi select: { key: [{ value, label }, ...] }
 * - Cleared: { key: null }
 */
export type AppliedFilters = Record<string, FilterValue | FilterValue[] | null>;

/**
 * Static data configuration for filters
 */
export type StaticData = {
  kind: "static";
  options: Array<{ value: string; label: string; meta?: unknown }>;
};

/**
 * Input parameters for fetching filter options
 */
export type OptionsFetchInput = {
  /** Page number (1-based) */
  page: number;
  /** Page size (limit) */
  limit: number;
  /** Search query string (empty string for no search) */
  search: string;
  /** Abort signal for cancelling requests */
  signal?: AbortSignal;
  /** Current working (unapplied) filter selections */
  working: AppliedFilters;
  /** Currently applied filter selections */
  applied: AppliedFilters;
};

/**
 * Result from fetching filter options
 */
export type OptionsFetchResult = {
  /** Array of options with value, label, and optional meta */
  options: Array<{ value: string; label: string; meta?: unknown }>;
  /** Total pages from server (null if not provided) */
  totalPages: number | null;
};

/**
 * Function-based fetcher for remote filter options
 */
export type OptionsFetcher = (
  input: OptionsFetchInput,
) => Promise<OptionsFetchResult>;

/**
 * Legacy adapter configuration (for backward compatibility)
 * @deprecated Use OptionsFetcher instead
 */
export type PagedSearchAdapterConfig = {
  /** Resource key in API response (e.g., "brands", "companies", "locations") */
  resourceKey: string;
  /** API endpoint URL (can be a function for dynamic endpoints) */
  endpoint:
    | string
    | ((ctx: { working: AppliedFilters; applied: AppliedFilters }) => string);
  /** Field name for the ID in API response items */
  idField: string;
  /** Field name for the label in API response items */
  labelField: string;
  /**
   * Build additional query parameters based on other filter selections
   * This enables cascading filters (e.g., brands filtered by company)
   */
  buildExtraParams?: (ctx: {
    working: AppliedFilters;
    applied: AppliedFilters;
  }) => Record<string, unknown>;
};

/**
 * Remote data configuration for filters
 */
export type RemoteData = {
  kind: "remote";
  /** Function-based async fetcher for options (preferred) */
  fetcher?: OptionsFetcher;
  /** Legacy adapter configuration (for backward compatibility) */
  adapter?: PagedSearchAdapterConfig;
  /** Number of items per page (default: 10) */
  pageSize?: number;
  /** Debounce delay for search in milliseconds (default: 300) */
  debounceMs?: number;
  /** Minimum query length to trigger search (default: 0) */
  minQueryLength?: number;
  /** React Query cache key prefix */
  queryKey?: unknown[];
  /** How long data stays fresh in cache (ms) */
  staleTime?: number;
  /** How long data stays in cache after unmount (ms) */
  gcTime?: number;
};

/**
 * Filter configuration that drives the FilterBar UI
 */
export type FilterConfig = {
  /** Unique key for this filter (e.g., "brand", "company", "status") */
  key: string;
  /** Display label for the filter */
  label?: string;
  /** Selection mode: single or multi */
  mode: "single" | "multi";
  /** UI type (default: "dropdown") */
  ui?: "dropdown";
  /** Data source configuration */
  data: StaticData | RemoteData;
  /** Array of filter keys this filter depends on (e.g., ["company"] means it depends on company filter) */
  dependsOn?: string[];
  className?: string;
  /**
   * Behavior when dependencies are empty or change
   * - "disable+clear" (default): Disable dropdown and clear value when any dependency is empty
   * - "clear": Only clear value when dependencies change, keep dropdown enabled (allows showing all options)
   */
  dependsOnBehavior?: "clear" | "disable+clear";
  /** Placeholder text for the dropdown */
  placeholder?: string;
  /** Message to show when no results are found */
  emptyText?: string;
  /** Custom render function for the button element */
  renderButton?: (props: {
    loading: boolean;
    selectedOption: Option | Option[] | undefined;
    disabled: boolean;
    open: boolean;
    value: string | string[];
    placeholder: string;
    error: boolean;
    isSelected: boolean;
  }) => React.ReactNode;
};

/**
 * Props for the FilterBar component
 */
export type FilterBarProps = {
  /** Array of filter configurations */
  filters: FilterConfig[];
  /** Pre-filled default values per filter */
  defaultValues?: AppliedFilters;
  /** Callback when filters are applied */
  onApply: (applied: AppliedFilters) => void;
  /** Optional callback for working (unapplied) filter changes */
  onChangeWorking?: (working: AppliedFilters) => void;
  /** Show Apply/Clear buttons. When false, auto-apply on every change with debounce */
  showAction?: boolean;
  /** Additional CSS classes */
  className?: string;
};
