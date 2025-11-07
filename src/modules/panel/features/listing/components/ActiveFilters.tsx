import { XIcon } from "lucide-react";
import { cn } from "@/core/utils";
import React from "react";
import { STATUS_MAP, type ModuleType } from "@/core/config/status";

interface ActiveFilterChip {
  key: string;
  label: string;
  value: string | string[];
  displayValue?: string | string[]; // Optional display value (e.g., name instead of ID)
  onRemove: () => void;
}

interface ActiveFiltersProps {
  filters: ActiveFilterChip[];
  module?: ModuleType;
  className?: string;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  module,
  className,
}) => {
  if (filters.length === 0) {
    return null;
  }

  const getStatusLabel = (value: string): string => {
    if (!module) return value;
    const statusMap = STATUS_MAP[module];
    const status = statusMap?.[value];
    return status?.label || value;
  };

  const renderFilterChip = (filter: ActiveFilterChip) => {
    const values = Array.isArray(filter.value) ? filter.value : [filter.value];
    const displayValues = filter.displayValue
      ? Array.isArray(filter.displayValue)
        ? filter.displayValue
        : [filter.displayValue]
      : values;

    return values.map((value, index) => {
      let displayValue: string;
      if (filter.key === "status" && module) {
        displayValue = getStatusLabel(value);
      } else if (displayValues[index]) {
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
            {filter.label}: {displayValue}
          </span>
          <button
            type="button"
            onClick={filter.onRemove}
            className="rounded-full p-0.5 text-purple-600 transition-colors hover:text-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:outline-none"
            aria-label={`Remove ${filter.label} filter: ${displayValue}`}
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.flatMap(renderFilterChip)}
    </div>
  );
};
