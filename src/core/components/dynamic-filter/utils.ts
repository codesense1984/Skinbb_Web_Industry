/**
 * Utility functions for the filter module
 */

import type { FilterOption } from "./types";
import { dedupeByValue, toArray } from "./types";

export { dedupeByValue, toArray };

/**
 * Shallow equality check for two objects
 */
export function shallowEqual<T extends Record<string, unknown>>(
  a: T,
  b: T,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/**
 * Shallow equality check for two FilterOption arrays
 */
export function shallowEqualOptions(
  a: FilterOption[],
  b: FilterOption[],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].value !== b[i].value || a[i].label !== b[i].label) return false;
  }
  return true;
}

import * as React from "react";

/**
 * Creates a stable reference using useRef pattern
 * Useful for memoization
 */
export function useStableRef<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef<T>(value);
  ref.current = value;
  return ref;
}
