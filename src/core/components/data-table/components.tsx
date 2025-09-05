import { Button } from "@/core/components/ui/button";
// import {
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuRoot,
//   DropdownMenuTrigger,
// } from "@/core/components/ui/dropdown-menu";
import { Input } from "@/core/components/ui/input";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
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
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import { flexRender, type Header } from "@tanstack/react-table";
import { useMemo, type KeyboardEvent } from "react";
import { DEFAULT_PAGE_SIZES } from "./constants";
import {
  DataViewMode,
  type DataGridViewProps,
  type DataPaginationProps,
  type DataTableActionProps,
  type DataTableBodyProps,
  type DataTableProps,
  type DataTableToggleProps,
} from "./types";
import { useTable } from "./hooks";
import { TableFilter } from "./components/table-filter";

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
        "group flex h-full w-full items-center gap-2 px-3 py-2 focus:outline-none",
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

export function DataTableBody<TData>({
  table,
  emptyMessage,
  isLoading = false,
  loadingMessage,
  loadingRows = 5,
  ...props
}: DataTableBodyProps<TData> & TableProps) {
  return (
    <Table {...props}>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header, index) => (
              <TableHead
                key={header.id}
                className={cn(
                  "p-0 first:pl-0 last:pr-0",
                  index === 0 && "first:pl-2",
                  index === group.headers.length - 1 && "last:pr-2",
                )}
              >
                {!header.isPlaceholder && <SortableHeader header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          // Loading skeleton rows
          Array.from({ length: loadingRows }).map((_, index) => (
            <TableRow key={`loading-${index}`} className="animate-pulse">
              {table.getAllColumns().map((column) => (
                <TableCell key={`loading-cell-${index}-${column.id}`}>
                  <div className="bg-muted h-6 w-full rounded"></div>
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted">
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
              className="min-h-30 text-center"
              data-cell="empty"
            >
              {emptyMessage ?? (
                <div className="flex h-[228px] items-center justify-center">
                  {loadingMessage ?? "No result found."}
                </div>
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export function DataGridView<TData>({
  table,
  emptyMessage,
  renderGridItem,
  className,
  isLoading = false,
  loadingMessage,
  loadingItems = 6,
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

  if (isLoading) {
    return (
      <section
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3",
          className,
        )}
        {...props}
      >
        {Array.from({ length: loadingItems }).map((_, index) => (
          <div key={`loading-grid-${index}`} className="animate-pulse">
            <div className="bg-muted space-y-3 rounded-lg p-4">
              <div className="bg-muted-foreground/20 h-4 w-3/4 rounded"></div>
              <div className="bg-muted-foreground/20 h-3 w-1/2 rounded"></div>
              <div className="bg-muted-foreground/20 h-3 w-2/3 rounded"></div>
            </div>
          </div>
        ))}
      </section>
    );
  }

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
      {loadingMessage ?? emptyMessage ?? "No results."}
    </div>
  );
}

export function DataPagination<TData>({
  table,
  showEntryCount = true,
  showPageSizeOptions = true,
  serverTotal,
  className,
  ...props
}: DataPaginationProps<TData>) {
  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  // If serverTotal is provided, prefer it; otherwise keep existing behavior
  const total =
    typeof serverTotal === "number" ? serverTotal : table.getRowCount();

  // Avoid "1 to 0 of 0" when total is zero
  const startEntry = total > 0 ? pageIndex * pageSize + 1 : 0;
  // If there are fewer entries on the current page than pageSize, show the actual count
  // const currentPageRowCount = table.getRowModel().rows.length;
  // Ensure endEntry never less than startEntry, even if on a page past the last entry
  let endEntry = Math.min((pageIndex + 1) * pageSize, total);
  if (endEntry < startEntry) {
    endEntry = startEntry;
  }

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

    console.log("columnOptions", table?.getAllColumns());
    const columnOptions =
      table
        ?.getAllColumns()
        .filter((column) => column.getCanHide())
        .map((column) => ({
          label: column.columnDef.header?.toString() ?? "",
          value: column.id,
          checked: column.getIsVisible(),
          onToggle: (value: string, checked: boolean) => {
            const col = table.getColumn(value);
            if (col) {
              col.toggleVisibility(checked);
            }
          },
        })) || [];

    return (
      <TableFilter
        options={columnOptions}
        label="View"
        icon={ViewColumnsIcon}
      />
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
    pageSize: !showPagination ? -1 : pageSize,
    ...props,
    defaultViewMode: DataViewMode.list,
  });
  const { table } = tableState;
  return (
    <div className={cn("space-y-5", className)}>
      {showAction && (
        <DataTableAction
          tableState={tableState}
          showViewToggle={false}
          {...(actionProps ? actionProps(tableState) : {})}
          tableHeading={tableHeading}
        ></DataTableAction>
      )}

      <DataTableBody
        table={table}
        isLoading={tableState?.isLoading}
        {...bodyProps}
      />
      {showPagination && <DataPagination table={table} {...paginationProps} />}
    </div>
  );
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
          {...(actionProps ? actionProps(tableState) : {})}
        ></DataTableAction>
      )}

      {viewMode === DataViewMode.list ? (
        <DataTableBody
          table={table}
          className="overflow-hidden rounded-md shadow-md"
          {...bodyProps}
        />
      ) : (
        <DataGridView
          table={table}
          isLoading={bodyProps?.isLoading}
          loadingMessage={bodyProps?.loadingMessage}
          loadingItems={bodyProps?.loadingRows}
          {...gridProps}
        />
      )}
      {showPagination && <DataPagination table={table} {...paginationProps} />}
    </div>
  );
}
