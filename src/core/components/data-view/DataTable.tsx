import React from "react";
import { DataViewProvider } from "./context";
import { DataView } from "./DataView";
import type { DataTableProps, DataViewFilters, DataViewState } from "./types";

export function DataTable<
  TItem,
  TFilters extends DataViewFilters = DataViewFilters,
>(props: DataTableProps<TItem, TFilters>) {
  const {
    initialState = {},
    resourceKey,
    filterSchema,
    filterFields,
    getRowId,
    fetcher,
    columns,
    ...rest
  } = props;

  const defaultState: DataViewState<TFilters> = {
    view: "table",
    page: initialState.page || 1,
    limit: initialState.limit || 10,
    search: (initialState.filters?.search as string) || "",
    filters: initialState.filters || {},
    sortBy: initialState.sortBy,
    order: initialState.order,
    columnVisibility: {},
  };

  return (
    <DataViewProvider
      initialState={defaultState}
      resourceKey={resourceKey}
      syncUrl={true}
    >
      <DataView
        {...rest}
        fetcher={fetcher}
        columns={columns}
        filterSchema={filterSchema}
        filterFields={filterFields}
        getRowId={getRowId}
        resourceKey={resourceKey}
        initialState={initialState}
      />
    </DataViewProvider>
  );
}
