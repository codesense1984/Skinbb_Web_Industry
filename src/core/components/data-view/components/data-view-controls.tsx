import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import type { DataViewControlsProps } from "../types";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

/**
 * DataViewControls - Search bar, filters, and view toggle
 */
export function DataViewControls<TData>({
  table,
  showColumnVisibility,
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search by...",
  filters,
  children,
  searchAriaLabel = "Search data",
}: DataViewControlsProps<TData>) {
  const handleViewModeToggle = () => {
    onViewModeChange(viewMode === "table" ? "grid" : "table");
  };

  return (
    <div className="flex flex-wrap gap-2 md:gap-4">
      {filters && filters}

      <Input
        startIcon={<MagnifyingGlassIcon />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        containerProps={{
          className: "ml-auto max-w-52",
        }}
        aria-label={searchAriaLabel}
      />
      {children}
      <Button
        variant="outlined"
        size={"icon"}
        onClick={handleViewModeToggle}
        aria-label={`Switch to ${viewMode === "table" ? "grid" : "table"} view`}
        aria-pressed={viewMode === "grid"}
      >
        {viewMode === "table" ? (
          <Squares2X2Icon className="h-4 w-4" />
        ) : (
          <TableCellsIcon className="h-4 w-4" />
        )}
      </Button>

      {showColumnVisibility && table && (
        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outlined"
              startIcon={<ViewColumnsIcon className="text-muted-foreground" />}
              aria-label="Toggle columns"
            >
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              ?.getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(checked) =>
                    column.toggleVisibility(checked)
                  }
                >
                  {String(column.columnDef.header ?? column.id)}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenuRoot>
      )}
    </div>
  );
}
