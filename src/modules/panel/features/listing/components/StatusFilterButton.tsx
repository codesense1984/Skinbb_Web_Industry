import { useDataViewContext } from "@/core/components/data-view/context";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Label } from "@/core/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import { STATUS_MAP, type ModuleType } from "@/core/config/status";
import React, { useCallback, useMemo, useState } from "react";
import { FilterButton } from "./FilterButton";

interface StatusFilterButtonProps<TFilters> {
  module: ModuleType;
  multi?: boolean;
  className?: string;
  name?: string;
}

export const StatusFilterButton = React.memo(
  <TFilters extends Record<string, unknown> = Record<string, unknown>>({
    module,
    multi = true,
    className,
    name = "status",
  }: StatusFilterButtonProps<TFilters>) => {
    const { state, setFilter } = useDataViewContext<TFilters>();
    const [open, setOpen] = useState(false);

    const statusOptions = STATUS_MAP[module] || {};
    const statusEntries = Object.entries(statusOptions);

    // Get current filter value from state
    const currentFilter = useMemo(() => {
      const filterValue = state.filters?.[name as keyof TFilters];
      if (Array.isArray(filterValue)) {
        return filterValue;
      }
      if (filterValue) {
        return [String(filterValue)];
      }
      return [];
    }, [state.filters, name]);

    // Create filter options from status map
    const filterOptions = useMemo(() => {
      return statusEntries.map(([key, value]) => ({
        label: value.label,
        value: key,
        textColor: value.textColor,
        bgColor: value.bgColor,
      }));
    }, [statusEntries]);

    const handleToggle = useCallback(
      (value: string, checked: boolean) => {
        if (checked) {
          if (multi) {
            // Multiple selection: add to existing filter
            const newFilter = currentFilter.includes(value)
              ? currentFilter
              : [...currentFilter, value];
            setFilter(name as keyof TFilters, newFilter);
          } else {
            // Single selection: replace existing filter
            setFilter(name as keyof TFilters, value);
            setOpen(false);
          }
        } else {
          if (multi) {
            // Multiple selection: remove from filter
            const newFilter = currentFilter.filter((v) => v !== value);
            setFilter(
              name as keyof TFilters,
              newFilter.length > 0 ? newFilter : undefined,
            );
          } else {
            // Single selection: clear filter
            setFilter(name as keyof TFilters, undefined);
            setOpen(false);
          }
        }
      },
      [multi, currentFilter, name, setFilter],
    );

    const selectedCount = currentFilter.length;
    const hasActiveFilter = selectedCount > 0;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FilterButton
            label="Status"
            isActive={hasActiveFilter}
            isOpen={open}
            className={className}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56">
          <div className="space-y-2">
            <div className="font-medium" id="status-filter-label">
              Filter by Status
            </div>
            <div
              className="space-y-2"
              role="group"
              aria-labelledby="status-filter-label"
            >
              {filterOptions.map((option) => {
                const isChecked = currentFilter.includes(option.value);
                const checkboxId = `status-${option.value}`;
                return (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleToggle(option.value, checked === true)
                      }
                      aria-labelledby={`${checkboxId}-label`}
                    />
                    <Label
                      htmlFor={checkboxId}
                      id={`${checkboxId}-label`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      <span
                        className="inline-flex items-center gap-1.5"
                        style={{
                          color: option.textColor,
                          backgroundColor: option.bgColor,
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {option.label}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memoization
    return (
      prevProps.module === nextProps.module &&
      prevProps.multi === nextProps.multi &&
      prevProps.name === nextProps.name &&
      prevProps.className === nextProps.className
    );
  },
) as <TFilters extends Record<string, unknown> = Record<string, unknown>>(
  props: StatusFilterButtonProps<TFilters>,
) => React.ReactElement;

// StatusFilterButton.displayName = "StatusFilterButton";
