import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { ZodSchema } from "zod";

/**
 * View mode for DataView component
 */
export type ViewMode = "table" | "grid";

/**
 * Sort order direction
 */
export type SortOrder = "asc" | "desc";

/**
 * Base interface for data view filters
 * Extend this interface to add custom filter fields
 */
export interface DataViewFilters {
  search?: string;
  status?: string;
  category?: string;
  [key: string]: unknown;
}

/**
 * Internal state managed by DataView context
 * @template TFilters - Filter type extending DataViewFilters
 */
export interface DataViewState<
  TFilters extends DataViewFilters = DataViewFilters,
> {
  view: ViewMode;
  page: number;
  limit: number;
  search: string;
  filters: Partial<TFilters>;
  sortBy?: string;
  order?: SortOrder;
  columnVisibility: Record<string, boolean>;
}

/**
 * Standard response shape from data fetcher
 * @template TItem - Type of individual items in the response
 */
export interface ResponseShape<TItem> {
  statusCode: number;
  data: {
    items: TItem[];
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

/**
 * Parameters passed to the fetcher function
 * @template TFilters - Filter type extending DataViewFilters
 */
export type FetcherParams<TFilters extends DataViewFilters = DataViewFilters> =
  Partial<TFilters> & {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: SortOrder;
  };

/**
 * Function type for fetching data
 * @template TItem - Type of items returned
 * @template TFilters - Filter type extending DataViewFilters
 */
export type Fetcher<
  TItem,
  TFilters extends DataViewFilters = DataViewFilters,
> = (
  params: FetcherParams<TFilters>,
  signal?: AbortSignal,
) => Promise<ResponseShape<TItem>>;

/**
 * Configuration for filter field rendering
 * @template TFilters - Filter type extending DataViewFilters
 */
export interface FilterFieldConfig<
  TFilters extends DataViewFilters = DataViewFilters,
> {
  key: keyof TFilters;
  type: "text" | "select" | "multiselect" | "date" | "daterange";
  label: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

/**
 * Actions context passed to the actions render prop
 * @template TFilters - Filter type extending DataViewFilters
 */
export interface DataViewActionsContext<
  TFilters extends DataViewFilters = DataViewFilters,
> {
  filters: TFilters;
  setFilter: (
    k: keyof TFilters | "sortBy" | "order",
    v: unknown,
    opts?: { resetPage?: boolean },
  ) => void;
  replaceFilters: (
    p: Partial<TFilters & { sortBy?: string; order?: SortOrder }>,
  ) => void;
  clearFilters: (keys?: (keyof TFilters)[]) => void;
  refetch: () => void;
}

/**
 * Props for the DataView component
 * @template TItem - Type of items to display
 * @template TFilters - Filter type extending DataViewFilters
 */
export interface DataViewProps<
  TItem,
  TFilters extends DataViewFilters = DataViewFilters,
> {
  title?: string;
  fetcher: Fetcher<TItem, TFilters>;
  columns?: ColumnDef<TItem, unknown>[];
  renderCard?: (item: TItem) => ReactNode;
  filterSchema: ZodSchema<TFilters>;
  filterFields: FilterFieldConfig<TFilters>[];
  initialState?: Partial<DataViewState<TFilters>>;
  getRowId: (item: TItem) => string;
  actions?: (ctx: DataViewActionsContext<TFilters>) => ReactNode;
  pageSizeOptions?: number[];
  resourceKey: string;
  virtualize?: boolean;
  externalFilters?: Record<string, unknown>;
}

/**
 * Props for DataTable component (table-only view)
 * @template TItem - Type of items to display
 * @template TFilters - Filter type extending DataViewFilters
 */
export interface DataTableProps<
  TItem,
  TFilters extends DataViewFilters = DataViewFilters,
> extends Omit<DataViewProps<TItem, TFilters>, "renderCard" | "view"> {
  columns: ColumnDef<TItem, unknown>[];
}

/**
 * Props for DataGridList component (grid-only view)
 * @template TItem - Type of items to display
 * @template TFilters - Filter type extending DataViewFilters
 */
export interface DataGridListProps<
  TItem,
  TFilters extends DataViewFilters = DataViewFilters,
> extends Omit<DataViewProps<TItem, TFilters>, "columns" | "view"> {
  renderCard: (item: TItem) => ReactNode;
}
