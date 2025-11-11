import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import type { SortingState } from "@tanstack/react-table";
import type { FilterOption } from "../../dynamic-filter/types";
import type { ViewMode } from "../types";

interface UseUrlStateSyncOptions {
  enabled: boolean;
  viewMode: ViewMode;
  search: string;
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  filters: Record<string, FilterOption[]>;
  urlParams?: {
    search?: string;
    page?: string;
    pageSize?: string;
    sort?: string;
    view?: string;
  };
  onViewModeChange: (mode: ViewMode) => void;
  onPageIndexChange: (index: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortingChange: (sorting: SortingState) => void;
  onSearchChange: (search: string) => void;
}

/**
 * Hook to synchronize data view state with URL query parameters
 */
export function useUrlStateSync({
  enabled,
  viewMode,
  search,
  pageIndex,
  pageSize,
  sorting,
  filters,
  urlParams = {},
  onViewModeChange,
  onPageIndexChange,
  onPageSizeChange,
  onSortingChange,
  onSearchChange,
}: UseUrlStateSyncOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);
  const isUpdatingFromUrl = useRef(false);

  const searchParam = urlParams.search ?? "search";
  const pageParam = urlParams.page ?? "page";
  const pageSizeParam = urlParams.pageSize ?? "pageSize";
  const sortParam = urlParams.sort ?? "sort";
  const viewParam = urlParams.view ?? "view";

  // Initialize state from URL on mount
  useEffect(() => {
    if (!enabled || !isInitialMount.current) return;

    isUpdatingFromUrl.current = true;

    // Read view mode
    const urlView = searchParams.get(viewParam);
    if (urlView === "table" || urlView === "grid") {
      onViewModeChange(urlView);
    }

    // Read search
    const urlSearch = searchParams.get(searchParam);
    if (urlSearch) {
      onSearchChange(urlSearch);
    }

    // Read page
    const urlPage = searchParams.get(pageParam);
    if (urlPage) {
      const page = parseInt(urlPage, 10);
      if (!isNaN(page) && page > 0) {
        onPageIndexChange(page - 1); // Convert to 0-based index
      }
    }

    // Read page size
    const urlPageSize = searchParams.get(pageSizeParam);
    if (urlPageSize) {
      const size = parseInt(urlPageSize, 10);
      if (!isNaN(size) && size > 0) {
        onPageSizeChange(size);
      }
    }

    // Read sorting
    const urlSort = searchParams.get(sortParam);
    if (urlSort) {
      try {
        const parsed = JSON.parse(urlSort) as SortingState;
        if (Array.isArray(parsed)) {
          onSortingChange(parsed);
        }
      } catch {
        // Invalid JSON, ignore
      }
    }

    isInitialMount.current = false;
    isUpdatingFromUrl.current = false;
  }, []); // Only run on mount

  // Update URL when state changes (but not when updating from URL)
  useEffect(() => {
    if (!enabled || isUpdatingFromUrl.current) return;

    const newParams = new URLSearchParams(searchParams);

    // Update view mode
    if (viewMode === "table") {
      newParams.delete(viewParam); // Default, don't need to store
    } else {
      newParams.set(viewParam, viewMode);
    }

    // Update search
    if (search) {
      newParams.set(searchParam, search);
    } else {
      newParams.delete(searchParam);
    }

    // Update page
    if (pageIndex > 0) {
      newParams.set(pageParam, String(pageIndex + 1)); // Convert to 1-based
    } else {
      newParams.delete(pageParam);
    }

    // Update page size
    if (pageSize !== 10) {
      // 10 is default
      newParams.set(pageSizeParam, String(pageSize));
    } else {
      newParams.delete(pageSizeParam);
    }

    // Update sorting
    if (sorting.length > 0) {
      newParams.set(sortParam, JSON.stringify(sorting));
    } else {
      newParams.delete(sortParam);
    }

    // Update filters (store as JSON)
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        newParams.set(`filter_${key}`, JSON.stringify(values));
      } else {
        newParams.delete(`filter_${key}`);
      }
    });

    setSearchParams(newParams, { replace: true });
  }, [
    enabled,
    viewMode,
    search,
    pageIndex,
    pageSize,
    sorting,
    filters,
    searchParams,
    setSearchParams,
    searchParam,
    pageParam,
    pageSizeParam,
    sortParam,
    viewParam,
  ]);

  return {
    searchParams,
    setSearchParams,
  };
}

