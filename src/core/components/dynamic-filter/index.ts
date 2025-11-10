/**
 * Filter Module - Barrel Export
 *
 * A dynamic, extensible filter system for React 18 with TypeScript.
 * Supports controlled/uncontrolled usage, multiple filter types, and optimized re-renders.
 */

// Types and type guards
export type {
  FilterOption,
  FilterValue,
  SelectionMode,
  FilterType,
} from "./types";

export {
  isPlainObject,
  isFilterOption,
  isFilterOptionArray,
  isFilterValueMap,
  assertFilterOption,
  assertFilterOptionArray,
  assertFilterValueMap,
  toArray,
  dedupeByValue,
} from "./types";

// Components
export { FilterProvider } from "./context";
export { FilterItem } from "./FilterItem";
export { FilterDataItem } from "./FilterDataItem";
export type {
  FilterItemRenderProps,
  FilterItemProps,
  FilterItemBaseProps,
  DropdownElementProps,
  DateElementProps,
  InputElementProps,
  PaginationElementProps,
  BuiltInElementPropsMap,
} from "./FilterItem";

// Hooks
export { useFilters, useFilterItem } from "./hooks";

// Context (for advanced usage)
export { useFilterContext, useFilterRegistry } from "./context";

// Utils
export { shallowEqual, shallowEqualOptions } from "./utils";

// Cache
export { getCache, resetCache } from "./cache";
