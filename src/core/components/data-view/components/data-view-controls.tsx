import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/utils";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import type { DataViewControlsProps, ViewMode } from "../types";

/**
 * DataViewControls - Search bar, filters, and view toggle
 */
export function DataViewControls({
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search by...",
  filters,
  children,
  searchAriaLabel = "Search data",
}: DataViewControlsProps) {
  const handleViewModeToggle = () => {
    onViewModeChange(viewMode === "table" ? "grid" : "table");
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search and Filters */}
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        {filters && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filters">
            {filters}
          </div>
        )}
      </div>

      {/* View Toggle and Additional Controls */}
      <div className="flex items-center gap-2">
        {children}
        <Button
          variant="outlined"
          size="sm"
          onClick={handleViewModeToggle}
          aria-label={`Switch to ${viewMode === "table" ? "grid" : "table"} view`}
          aria-pressed={viewMode === "grid"}
        >
          {viewMode === "table" ? (
            <>
              <Squares2X2Icon className="mr-2 h-4 w-4" />
              Grid
            </>
          ) : (
            <>
              <TableCellsIcon className="mr-2 h-4 w-4" />
              Table
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

