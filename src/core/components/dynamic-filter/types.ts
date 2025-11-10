/**
 * Core types and runtime validators for the filter module
 */

export type FilterOption = { label: string; value: string; meta?: unknown };

export type FilterValue = Record<string, FilterOption[]>;

export type SelectionMode = "single" | "multi";

export type FilterType = "dropdown" | "input" | "date" | "custom" | "pagination";

/**
 * Type guard: checks if value is a plain object (not array, null, or class instance)
 */
export function isPlainObject(x: unknown): x is Record<string, unknown> {
  return (
    typeof x === "object" &&
    x !== null &&
    Object.getPrototypeOf(x) === Object.prototype
  );
}

/**
 * Type guard: checks if value is a valid FilterOption
 */
export function isFilterOption(x: unknown): x is FilterOption {
  if (!isPlainObject(x)) return false;
  return typeof x.label === "string" && typeof x.value === "string";
}

/**
 * Type guard: checks if value is an array of FilterOption
 */
export function isFilterOptionArray(x: unknown): x is FilterOption[] {
  return Array.isArray(x) && x.every(isFilterOption);
}

/**
 * Type guard: checks if value is a valid FilterValue map
 */
export function isFilterValueMap(
  x: unknown,
): x is Record<string, FilterOption[]> {
  if (!isPlainObject(x)) return false;
  for (const k in x) {
    if (!isFilterOptionArray((x as Record<string, unknown>)[k])) return false;
  }
  return true;
}

/**
 * Helper to format error messages with optional path
 */
function error(msg: string): never {
  throw new TypeError(msg);
}

const pathOf = (p?: string) => (p ? `${p}: ` : "");

/**
 * Assertion: throws if value is not a FilterOption
 */
export function assertFilterOption(
  x: unknown,
  path?: string,
): asserts x is FilterOption {
  if (!isFilterOption(x)) {
    const message =
      process.env.NODE_ENV === "production"
        ? `${pathOf(path)}Invalid FilterOption`
        : `${pathOf(path)}Expected FilterOption { label: string; value: string; meta?: unknown }`;
    error(message);
  }
}

/**
 * Assertion: throws if value is not a FilterOption[]
 */
export function assertFilterOptionArray(
  x: unknown,
  path?: string,
): asserts x is FilterOption[] {
  if (!isFilterOptionArray(x)) {
    const message =
      process.env.NODE_ENV === "production"
        ? `${pathOf(path)}Invalid FilterOption[]`
        : `${pathOf(path)}Expected FilterOption[]`;
    error(message);
  }
}

/**
 * Assertion: throws if value is not a FilterValue map
 */
export function assertFilterValueMap(
  x: unknown,
  path?: string,
): asserts x is Record<string, FilterOption[]> {
  if (!isFilterValueMap(x)) {
    const message =
      process.env.NODE_ENV === "production"
        ? `${pathOf(path)}Invalid FilterValue`
        : `${pathOf(path)}Expected Record<string, FilterOption[]> with each item {label,value,meta?}`;
    error(message);
  }
}

/**
 * Converts a single FilterOption, array, null, or undefined to FilterOption[]
 */
export function toArray(
  v: FilterOption | FilterOption[] | null | undefined,
): FilterOption[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * Removes duplicate FilterOptions by value property
 */
export function dedupeByValue(list: FilterOption[]): FilterOption[] {
  const seen = new Set<string>();
  const out: FilterOption[] = [];
  for (const item of list) {
    if (!seen.has(item.value)) {
      seen.add(item.value);
      out.push(item);
    }
  }
  return out;
}
