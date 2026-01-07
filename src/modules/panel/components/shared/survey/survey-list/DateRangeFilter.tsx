import { FilterDataItem } from "@/core/components/dynamic-filter";

interface DateRangeFilterProps {
  startDateKey?: string;
  endDateKey?: string;
  startDatePlaceholder?: string;
  endDatePlaceholder?: string;
}

/**
 * Date range filter component for surveys.
 * Provides separate filters for start date and end date.
 */
export const DateRangeFilter = ({
  startDateKey = "startDate",
  endDateKey = "endDate",
  startDatePlaceholder = "Start date...",
  endDatePlaceholder = "End date...",
}: DateRangeFilterProps) => {
  return (
    <>
      <FilterDataItem
        dataKey={startDateKey}
        type="date"
        mode="single"
        placeholder={startDatePlaceholder}
      />
      <FilterDataItem
        dataKey={endDateKey}
        type="date"
        mode="single"
        placeholder={endDatePlaceholder}
      />
    </>
  );
};
