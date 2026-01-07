import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";

/**
 * Simple hook for URL-based filter management
 * @param filterKeys Array of filter keys to sync with URL
 */
export function useUrlFilters(filterKeys: string[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Initialize from URL
  useEffect(() => {
    const urlFilters: Record<string, string> = {};
    filterKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) urlFilters[key] = value;
    });
    setFilters(urlFilters);
  }, [searchParams, filterKeys.join(",")]);

  // Update filter and URL
  const updateFilter = useCallback(
    (key: string, value: string) => {
      console.log(`Updating filter ${key}:`, value);

      setFilters((prev) => {
        // Only update if value actually changed
        if (prev[key] === value) {
          console.log(`Filter ${key} unchanged, skipping update`);
          return prev;
        }
        console.log(`Filter ${key} changed from ${prev[key]} to ${value}`);
        return { ...prev, [key]: value };
      });

      // Update URL immediately
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      console.log(`Updating URL for ${key}:`, value);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  // Batch update multiple filters
  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      console.log("Batch updating filters:", updates);

      setFilters((prev) => {
        const newFilters = { ...prev };
        let hasChanges = false;

        Object.entries(updates).forEach(([key, value]) => {
          if (newFilters[key] !== value) {
            newFilters[key] = value;
            hasChanges = true;
          }
        });

        if (!hasChanges) {
          console.log("No filter changes, skipping update");
          return prev;
        }

        console.log("Filters changed:", newFilters);
        return newFilters;
      });

      // Update URL with all changes
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      console.log("Updating URL with batch changes:", updates);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  // Clear specific filter
  const clearFilter = useCallback(
    (key: string) => {
      updateFilter(key, "");
    },
    [updateFilter],
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    filterKeys.forEach((key) => newParams.delete(key));
    setSearchParams(newParams);
    setFilters({});
  }, [searchParams, setSearchParams, filterKeys]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilter,
    clearAllFilters,
  };
}
