import type { ResponseShape } from "../types";

/**
 * Extract table data from query result
 * @template TItem - Type of items
 */
export function extractTableData<TItem>(
  data: { data: { items: TItem[] } } | undefined,
): TItem[] {
  return data?.data?.items ?? [];
}

/**
 * Extract grid data from infinite query result
 * @template TItem - Type of items
 */
export function extractGridData<TItem>(
  data: { pages: Array<{ data: { items: TItem[] } }> } | undefined,
): TItem[] {
  if (!data?.pages) return [];
  return data.pages.flatMap((page) => page.data?.items ?? []);
}

/**
 * Extract total records from table query result
 */
export function extractTableTotalRecords(
  data: { data: { totalRecords: number } } | undefined,
): number {
  return data?.data?.totalRecords ?? 0;
}

/**
 * Extract total records from grid query result
 */
export function extractGridTotalRecords(
  data: { pages: Array<{ data: { totalRecords: number } }> } | undefined,
): number {
  if (!data?.pages || data.pages.length === 0) return 0;
  const lastPage = data.pages[data.pages.length - 1];
  return lastPage?.data?.totalRecords ?? 0;
}

/**
 * Extract total pages from table query result
 */
export function extractTableTotalPages(
  data: { data: { totalPages: number } } | undefined,
): number {
  return data?.data?.totalPages ?? 1;
}

/**
 * Extract total pages from grid query result
 */
export function extractGridTotalPages(
  data: { pages: Array<{ data: { totalPages: number } }> } | undefined,
): number {
  if (!data?.pages || data.pages.length === 0) return 1;
  const lastPage = data.pages[data.pages.length - 1];
  return lastPage?.data?.totalPages ?? 1;
}

