import { Button } from "@/core/components/ui/button";
import { STATUS_MAP, type ModuleType } from "@/core/config/status";
import { cn } from "@/core/utils";
import { FunnelIcon } from "@heroicons/react/24/outline";
import type { ComponentType } from "react";
import { useMemo, useCallback } from "react";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import PaginationComboBox from "../../ui/pagination-combo-box";
import type { UseTableResponse, ServerTableFetcher } from "../types";

// Constants
const DEFAULT_FILTER_LABEL = "Filter";
const DEFAULT_STATUS_LABEL = "Status";
const FILTER_BADGE_CLASSES =
  "bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium";

/**
 * Represents a filter option with optional styling and custom behavior
 */
export interface FilterOption {
  /** Display label for the option */
  label: string;
  /** Unique value identifier */
  value: string;
  /** Optional text color class */
  color?: string;
  /** Optional background color class */
  bgColor?: string;
  /** Whether the option is checked (for column visibility) */
  checked?: boolean;
  /** Custom toggle handler for special behavior */
  onToggle?: (value: string, checked: boolean) => void;
}

/**
 * Props for the TableFilter component
 */
interface TableFilterProps {
  /** Array of filter options */
  options: FilterOption[];
  /** Currently selected values */
  selectedValues?: string[];
  /** Callback when selection changes */
  onValueChange?: (values: string[]) => void;
  /** Whether to allow multiple selections */
  multi?: boolean;
  /** Filter label text */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Icon component to display in the filter button */
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

/**
 * Props for the StatusFilter component
 */
interface StatusFilterProps<T> {
  /** Table state from useTable hook */
  tableState: UseTableResponse<T>;
  /** Module type for status mapping */
  module: ModuleType;
  /** Whether to allow multiple status selections */
  multi?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Icon component to display in the filter button */
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  name?: string;
}

/**
 * Calculates the selection count for the filter badge
 */
const calculateSelectionCount = (
  options: FilterOption[],
  selectedValues: string[],
): number => {
  const checkedCount = options.filter((option) => option.checked).length;
  return selectedValues.length > 0 ? selectedValues.length : checkedCount;
};

/**
 * Determines if an option is checked based on its state or selected values
 */
const isOptionChecked = (
  option: FilterOption,
  selectedValues: string[],
): boolean => {
  return option.checked !== undefined
    ? option.checked
    : selectedValues.includes(option.value);
};

/**
 * Handles value toggle for both single and multiple selection modes
 */
const handleValueToggle = (
  value: string,
  checked: boolean,
  options: FilterOption[],
  selectedValues: string[],
  multi: boolean,
  onValueChange?: (values: string[]) => void,
) => {
  const option = options.find((opt) => opt.value === value);

  // If option has custom toggle handler, use it
  if (option?.onToggle) {
    option.onToggle(value, checked);
    return;
  }

  // Default filter behavior
  if (multi) {
    // Multiple selection mode
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onValueChange?.(newValues);
  } else {
    // Single selection mode
    if (selectedValues.includes(value)) {
      // If clicking the same value, deselect it
      onValueChange?.([]);
    } else {
      // Select only this value
      onValueChange?.([value]);
    }
  }
};

/**
 * A reusable table filter component with support for single and multiple selection
 */
export function TableFilter({
  options,
  selectedValues = [],
  onValueChange,
  multi = true,
  label = DEFAULT_FILTER_LABEL,
  className,
  icon: Icon = FunnelIcon,
}: TableFilterProps) {
  const selectionCount = calculateSelectionCount(options, selectedValues);
  const hasSelection =
    selectedValues.length > 0 || options.some((option) => option.checked);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outlined" className={cn(className)}>
          <Icon className="text-muted-foreground" aria-hidden={true} />
          {label}
          {hasSelection && (
            <span className={FILTER_BADGE_CLASSES}>
              {multi ? selectionCount : 1}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-36 p-3" align="start">
        <div className="space-y-3">
          <div className="text-muted-foreground text-sm font-medium">
            Filters
          </div>
          <div className="space-y-3">
            {options.map((option, index) => {
              const isChecked = isOptionChecked(option, selectedValues);

              return (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`${option.value}-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleValueToggle(
                        option.value,
                        !!checked,
                        options,
                        selectedValues,
                        multi,
                        onValueChange,
                      )
                    }
                  />
                  <Label
                    htmlFor={`${option.value}-${index}`}
                    className="flex grow justify-between gap-2 font-normal"
                  >
                    <span className="flex items-center gap-2">
                      {/* {option.bgColor && (
                        <div
                          className={cn("h-2 w-2 rounded-full", option.bgColor)}
                        />
                      )} */}
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
}

/**
 * Type for status entries from STATUS_MAP
 */
type StatusEntry = [
  string,
  {
    label: string;
    value: string;
    textColor?: string;
    bgColor?: string;
  },
];

/**
 * Creates filter options from status map entries
 */
const createStatusFilterOptions = (
  statusEntries: StatusEntry[],
): FilterOption[] => {
  return statusEntries.map(([, status]) => ({
    label: status.label,
    value: status.value,
    color: status.textColor,
    bgColor: status.bgColor,
  }));
};

/**
 * Creates a toggle handler for status filter options
 */
const createStatusToggleHandler = <T,>(
  tableState: UseTableResponse<T>,
  multi: boolean,
  name: string,
) => {
  return (value: string, checked: boolean) => {
    const statusColumn = tableState?.table?.getColumn(name);
    if (!statusColumn) return;

    if (checked) {
      if (multi) {
        // Multiple selection: add to existing filter
        const currentFilter = (statusColumn.getFilterValue() as string[]) || [];
        if (!currentFilter.includes(value)) {
          statusColumn.setFilterValue([...currentFilter, value]);
        }
      } else {
        // Single selection: replace existing filter
        statusColumn.setFilterValue([value]);
      }
    } else {
      if (multi) {
        // Multiple selection: remove from filter
        const currentFilter = (statusColumn.getFilterValue() as string[]) || [];
        statusColumn.setFilterValue(currentFilter.filter((v) => v !== value));
      } else {
        // Single selection: clear filter
        statusColumn.setFilterValue(undefined);
      }
    }
  };
};

/**
 * A specialized filter component for table status columns
 */
export function StatusFilter<T>({
  tableState,
  module,
  multi = false,
  className,
  icon,
  name = "status",
}: StatusFilterProps<T>) {
  const statusOptions = STATUS_MAP[module] || {};
  const statusEntries = Object.entries(statusOptions);
  const filterOptions = createStatusFilterOptions(statusEntries);
  const currentFilter =
    (tableState.table.getColumn(name)?.getFilterValue() as string[]) || [];
  const toggleHandler = createStatusToggleHandler(tableState, multi, name);

  const optionsWithState = filterOptions.map((option) => ({
    ...option,
    checked: currentFilter.includes(option.value),
    onToggle: toggleHandler,
  }));

  return (
    <TableFilter
      multi={multi}
      className={className}
      options={optionsWithState}
      label={DEFAULT_STATUS_LABEL}
      icon={icon}
    />
  );
}

/**
 * Props for the PaginationComboBoxFilter component
 */
interface PaginationComboBoxFilterProps<TData = unknown, TFilter = unknown> {
  /** Table state from useTable hook */
  tableState: UseTableResponse<TData>;
  /** API function that returns paginated data */
  apiFunction: ServerTableFetcher<TFilter>;
  /** Transform API data to Option format */
  transform: (item: TFilter) => { value: string; label: string };
  /** Filter key for column filtering */
  filterKey: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to use global filter instead of column filter */
  useGlobalFilter?: boolean;
  /** Whether multiple selection is enabled */
  multi?: boolean;
  /** Maximum number of visible items in multi-select mode */
  maxVisibleItems?: number;
  /** Number of items per page */
  pageSize?: number;
  /** React Query cache key */
  queryKey?: string[];
  /** Additional filter parameters to pass to the API */
  additionalFilters?: Record<string, unknown>;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Custom callback when value changes (overrides default table state update) */
  onValueChange?: (value: string | string[]) => void;
}

/**
 * A paginated combo box filter component that integrates with table state
 *
 * This component provides a searchable dropdown with pagination support
 * that automatically syncs with table filtering state.
 *
 * @template TData - The type of data in the table
 * @template TFilter - The type of data items returned by the API
 *
 * @example
 * ```tsx
 * <PaginationComboBoxFilter<Brand, CompanyListItem>
 *   tableState={tableState}
 *   apiFunction={companyFilter}
 *   transform={(val) => ({ value: val._id, label: val.companyName })}
 *   filterKey="companyId"
 *   placeholder="Filter by company..."
 * />
 * ```
 */
export function PaginationComboBoxFilter<TData = unknown, TFilter = unknown>({
  tableState,
  apiFunction,
  transform,
  filterKey,
  placeholder = "Search and select...",
  className,
  useGlobalFilter = false,
  multi = false,
  maxVisibleItems = 3,
  pageSize = 10,
  queryKey = ["pagination-combo-filter"],
  additionalFilters = {},
  disabled = false,
  onValueChange,
}: PaginationComboBoxFilterProps<TData, TFilter>) {
  // Get current filter value from table state
  const currentValue = useMemo(() => {
    const table = tableState.table;
    const currentState = table.getState();

    if (useGlobalFilter) {
      return currentState.globalFilter || "";
    } else {
      const columnFilter = currentState.columnFilters.find(
        (f) => f.id === filterKey,
      );
      const filterValue = columnFilter?.value;
      // Ensure the value is the correct type
      if (typeof filterValue === "string" || Array.isArray(filterValue)) {
        return filterValue;
      }
      return multi ? [] : "";
    }
  }, [tableState, useGlobalFilter, filterKey, multi]);

  // Handle value change and update table state
  const handleValueChange = useCallback(
    (newValue: string | string[]) => {
      // If custom onValueChange is provided, use it instead of default table state update
      // if (onValueChange) {
      //   onValueChange(newValue);
      //   return;
      // }

      // Default behavior: update table state
      if (useGlobalFilter) {
        // Use global filter
        const filterValue = Array.isArray(newValue)
          ? newValue.join(" ")
          : newValue;
        tableState.setGlobalFilter(filterValue);
      } else {
        // Use column filter
        const table = tableState.table;
        const currentState = table.getState();
        const existingFilters = currentState.columnFilters.filter(
          (f) => f.id !== filterKey,
        );

        const newFilters = [
          ...existingFilters,
          ...(newValue ? [{ id: filterKey, value: newValue }] : []),
        ];

        // Update column filters
        table.setColumnFilters(newFilters);
      }

      console.log(tableState.table.getState(), "onvalue  change");

      onValueChange?.(newValue);
    },
    [tableState, useGlobalFilter, filterKey, onValueChange],
  );

  return (
    <PaginationComboBox<TFilter>
      apiFunction={apiFunction}
      transform={transform}
      placeholder={placeholder}
      value={currentValue}
      onChange={handleValueChange}
      className={className}
      multi={multi}
      maxVisibleItems={maxVisibleItems}
      pageSize={pageSize}
      queryKey={queryKey}
      additionalFilters={additionalFilters}
      disabled={disabled}
      enabled={!disabled}
    />
  );
}
