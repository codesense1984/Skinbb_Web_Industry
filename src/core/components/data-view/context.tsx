import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { useSearchParams } from "react-router";
import type { DataViewState, DataViewFilters, SortOrder } from "./types";

/**
 * Context value interface for DataView
 * @template TFilters - Filter type extending DataViewFilters
 */
interface DataViewContextValue<
  TFilters extends DataViewFilters = DataViewFilters,
> {
  state: DataViewState<TFilters>;
  setView: (view: "table" | "grid") => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setFilter: (
    key: string | number | symbol,
    value: unknown,
    opts?: { resetPage?: boolean },
  ) => void;
  replaceFilters: (
    partial: Partial<TFilters & { sortBy?: string; order?: SortOrder }>,
  ) => void;
  clearFilters: (keys?: (string | number | symbol)[]) => void;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;
  toggleColumnVisibility: (columnId: string) => void;
  resetSort: () => void;
}

const DataViewContext = createContext<DataViewContextValue<DataViewFilters> | null>(null);

/**
 * Hook to access DataView context
 * @template TFilters - Filter type extending DataViewFilters
 * @throws {Error} If used outside DataViewProvider
 */
export function useDataViewContext<
  TFilters extends DataViewFilters = DataViewFilters,
>(): DataViewContextValue<TFilters> {
  const context = useContext(DataViewContext);
  if (!context) {
    throw new Error("useDataViewContext must be used within DataViewProvider");
  }
  return context as DataViewContextValue<TFilters>;
}

/**
 * Props for DataViewProvider
 * @template TFilters - Filter type extending DataViewFilters
 */
interface DataViewProviderProps<
  TFilters extends DataViewFilters = DataViewFilters,
> {
  children: React.ReactNode;
  initialState: DataViewState<TFilters>;
  resourceKey: string;
  syncUrl?: boolean;
}

/**
 * Provider component that manages DataView state and URL synchronization
 * @template TFilters - Filter type extending DataViewFilters
 */
export function DataViewProvider<
  TFilters extends DataViewFilters = DataViewFilters,
>({
  children,
  initialState,
  resourceKey,
  syncUrl = true,
}: DataViewProviderProps<TFilters>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);
  
  const [state, setState] = useState<DataViewState<TFilters>>(() => {
    if (!syncUrl) return initialState;

    // Hydrate from URL on initial mount
    const urlView = searchParams.get("view") as "table" | "grid" | null;
    const urlPage = searchParams.get("page");
    const urlLimit = searchParams.get("limit");
    const urlSearch = searchParams.get("search");
    const urlSortBy = searchParams.get("sortBy");
    const urlOrder = searchParams.get("order") as SortOrder | null;

    const urlFilters: Partial<TFilters> = {};
    Object.keys(initialState.filters || {}).forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        urlFilters[key as keyof TFilters] = value as TFilters[keyof TFilters];
      }
    });

    return {
      view: urlView || initialState.view || "table",
      page: urlPage ? parseInt(urlPage, 10) : initialState.page || 1,
      limit: urlLimit ? parseInt(urlLimit, 10) : initialState.limit || 10,
      search: urlSearch || initialState.search || "",
      filters: { ...initialState.filters, ...urlFilters },
      sortBy: urlSortBy || initialState.sortBy,
      order: urlOrder || initialState.order,
      columnVisibility: initialState.columnVisibility || {},
    };
  });

  // Sync state to URL (debounced to avoid excessive URL updates)
  useEffect(() => {
    if (!syncUrl) return;
    
    // Skip URL sync on initial mount to avoid overwriting URL with initial state
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newParams = new URLSearchParams(searchParams);

    // Use simple param names without prefix for cleaner URLs
    // Only use prefix if resourceKey is provided and not a route path
    const usePrefix = resourceKey && !resourceKey.startsWith("/");
    const prefix = usePrefix ? `${resourceKey}_` : "";

    // Update DataView params
    newParams.set(`${prefix}view`, state.view);
    if (state.view === "table") {
      newParams.set(`${prefix}page`, state.page.toString());
    } else {
      // Remove page param for grid view
      newParams.delete(`${prefix}page`);
    }
    newParams.set(`${prefix}limit`, state.limit.toString());

    if (state.search) {
      newParams.set(`${prefix}search`, state.search);
    } else {
      newParams.delete(`${prefix}search`);
    }

    if (state.sortBy) {
      newParams.set(`${prefix}sortBy`, state.sortBy);
    } else {
      newParams.delete(`${prefix}sortBy`);
    }

    if (state.order) {
      newParams.set(`${prefix}order`, state.order);
    } else {
      newParams.delete(`${prefix}order`);
    }

    // Sync filters
    Object.keys(state.filters || {}).forEach((key) => {
      const value = state.filters?.[key as keyof TFilters];
      if (value !== undefined && value !== null && value !== "") {
        newParams.set(`${prefix}${key}`, String(value));
      } else {
        newParams.delete(`${prefix}${key}`);
      }
    });

    // Preserve all existing params that aren't DataView params
    // This ensures params like companyId, locationId, brandId are preserved
    const dataViewParams = [
      `${prefix}view`,
      `${prefix}page`,
      `${prefix}limit`,
      `${prefix}search`,
      `${prefix}sortBy`,
      `${prefix}order`,
      ...Object.keys(state.filters || {}).map((key) => `${prefix}${key}`),
    ];

    // Keep all params that aren't DataView params
    const preservedParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (!dataViewParams.includes(key)) {
        preservedParams.set(key, value);
      }
    });

    // Merge preserved params with new DataView params
    preservedParams.forEach((value, key) => {
      newParams.set(key, value);
    });

    setSearchParams(newParams, { replace: true });
  }, [state, syncUrl, resourceKey, searchParams, setSearchParams]);

  const setView = useCallback((view: "table" | "grid") => {
    setState((prev) => ({ ...prev, view }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setState((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setState((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setFilter = useCallback(
    (
      key: string | number | symbol,
      value: unknown,
      opts?: { resetPage?: boolean },
    ) => {
      setState((prev) => {
        const keyStr = String(key);
        if (keyStr === "sortBy" || keyStr === "order") {
          return {
            ...prev,
            [keyStr]: value,
            page: opts?.resetPage !== false ? 1 : prev.page,
          };
        }
        return {
          ...prev,
          filters: {
            ...prev.filters,
            [keyStr]:
              value === "" || value === null || value === undefined
                ? undefined
                : value,
          } as Partial<TFilters>,
          page: opts?.resetPage !== false ? 1 : prev.page,
        };
      });
    },
    [],
  );

  const replaceFilters = useCallback(
    (partial: Partial<TFilters & { sortBy?: string; order?: SortOrder }>) => {
      setState((prev) => {
        const newState = { ...prev };

        if (partial.sortBy !== undefined) {
          newState.sortBy = partial.sortBy;
        }
        if (partial.order !== undefined) {
          newState.order = partial.order;
        }

        newState.filters = {
          ...prev.filters,
          ...(Object.fromEntries(
            Object.entries(partial).filter(
              ([k]) => k !== "sortBy" && k !== "order",
            ),
          ) as Partial<TFilters>),
        };
        newState.page = 1;

        return newState;
      });
    },
    [],
  );

  const clearFilters = useCallback((keys?: (string | number | symbol)[]) => {
    setState((prev) => {
      if (!keys) {
        return {
          ...prev,
          filters: {},
          search: "",
          sortBy: undefined,
          order: undefined,
          page: 1,
        };
      }
      const newFilters = { ...prev.filters };
      keys.forEach((key) => {
        delete newFilters[String(key) as keyof TFilters];
      });
      return {
        ...prev,
        filters: newFilters,
        page: 1,
      };
    });
  }, []);

  const setColumnVisibility = useCallback(
    (visibility: Record<string, boolean>) => {
      setState((prev) => ({
        ...prev,
        columnVisibility: { ...prev.columnVisibility, ...visibility },
      }));
    },
    [],
  );

  const toggleColumnVisibility = useCallback((columnId: string) => {
    setState((prev) => ({
      ...prev,
      columnVisibility: {
        ...prev.columnVisibility,
        [columnId]: !prev.columnVisibility[columnId],
      },
    }));
  }, []);

  const resetSort = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sortBy: undefined,
      order: undefined,
      page: 1,
    }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      setView,
      setPage,
      setLimit,
      setSearch,
      setFilter,
      replaceFilters,
      clearFilters,
      setColumnVisibility,
      toggleColumnVisibility,
      resetSort,
    }),
    [
      state,
      setView,
      setPage,
      setLimit,
      setSearch,
      setFilter,
      replaceFilters,
      clearFilters,
      setColumnVisibility,
      toggleColumnVisibility,
      resetSort,
    ],
  );

  return (
    <DataViewContext.Provider value={value as DataViewContextValue<DataViewFilters>}>
      {children}
    </DataViewContext.Provider>
  );
}
