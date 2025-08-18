import { Button } from "@/core/components/ui/button";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { Input } from "@/core/components/ui/input";
import {
  SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableProps,
} from "@/core/components/ui/table";
import { cn } from "@/core/utils";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Header,
  type Row,
  type SortingState,
  type Table as TableType,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type Dispatch,
  type KeyboardEvent,
  type ReactNode,
  type SetStateAction,
} from "react";

export enum DataViewMode {
  "list" = "list",
  "grid" = "grid",
}

export const DEFAULT_PAGE_SIZES = [5, 10, 20, 50];
export const LOCAL_STORAGE_VIEW_MODE_KEY = "viewMode";

function createGlobalFilter<TData extends object>(
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

interface UseTableOptions<TData> {
  rows: TData[];
  columns: ColumnDef<TData, unknown>[];
  pageSize?: number;
  filterableKeys?: (keyof TData)[];
  defaultViewMode: DataViewMode;
}

export interface UseTableResponse<TData> {
  table: TableType<TData>;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setGlobalFilter: Dispatch<SetStateAction<string>>;
  toggleViewMode: () => void;
  viewMode: DataViewMode;
  setViewMode: Dispatch<SetStateAction<DataViewMode>>;
}

export function useTable<TData extends object>({
  rows,
  columns,
  pageSize = 5,
  filterableKeys = [],
  defaultViewMode = DataViewMode.list,
}: UseTableOptions<TData>): UseTableResponse<TData> {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [viewMode, setViewMode] = useState<DataViewMode>(
    defaultViewMode ?? DataViewMode.list,
  );

  const table = useReactTable({
    data: rows,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      pagination,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    globalFilterFn: createGlobalFilter<TData>(filterableKeys),
  });

  useEffect(() => {
    const savedViewMode = localStorage.getItem(
      LOCAL_STORAGE_VIEW_MODE_KEY,
    ) as DataViewMode | null;
    if (savedViewMode) setViewMode(savedViewMode);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  return {
    table,
    pagination,
    setGlobalFilter,
    toggleViewMode: () =>
      setViewMode((prev) =>
        prev === DataViewMode.list ? DataViewMode.grid : DataViewMode.list,
      ),
    viewMode: viewMode,
    setViewMode,
  };
}

function SortableHeader<TData>({ header }: { header: Header<TData, unknown> }) {
  const isSorted = header.column.getIsSorted() as string;
  const toggleHandler = header.column.getToggleSortingHandler();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      toggleHandler?.(e);
    }
  };

  return (
    /* NOSONAR */ // Suppresses this line from being flagged
    <div
      role="button"
      tabIndex={0}
      aria-pressed={!!isSorted}
      aria-label={`Sort by ${String(header.column.columnDef.header)}`}
      onKeyDown={handleKeyDown}
      className={cn(
        "group hover:bg-accent flex h-full w-full items-center gap-2 px-3 focus:outline-none",
        header.column.getCanSort() ? "cursor-pointer" : "text-left",
      )}
      onClick={(e) => {
        // Prevent toggling sort if clicking inside an actual button
        if ((e.target as HTMLElement).closest("button")) return;

        toggleHandler?.(e);
      }}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      {(header.column.getCanSort() && (
        <button
          type="button"
          className={cn(
            "hover:bg-background grid size-7 cursor-pointer place-content-center rounded-md opacity-0 group-hover:opacity-100",
            header.column.getIsSorted() && "opacity-100",
          )}
          onClick={header.column.getToggleSortingHandler()}
        >
          {
            {
              asc: <ArrowUpIcon className="text-muted-foreground size-4" />,
              desc: <ArrowDownIcon className="text-muted-foreground size-4" />,
              false: <ArrowUpIcon className="text-border size-4" />,
            }[header.column.getIsSorted() as string]
          }
        </button>
      )) ??
        null}
    </div>
  );
}

interface DataTableBodyProps<TData> extends TableProps {
  table: TableType<TData>;
  emptyMessage?: string | ReactNode;
}

export function DataTableBody<TData>({
  table,
  emptyMessage,
  ...props
}: DataTableBodyProps<TData> & TableProps) {
  return (
    <Table {...props}>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead key={header.id} className="p-0">
                {!header.isPlaceholder && <SortableHeader header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-accent">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={table.getAllColumns().length}
              className="h-30 text-center"
              data-cell="empty"
            >
              {emptyMessage ?? (
                <div className="flex h-[228px] items-center justify-center">
                  No result found.
                </div>
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

interface DataGridViewProps<TData> extends ComponentProps<"section"> {
  table: TableType<TData>;
  renderGridItem?: (row: TData) => ReactNode;
  emptyMessage?: string;
}

export function DataGridView<TData>({
  table,
  emptyMessage,
  renderGridItem,
  className,
  ...props
}: DataGridViewProps<TData>) {
  const rowModel = table.getRowModel();

  const memoizedItems = useMemo(
    () =>
      renderGridItem
        ? rowModel.rows.map((row) => renderGridItem(row.original))
        : [],
    [rowModel, renderGridItem],
  );

  if (!renderGridItem) return <>Please provide grid layout</>;

  return table.getRowModel().rows.length ? (
    <section
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3",
        className,
      )}
      {...props}
    >
      {memoizedItems}
    </section>
  ) : (
    <div className="bg-background w-full rounded-md p-5 text-center">
      {emptyMessage ?? "No results."}
    </div>
  );
}

interface DataPaginationProps<TData> extends ComponentProps<"div"> {
  table: TableType<TData>;
  showEntryCount?: boolean;
  showPageSizeOptions?: boolean;
}

export function DataPagination<TData>({
  table,
  showEntryCount = true,
  showPageSizeOptions = true,
  className,
  ...props
}: DataPaginationProps<TData>) {
  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  const total = table.getRowCount();
  const startEntry = pageIndex * pageSize + 1;
  const endEntry = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 py-1 md:gap-4",
        className,
      )}
      {...props}
    >
      {showEntryCount && (
        <div>
          Showing {startEntry} to {endEntry} of {total} entries
          {!!table.getFilteredSelectedRowModel().rows.length && (
            <>
              {" "}
              (row {table.getFilteredSelectedRowModel().rows.length} selected)
            </>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        {showPageSizeOptions && (
          <div className="flex items-center gap-2">
            <SelectRoot
              value={String(pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[80px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            Entries per page
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            startIcon={<ChevronLeftIcon className="!size-5" />}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            startIcon={<ChevronRightIcon className="!size-5" />}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          />
        </div>
      </div>
    </div>
  );
}

interface DataTableActionProps<TData> extends ComponentProps<"div"> {
  tableState: UseTableResponse<TData>;
  children?: ReactNode;
  showViewToggle?: boolean;
  showColumnsFilter?: boolean;
  tableHeading?: string;
}

export function DataTableAction<TData>({
  tableState,
  children,
  className,
  tableHeading = "",
  showViewToggle = true,
  showColumnsFilter = true,
  ...props
}: DataTableActionProps<TData>) {
  const { table, viewMode, toggleViewMode } = tableState;

  const columnFilter = () => {
    if (viewMode === DataViewMode.grid) return;
    return (
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <Button variant="outlined" className="ml-auto">
            Columns <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            ?.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenuRoot>
    );
  };
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      <h5 className="table-heading">{tableHeading}</h5>
      <div className="flex flex-wrap gap-2 md:gap-4">
        <Input
          startIcon={<MagnifyingGlassIcon />}
          placeholder="Search..."
          onChange={(event) => table?.setGlobalFilter(event.target.value)}
          className="max-w-52"
          aria-label="Search table content"
        />

        {children}
        {showColumnsFilter && columnFilter()}
        {/* {viewMode === DataViewMode.list && } */}
        {showViewToggle && (
          <Button variant={"outlined"} size={"icon"} onClick={toggleViewMode}>
            {viewMode !== DataViewMode.grid ? (
              <TableCellsIcon />
            ) : (
              <Squares2X2Icon />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
interface DataTableProps<TData extends object>
  extends Omit<UseTableOptions<TData>, "defaultViewMode"> {
  bodyProps?: Omit<DataTableBodyProps<TData>, "table">;
  paginationProps?: Omit<DataPaginationProps<TData>, "table">;
  actionProps?: Omit<DataTableActionProps<TData>, "tableState">; // Optional custom actions (e.g. filters, buttons)
  showPagination?: boolean;
  showAction?: boolean;
  tableHeading?: string;
  className?: string;
}

export function DataTable<TData extends object>({
  rows,
  columns,
  bodyProps = {},
  paginationProps = {},
  actionProps,
  showAction = true,
  showPagination = true,
  tableHeading,
  className,
  pageSize,
  ...props
}: DataTableProps<TData>) {
  const tableState = useTable({
    rows,
    columns,
    defaultViewMode: DataViewMode.list,
    pageSize: !showPagination ? -1 : pageSize,
    ...props,
  });
  const { table } = tableState;
  return (
    <div className={cn("space-y-5", className)}>
      {showAction && (
        <DataTableAction
          tableState={tableState}
          showViewToggle={false}
          {...actionProps}
          tableHeading={tableHeading}
        ></DataTableAction>
      )}

      <DataTableBody table={table} {...bodyProps} />
      {showPagination && <DataPagination table={table} {...paginationProps} />}
    </div>
  );
}
interface DataTableToggleProps<TData extends object>
  extends Omit<UseTableOptions<TData>, "defaultViewMode"> {
  bodyProps?: Omit<DataTableBodyProps<TData>, "table">;
  gridProps?: Omit<DataGridViewProps<TData>, "table">;
  paginationProps?: Omit<DataPaginationProps<TData>, "table">;
  actionProps?: Omit<DataTableActionProps<TData>, "tableState">; // Optional custom actions (e.g. filters, buttons)
  showPagination?: boolean;
  showAction?: boolean;
}

export function DataTableToogle<TData extends object>({
  rows,
  columns,
  bodyProps = {},
  gridProps = {},
  paginationProps = {},
  actionProps,
  showAction = true,
  showPagination = true,
  ...props
}: DataTableToggleProps<TData>) {
  const tableState = useTable({
    rows,
    columns,
    defaultViewMode: DataViewMode.grid,
    ...props,
  });
  const { table, viewMode } = tableState;
  return (
    <div className="space-y-5">
      {showAction && (
        <DataTableAction
          tableState={tableState}
          {...actionProps}
        ></DataTableAction>
      )}

      {viewMode === DataViewMode.list ? (
        <DataTableBody
          table={table}
          className="overflow-hidden rounded-md shadow-md"
          {...bodyProps}
        />
      ) : (
        <DataGridView table={table} {...gridProps} />
      )}
      {showPagination && <DataPagination table={table} {...paginationProps} />}
    </div>
  );
}
