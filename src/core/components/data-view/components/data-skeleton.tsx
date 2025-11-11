import { cn } from "@/core/utils";
import React from "react";
import type { DataSkeletonProps } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";

/**
 * Skeleton loader for table rows
 */
function TableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableHead key={i}>
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: count }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: 5 }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <div className="bg-muted h-4 min-h-[1rem] w-full animate-pulse rounded" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Skeleton loader for grid items
 */
function GridSkeleton({
  count = 8,
  columns = 4,
}: {
  count?: number;
  columns?: number;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        columns >= 2 && "sm:grid-cols-2",
        columns >= 3 && "md:grid-cols-3",
        columns >= 4 && "lg:grid-cols-4",
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="min-h-[200px] rounded-md border p-4"
          role="status"
          aria-label="Loading"
        >
          <div className="space-y-3">
            <div className="bg-muted h-48 w-full animate-pulse rounded" />
            <div className="space-y-2">
              <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * DataSkeleton - Loading skeleton for table or grid views
 */
export function DataSkeleton({
  count = 5,
  type = "table",
  gridColumns = 4,
}: DataSkeletonProps) {
  if (type === "table") {
    return <TableSkeleton count={count} />;
  }

  return <GridSkeleton count={count} columns={gridColumns} />;
}
