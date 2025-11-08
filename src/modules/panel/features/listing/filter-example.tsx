/**
 * Example: How to use FilterBar in ProductList
 *
 * This file demonstrates how to integrate the FilterBar component
 * with the ProductList feature using the new function-based fetcher approach.
 */

import {
  FilterBar,
  type FilterConfig,
  type AppliedFilters,
} from "@/core/components/filters";
import { brandOptionsFetcher } from "./fetchers/brand-options-fetcher";

// Example filter configuration for ProductList
export const productListFilters: FilterConfig[] = [
  // Static status filter
  {
    key: "status",
    label: "Status",
    mode: "multi",
    ui: "dropdown",
    data: {
      kind: "static",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "draft", label: "Draft" },
        { value: "publish", label: "Publish" },
      ],
    },
    placeholder: "Select status...",
  },
  // Remote brand filter (cascades from company and location)
  // Uses the new function-based fetcher approach
  {
    key: "brand",
    label: "Brand",
    mode: "multi",
    ui: "dropdown",
    data: {
      kind: "remote",
      fetcher: brandOptionsFetcher(), // Function-based async fetcher
      pageSize: 10,
      debounceMs: 300,
      minQueryLength: 0,
      queryKey: ["filter-brands"],
    },
    placeholder: "Search brands...",
  },
];

/**
 * Example usage in a component:
 *
 * const ProductList = () => {
 *   const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
 *
 *   const handleApplyFilters = (filters: AppliedFilters) => {
 *     setAppliedFilters(filters);
 *     // Apply filters to your data fetching logic
 *     const companyId = filters.company
 *       ? (Array.isArray(filters.company) ? filters.company[0] : filters.company).value
 *       : undefined;
 *     const brandIds = filters.brand
 *       ? (Array.isArray(filters.brand) ? filters.brand : [filters.brand]).map(b => b.value)
 *       : undefined;
 *     // ... use these in your API calls
 *   };
 *
 *   return (
 *     <FilterBar
 *       filters={productListFilters}
 *       defaultValues={appliedFilters}
 *       onApply={handleApplyFilters}
 *     />
 *   );
 * };
 */
