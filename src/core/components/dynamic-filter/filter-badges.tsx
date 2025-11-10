import { capitalize, cn } from "@/core/utils";
import { XCircleIcon } from "@heroicons/react/24/outline";
import type { FilterOption } from "./types";
import type { Dispatch, SetStateAction } from "react";

interface ActiveFilterChip {
  key: string;
  label: string;
  value: string | string[];
  displayValue?: string | string[]; // Optional display value (e.g., name instead of ID)
  onRemove: () => void;
}

interface ActiveFiltersProps {
  filters: ActiveFilterChip[];
  className?: string;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  className,
}) => {
  if (filters.length === 0) {
    return null;
  }

  const renderFilterChip = (filter: ActiveFilterChip) => {
    const values = Array.isArray(filter.value) ? filter.value : [filter.value];
    const displayValues = filter.displayValue
      ? Array.isArray(filter.displayValue)
        ? filter.displayValue
        : [filter.displayValue]
      : values;

    return values.map((value, index) => {
      let displayValue: string;
      if (displayValues[index]) {
        displayValue = displayValues[index];
      } else {
        displayValue = value;
      }

      return (
        <div
          key={`${filter.key}-${value}-${index}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm",
            className,
          )}
        >
          <span className="text-blue-600">
            {capitalize((filter.displayValue ?? "") as string)} : {filter.label}
          </span>
          <button
            type="button"
            onClick={filter.onRemove}
            className="rounded-full p-0.5 text-purple-600 transition-colors hover:text-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:outline-none"
            aria-label={`Remove ${filter.label} filter: ${displayValue}`}
          >
            <XCircleIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    });
  };

  return filters.flatMap(renderFilterChip);
};

interface FilterBadgesProps {
  filters: Record<string, FilterOption[]>;
  className?: string;
  setFilterValue: Dispatch<SetStateAction<Record<string, FilterOption[]>>>;
}
export const FilterBadges: React.FC<FilterBadgesProps> = ({
  filters,
  className,
  setFilterValue,
}) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {Object.entries(filters).map(([key, value]) => (
        <ActiveFilters
          key={key}
          filters={value.map((item) => ({
            key,
            label: item.label,
            value: item.value,
            displayValue: key,
            onRemove: () => {
              setFilterValue((prev) => {
                const newFilters = { ...prev };
                delete newFilters[key];
                return newFilters;
              });
            },
          }))}
        />
      ))}
    </div>
  );
};
