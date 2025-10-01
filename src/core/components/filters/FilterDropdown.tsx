import PaginationComboBox from "@/core/components/ui/pagination-combo-box";
import type { ServerTableFetcher } from "@/core/components/data-table";

interface FilterDropdownProps<T> {
  apiFunction: ServerTableFetcher<T>;
  transform: (item: T) => { value: string; label: string };
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  queryKey?: string[];
  enabled?: boolean;
  componentEnabled?: boolean;
}

export function FilterDropdown<T>({
  apiFunction,
  transform,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "w-[200px]",
  queryKey = ["filter"],
  enabled = true,
  componentEnabled = true,
}: FilterDropdownProps<T>) {
  return (
    <PaginationComboBox<T>
      apiFunction={apiFunction}
      transform={transform}
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={(item) => onChange(item as string)}
      disabled={disabled}
      clearable
      searchable
      minSearchLength={0}
      queryKey={queryKey}
      enabled={enabled}
      componentEnabled={componentEnabled}
    />
  );
}
