import React from "react";
import { DataViewProvider } from "./context";
import { DataView } from "./DataView";
import type { DataGridListProps, DataViewFilters, DataViewState } from "./types";

export function DataGridList<TItem, TFilters extends DataViewFilters = DataViewFilters>(
  props: DataGridListProps<TItem, TFilters>,
) {
  const {
    initialState = {},
    resourceKey,
    filterSchema,
    filterFields,
    getRowId,
    fetcher,
    renderCard,
    ...rest
  } = props;

  const defaultState: DataViewState<TFilters> = {
    view: "grid",
    page: 1, // Grid uses infinite scroll, page tracked internally
    limit: initialState.limit || 20,
    search: initialState.filters?.search as string || "",
    filters: initialState.filters || {},
    sortBy: initialState.sortBy,
    order: initialState.order,
    columnVisibility: {},
  };

  return (
    <DataViewProvider initialState={defaultState} resourceKey={resourceKey} syncUrl={true}>
      <DataView
        {...rest}
        fetcher={fetcher}
        renderCard={renderCard}
        filterSchema={filterSchema}
        filterFields={filterFields}
        getRowId={getRowId}
        resourceKey={resourceKey}
        initialState={initialState}
      />
    </DataViewProvider>
  );
}

