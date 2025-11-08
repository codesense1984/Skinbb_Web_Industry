import type { Option } from "@/core/types";
import type { FilterValue } from "./types";

/**
 * Converts AppliedFilters value to controlled value format (string | string[])
 */
export function toControlledValue(
  applied: FilterValue | FilterValue[] | null | undefined,
): string | string[] {
  if (!applied) {
    return "";
  }
  if (Array.isArray(applied)) {
    return applied.map((item) => item.value);
  }
  return applied.value;
}

/**
 * Converts Option(s) to AppliedFilters format (FilterValue | FilterValue[] | null)
 */
export function toApplied(
  optionOrOptions: Option | Option[] | undefined,
): FilterValue | FilterValue[] | null {
  if (!optionOrOptions) {
    return null;
  }
  if (Array.isArray(optionOrOptions)) {
    return optionOrOptions.map((opt) => ({
      value: opt.value,
      label: String(opt.label),
    }));
  }
  return {
    value: optionOrOptions.value,
    label: String(optionOrOptions.label),
  };
}

/**
 * Converts AppliedFilters to Option(s) for use with ComboBox/PaginationComboBox
 */
export function toOptions(
  applied: FilterValue | FilterValue[] | null | undefined,
): Option | Option[] | undefined {
  if (!applied) {
    return undefined;
  }
  if (Array.isArray(applied)) {
    return applied.map((item) => ({
      value: item.value,
      label: item.label,
    }));
  }
  return {
    value: applied.value,
    label: applied.label,
  };
}

/**
 * Converts Option(s) to FilterValue(s) for AppliedFilters
 */
export function optionsToFilterValue(
  optionOrOptions: Option | Option[] | undefined,
): FilterValue | FilterValue[] | null {
  return toApplied(optionOrOptions);
}
