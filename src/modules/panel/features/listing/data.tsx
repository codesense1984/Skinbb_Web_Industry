import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import type { Product } from "@/modules/panel/types/product.type";
import { formatCurrency } from "@/core/utils";
import { EyeIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";

export const initialStatsData = [
  {
    title: "Total Products",
    value: 0, // Will be updated from API
    barColor: "bg-primary",
    icon: true,
  },
  {
    title: "Published Products",
    value: 0, // Will be updated from API
    barColor: "bg-blue-300",
    icon: false,
  },
  {
    title: "Draft Products",
    value: 0, // Will be updated from API
    barColor: "bg-violet-300",
    icon: false,
  },
  {
    title: "Total Variants",
    value: 0, // Will be updated from API
    barColor: "bg-red-300",
    icon: true,
  },
];

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "productName",
    header: "Product",
    cell: ({ row, getValue }) => (
      <ul className="flex min-w-40 items-center gap-2">
        <Avatar className="size-10 rounded-md border">
          <AvatarImage
            className="object-cover"
            src={row.original.thumbnail?.url}
            alt={`${row.original.productName} thumbnail`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {(getValue() as string)?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="max-w-xs truncate font-medium">
            {getValue() as string}
          </span>
          <span className="text-muted-foreground text-sm">
            {row.original.slug}
          </span>
        </div>
      </ul>
    ),
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ getValue }) => {
      const brand = (getValue() as { name: string }) || { name: "Unknown" };
      return <span className="text-sm font-medium">{brand.name}</span>;
    },
  },
  {
    accessorKey: "productCategory",
    header: "Category",
    cell: ({ getValue }) => {
      const categories = (getValue() as Array<{ name: string }>) || [];
      return (
        <div className="flex flex-wrap gap-1">
          {categories.slice(0, 2).map((category, index) => (
            <span key={index} className="rounded bg-gray-100 px-2 py-1 text-xs">
              {category.name}
            </span>
          ))}
          {categories.length > 2 && (
            <span className="text-muted-foreground text-xs">
              +{categories.length - 2} more
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return <StatusBadge module="brand" status={status} />;
    },
  },
  {
    accessorKey: "priceRange",
    header: "Price Range",
    cell: ({ row, getValue }) => {
      const priceRange = (getValue() as { min: number; max: number }) || {
        min: 0,
        max: 0,
      };
      const salePriceRange = row.original.salePriceRange || { min: 0, max: 0 };

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {formatCurrency(priceRange.min, { useAbbreviation: true })} -{" "}
            {formatCurrency(priceRange.max, { useAbbreviation: true })}
          </span>
          {salePriceRange &&
            (salePriceRange.min > 0 || salePriceRange.max > 0) && (
              <span className="text-xs text-green-600">
                Sale:{" "}
                {formatCurrency(salePriceRange.min, { useAbbreviation: true })}{" "}
                -{" "}
                {formatCurrency(salePriceRange.max, { useAbbreviation: true })}
              </span>
            )}
        </div>
      );
    },
  },
  {
    accessorKey: "variants",
    header: "Variants",
    cell: ({ getValue }) => {
      const variants = (getValue() as Array<unknown>) || [];
      return (
        <span className="font-medium">
          {variants.length} variant{variants.length !== 1 ? "s" : ""}
        </span>
      );
    },
  },
  {
    accessorKey: "capturedDate",
    header: "Added",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return <span className="text-sm">{date.toLocaleDateString()}</span>;
    },
  },
  {
    header: "Action",
    id: "actions",
    enableHiding: false,
    cell: () => {
      return (
        <Button variant="ghost" size="icon" className="">
          <span className="sr-only">View Product Details</span>
          <EyeIcon />
        </Button>
      );
    },
  },
];
