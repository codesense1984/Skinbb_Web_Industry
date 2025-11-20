import { FilterDataItem } from "@/core/components/dynamic-filter";
import { STATUS_MAP } from "@/core/config/status";

interface StatusFilterProps {
  dataKey?: string;
  placeholder?: string;
}

/**
 * Status filter component specifically for brands.
 * Uses the brand status map from the status configuration.
 */
export const StatusFilter = ({
  dataKey = "status",
  placeholder = "Select status...",
}: StatusFilterProps) => {
  const statusOptions = Object.values(STATUS_MAP.brand);

  return (
    <FilterDataItem
      dataKey={dataKey}
      type="dropdown"
      mode="single"
      options={statusOptions}
      placeholder={placeholder}
    />
  );
};
