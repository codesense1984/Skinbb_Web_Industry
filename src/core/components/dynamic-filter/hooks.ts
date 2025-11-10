/**
 * Custom hooks for filter management
 */

import * as React from "react";
import type { FilterOption, SelectionMode } from "./types";
import { useFilterContext } from "./context";

/**
 * Main hook to access and manipulate filter state
 */
export function useFilters(): {
  value: Record<string, FilterOption[]>;
  setItem: (
    key: string,
    values: FilterOption[],
    opts?: { mode?: "single" | "multi" },
  ) => void;
  clearItem: (key: string) => void;
  clearAll: () => void;
} {
  const context = useFilterContext();
  return {
    value: context.value,
    setItem: context.setItem,
    clearItem: context.clearItem,
    clearAll: context.clearAll,
  };
}

/**
 * Hook to access and manipulate a specific filter item
 * Uses selector pattern to avoid unnecessary re-renders
 */
export function useFilterItem(key: string): {
  value: FilterOption[];
  set: (values: FilterOption[], mode: SelectionMode) => void;
} {
  const context = useFilterContext();
  const [localValue, setLocalValue] = React.useState<FilterOption[]>(
    context.value[key] ?? [],
  );

  // Subscribe to changes for this specific key
  React.useEffect(() => {
    const unsubscribe = context.subscribe(key, () => {
      setLocalValue(context.value[key] ?? []);
    });
    return unsubscribe;
  }, [key, context]);

  // Sync with context value on mount or when key changes
  React.useEffect(() => {
    setLocalValue(context.value[key] ?? []);
  }, [key, context.value]);

  const set = React.useCallback(
    (values: FilterOption[], mode: SelectionMode = "single") => {
      context.setItem(key, values, { mode });
    },
    [key, context],
  );

  return {
    value: localValue,
    set,
  };
}
