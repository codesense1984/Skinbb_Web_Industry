import { ComboBox } from "@/core/components/ui/combo-box";
import { PaginationComboBox } from "@/core/components/ui/pagination-combo-box";
import type { Option } from "@/core/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  wrapOptionsFetcher,
  createLegacyFetcher,
  createTransform,
} from "./adapter";
import { toApplied, toControlledValue } from "./helpers";
import type {
  AppliedFilters,
  FilterBarProps,
  FilterConfig,
  FilterValue,
} from "./types";

/**
 * FilterBar component that provides a reusable filter system
 * Integrates with existing ComboBox and PaginationComboBox components
 * Supports cascading dependencies and auto-apply mode
 */
export function FilterBar({
  filters,
  defaultValues = {},
  onApply,
  onChangeWorking,
  showAction = true,
  className,
}: FilterBarProps) {
  // Working state (unapplied selections)
  const [working, setWorking] = useState<AppliedFilters>(() => {
    // Initialize from defaultValues
    return { ...defaultValues };
  });

  // Applied state (confirmed selections)
  const [applied, setApplied] = useState<AppliedFilters>(() => {
    return { ...defaultValues };
  });

  // Sync with defaultValues changes (e.g., when filters are cleared externally)
  useEffect(() => {
    setWorking({ ...defaultValues });
    setApplied({ ...defaultValues });
  }, [defaultValues]);

  // Debounce timer for auto-apply mode
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Build dependency map: which filters depend on which
  const dependencyMap = useMemo(() => {
    const map = new Map<string, string[]>();
    filters.forEach((filter) => {
      if (filter.dependsOn) {
        filter.dependsOn.forEach((parentKey) => {
          if (!map.has(parentKey)) {
            map.set(parentKey, []);
          }
          map.get(parentKey)!.push(filter.key);
        });
      }
    });
    return map;
  }, [filters]);

  // Check if a filter should be disabled based on dependencies
  const isFilterDisabled = useCallback(
    (config: FilterConfig): boolean => {
      // If dependsOnBehavior is "clear", never disable (only clear values)
      if (config.dependsOnBehavior === "clear") {
        return false;
      }

      if (!config.dependsOn || config.dependsOn.length === 0) {
        return false;
      }

      // For "disable+clear" (default), disable if any parent is empty
      const behavior = config.dependsOnBehavior ?? "disable+clear";
      if (behavior === "disable+clear") {
        return config.dependsOn.some((parentKey) => {
          const parentValue = working[parentKey] ?? applied[parentKey];
          return !parentValue || parentValue === null;
        });
      }

      return false;
    },
    [working, applied],
  );

  // Clear dependent filters when a parent filter changes
  const clearDependentFilters = useCallback(
    (changedKey: string, newWorking: AppliedFilters): AppliedFilters => {
      const dependentKeys = dependencyMap.get(changedKey);
      if (!dependentKeys || dependentKeys.length === 0) {
        return newWorking;
      }

      const cleared = { ...newWorking };
      dependentKeys.forEach((depKey) => {
        cleared[depKey] = null;
      });

      // Recursively clear filters that depend on the cleared filters
      dependentKeys.forEach((depKey) => {
        const nestedDeps = dependencyMap.get(depKey);
        if (nestedDeps && nestedDeps.length > 0) {
          nestedDeps.forEach((nestedKey) => {
            cleared[nestedKey] = null;
          });
        }
      });

      return cleared;
    },
    [dependencyMap],
  );

  // Update working state for a specific filter with cascading logic
  const updateWorking = useCallback(
    (key: string, value: FilterValue | FilterValue[] | null) => {
      setWorking((prev) => {
        const next = { ...prev, [key]: value };
        const cleared = clearDependentFilters(key, next);
        onChangeWorking?.(cleared);
        return cleared;
      });
    },
    [clearDependentFilters, onChangeWorking],
  );

  // Handle filter value change
  const handleFilterChange = useCallback(
    (config: FilterConfig) =>
      (_value: string | string[], option: Option | Option[] | undefined) => {
        const filterValue = toApplied(option);

        // Auto-apply mode: debounce and apply immediately
        if (!showAction) {
          // Clear existing timer
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          // Update working state with cascading logic
          setWorking((prev) => {
            const next = { ...prev, [config.key]: filterValue };
            const cleared = clearDependentFilters(config.key, next);
            onChangeWorking?.(cleared);

            // Set new timer for auto-apply
            debounceTimerRef.current = setTimeout(() => {
              setApplied(cleared);
              onApply(cleared);
            }, 250); // 250ms debounce

            return cleared;
          });
        } else {
          // Manual apply mode: just update working state
          updateWorking(config.key, filterValue);
        }
      },
    [
      updateWorking,
      showAction,
      clearDependentFilters,
      onApply,
      onChangeWorking,
    ],
  );

  // Apply all working filters
  const handleApply = useCallback(() => {
    setApplied(working);
    onApply(working);
  }, [working, onApply]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    const cleared: AppliedFilters = {};
    filters.forEach((filter) => {
      cleared[filter.key] = null;
    });
    setWorking(cleared);
    setApplied(cleared);
    onChangeWorking?.(cleared);
    onApply(cleared);
  }, [filters, onChangeWorking, onApply]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Check if there are any working changes
  const hasChanges = useMemo(() => {
    return filters.some((filter) => {
      const workingValue = working[filter.key];
      const appliedValue = applied[filter.key];

      // Compare values
      if (!workingValue && !appliedValue) return false;
      if (!workingValue || !appliedValue) return true;

      if (Array.isArray(workingValue) && Array.isArray(appliedValue)) {
        if (workingValue.length !== appliedValue.length) return true;
        const workingValues = workingValue.map((v) => v.value).sort();
        const appliedValues = appliedValue.map((v) => v.value).sort();
        return JSON.stringify(workingValues) !== JSON.stringify(appliedValues);
      }

      if (!Array.isArray(workingValue) && !Array.isArray(appliedValue)) {
        return workingValue.value !== appliedValue.value;
      }

      return true;
    });
  }, [working, applied, filters]);

  // Render a single filter
  const renderFilter = useCallback(
    (config: FilterConfig) => {
      const workingValue = working[config.key];
      const controlledValue = toControlledValue(workingValue);
      const isMulti = config.mode === "multi";
      const isDisabled = isFilterDisabled(config);
      const uiType = config.ui ?? "dropdown";

      // Only render dropdown UI for now (can be extended later)
      if (uiType !== "dropdown") {
        return null;
      }

      if (config.data.kind === "static") {
        // Static dropdown using ComboBox
        const options: Option[] = config.data.options.map((opt) => {
          const option: Option = {
            value: opt.value,
            label: opt.label,
          };
          if (opt.meta) {
            option.meta = opt.meta;
          }
          return option;
        });

        return (
          <ComboBox
            key={config.key}
            options={options}
            value={controlledValue}
            onChange={handleFilterChange(config)}
            placeholder={config.placeholder || `Select ${config.label}...`}
            multi={isMulti}
            disabled={isDisabled}
            // className="min-w-[200px]"
            className={config.className}
            emptyMessage={
              config.emptyText ||
              `No ${config?.label?.toLowerCase() || config?.key?.toLowerCase() || "filter"} found`
            }
            renderButton={config.renderButton}
          />
        );
      } else {
        // Remote dropdown using PaginationComboBox
        const remoteData = config.data;

        // Resolve fetcher: prefer new fetcher, fall back to legacy adapter shim
        const optionsFetcher = remoteData.fetcher
          ? remoteData.fetcher
          : remoteData.adapter
            ? createLegacyFetcher(remoteData.adapter)
            : async () => ({ options: [], totalPages: null });

        // Wrap the fetcher for PaginationComboBox
        const apiFunction = wrapOptionsFetcher(optionsFetcher, () => ({
          working,
          applied,
        }));

        // Create transform function (identity since fetcher already returns { value, label, meta })
        const transform = createTransform(optionsFetcher);

        return (
          <PaginationComboBox
            key={config.key}
            apiFunction={apiFunction}
            transform={transform}
            value={controlledValue}
            onChange={handleFilterChange(config)}
            placeholder={
              config.placeholder || `Search ${config.label || config.key}...`
            }
            multi={isMulti}
            disabled={isDisabled}
            componentEnabled={!isDisabled}
            pageSize={remoteData.pageSize ?? 10}
            searchDebounceMs={remoteData.debounceMs ?? 300}
            minSearchLength={remoteData.minQueryLength ?? 0}
            queryKey={
              (remoteData.queryKey as string[]) ?? [`filter-${config.key}`]
            }
            staleTime={remoteData.staleTime}
            gcTime={remoteData.gcTime}
            className={config.className}
            enableInfiniteScroll={true}
            // className="min-w-[200px]"
            emptyMessage={
              config.emptyText || `No ${config?.label?.toLowerCase()} found`
            }
            renderButton={config.renderButton}
          />
        );
      }
    },
    [working, applied, handleFilterChange, isFilterDisabled],
  );

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => {
          if (filter.label) {
            return (
              <div key={filter.key} className="flex flex-col gap-1">
                <label className="text-foreground text-sm font-medium">
                  {filter.label}
                </label>
                {renderFilter(filter)}
              </div>
            );
          }

          return renderFilter(filter);
        })}
        {showAction && (
          <div className="flex items-end gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleClearAll}
              disabled={!hasChanges && Object.values(applied).every((v) => !v)}
            >
              Clear all
            </Button>
            <Button type="button" onClick={handleApply} disabled={!hasChanges}>
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
