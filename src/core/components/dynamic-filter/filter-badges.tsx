import { capitalize, cn } from "@/core/utils";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import type { FilterOption } from "./types";

interface ActiveFilterChip {
  disabled?: boolean;
  key: string;
  label: string;
  value: string | string[];
  displayValue?: string | React.ReactNode; // Optional display value (e.g., name instead of ID)
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
            "border-border inline-flex h-8 items-center gap-1.5 rounded-md border bg-white py-0.5 pr-0.5 pl-3 text-sm shadow-sm",
            className,
          )}
        >
          <span className="text-muted-foreground max-w-[200px] truncate">
            {capitalize((filter.displayValue ?? "") as string)} :{" "}
            <span className="font-medium" title={filter.label}>
              {filter.label}
            </span>
          </span>
          {!filter.disabled && (
            <Button
              variant={"ghost"}
              className="aspect-square h-full rounded-sm p-1"
              onClick={filter.onRemove}
              aria-label={`Remove ${filter.label} filter: ${displayValue}`}
            >
              <XMarkIcon className="size-4" />
            </Button>
          )}
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
          filters={value
            .filter((item) => !item.hidden)
            .map((item) => ({
              key,
              label: item.label,
              value: item.value,
              displayValue: item.displayValue || key,
              disabled: item.disabled,
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
