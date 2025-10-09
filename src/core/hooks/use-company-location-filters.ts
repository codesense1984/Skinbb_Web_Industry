import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

export interface CompanyLocationFilterState {
  selectedCompanyId: string;
  selectedLocationId: string;
  isTableReady: boolean;
}

export interface CompanyLocationFilterActions {
  handleCompanyChange: (companyId: string) => void;
  handleLocationChange: (locationId: string) => void;
  updateTableFilters: () => void;
  setTableStateRef: (tableState: any) => void;
}

export interface UseCompanyLocationFiltersOptions {
  /** URL parameter names for company and location */
  urlParams?: {
    companyId?: string;
    locationId?: string;
  };
  /** Debounce delay in milliseconds */
  debounceMs?: number;
}

export interface UseCompanyLocationFiltersReturn
  extends CompanyLocationFilterState,
    CompanyLocationFilterActions {}

/**
 * Custom hook for managing company and location filters with URL synchronization
 *
 * @param options Configuration options for the hook
 * @returns Filter state and actions
 *
 * @example
 * ```tsx
 * const {
 *   selectedCompanyId,
 *   selectedLocationId,
 *   handleCompanyChange,
 *   handleLocationChange,
 *   setTableStateRef
 * } = useCompanyLocationFilters({
 *   urlParams: { companyId: 'companyId', locationId: 'locationId' },
 *   debounceMs: 100
 * });
 * ```
 */
export function useCompanyLocationFilters(
  options: UseCompanyLocationFiltersOptions = {},
): UseCompanyLocationFiltersReturn {
  const {
    urlParams = { companyId: "companyId", locationId: "locationId" },
    debounceMs = 100,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [isTableReady, setIsTableReady] = useState(false);
  const tableStateRef = useRef<any>(null);

  // Initialize filters from URL parameters
  useEffect(() => {
    const companyIdFromUrl = searchParams.get(urlParams.companyId!);
    const locationIdFromUrl = searchParams.get(urlParams.locationId!);

    if (companyIdFromUrl) {
      setSelectedCompanyId(companyIdFromUrl);
    }
    if (locationIdFromUrl) {
      setSelectedLocationId(locationIdFromUrl);
    }
  }, [searchParams, urlParams.companyId, urlParams.locationId]);

  // Handle company filter change
  const handleCompanyChange = useCallback(
    (companyId: string) => {
      setSelectedCompanyId(companyId);
      setSelectedLocationId(""); // Reset location when company changes

      // Update URL parameters
      const newParams = new URLSearchParams(searchParams);
      if (companyId) {
        newParams.set(urlParams.companyId!, companyId);
      } else {
        newParams.delete(urlParams.companyId!);
      }
      newParams.delete(urlParams.locationId!); // Remove location when company changes
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams, urlParams.companyId, urlParams.locationId],
  );

  // Handle location filter change
  const handleLocationChange = useCallback(
    (locationId: string) => {
      setSelectedLocationId(locationId);

      // Update URL parameters
      const newParams = new URLSearchParams(searchParams);
      if (locationId) {
        newParams.set(urlParams.locationId!, locationId);
      } else {
        newParams.delete(urlParams.locationId!);
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams, urlParams.locationId],
  );

  // Debounced filter update function
  const updateTableFilters = useCallback(() => {
    if (tableStateRef.current) {
      const currentFilters =
        tableStateRef.current.table.getState().columnFilters;
      const newFilters: Array<{ id: string; value: string }> = [];

      if (selectedCompanyId) {
        newFilters.push({ id: "companyId", value: selectedCompanyId });
      }
      if (selectedLocationId) {
        newFilters.push({ id: "locationId", value: selectedLocationId });
      }

      // Only update if filters have actually changed
      const hasChanged =
        currentFilters.length !== newFilters.length ||
        currentFilters.some(
          (filter: any, index: number) =>
            !newFilters[index] ||
            filter.id !== newFilters[index].id ||
            filter.value !== newFilters[index].value,
        );

      if (hasChanged) {
        tableStateRef.current.table.setColumnFilters(newFilters);
      }
    }
  }, [selectedCompanyId, selectedLocationId]);

  // Update table filters when selectedCompanyId or selectedLocationId changes
  useEffect(() => {
    if (isTableReady) {
      const timeoutId = setTimeout(updateTableFilters, debounceMs);
      return () => clearTimeout(timeoutId);
    }
  }, [updateTableFilters, isTableReady, debounceMs]);

  // Set table state reference
  const setTableStateRef = useCallback((tableState: any) => {
    tableStateRef.current = tableState;
    setIsTableReady(true);
  }, []);

  return {
    selectedCompanyId,
    selectedLocationId,
    isTableReady,
    handleCompanyChange,
    handleLocationChange,
    updateTableFilters,
    setTableStateRef,
  };
}
