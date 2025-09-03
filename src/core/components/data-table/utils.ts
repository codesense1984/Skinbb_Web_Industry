import { type Row } from "@tanstack/react-table";

export function createGlobalFilter<TData extends object>(
  filterableKeys?: (keyof TData)[],
) {
  return (row: Row<TData>, _columnId: string, filterValue: string) => {
    const keys = filterableKeys?.length
      ? filterableKeys
      : Object.keys(row.original);

    return keys.some((key) => {
      const value = row.original[key as keyof TData];
      return String(value ?? "")
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    });
  };
}
