import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/components/ui/badge";
import { StatusBadge } from "@/core/components/ui/badge";
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/core/components/ui/avatar";
import { formatCurrency } from "@/core/utils";

// Product type - this should match the actual product type from your API
interface Product {
  _id: string;
  productName: string;
  thumbnail?: {
    url: string;
  };
  brand?: {
    name: string;
  };
  productCategory?: Array<{ name: string }>;
  status: string;
  priceRange?: {
    min: number;
    max: number;
  };
  salePriceRange?: {
    min: number;
    max: number;
  };
  variants?: Array<any>;
  createdAt: string;
  updatedAt: string;
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "productName",
    header: "Product",
    size: 300,
    cell: ({ row, getValue }) => (
      <ul className="flex min-w-40 items-center gap-2">
        <AvatarRoot className="size-10 rounded-md border">
          <AvatarImage
            className="object-cover"
            src={row.original.thumbnail?.url}
            alt={`${row.original.productName} thumbnail`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {(getValue() as string)?.charAt(0)}
          </AvatarFallback>
        </AvatarRoot>
        <div className="font-medium">{getValue() as string}</div>
      </ul>
    ),
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ getValue }) => {
      const brand = (getValue() as { name: string }) || { name: "Unknown" };
      return <div className="">{brand.name}</div>;
    },
  },
  {
    accessorKey: "productCategory",
    header: "Category",
    size: 150,
    cell: ({ getValue }) => {
      const categories = (getValue() as Array<{ name: string }>) || [];
      return (
        <div className="flex w-max flex-wrap gap-1">
          {categories.slice(0, 2).map((category, index) => (
            <Badge variant="outline" className="font-normal" key={index}>
              {category.name}
            </Badge>
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
      return <StatusBadge module="product" status={status} variant="badge" />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priceRange",
    header: "Price Range",
    cell: ({ getValue }) => {
      const priceRange = getValue() as { min: number; max: number } | undefined;
      if (!priceRange) return "-";
      
      const minPrice = formatCurrency(priceRange.min);
      const maxPrice = formatCurrency(priceRange.max);
      
      return (
        <div className="text-sm">
          {minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`}
        </div>
      );
    },
  },
  {
    accessorKey: "variants",
    header: "Variants",
    cell: ({ getValue }) => {
      const variants = (getValue() as Array<any>) || [];
      return (
        <div className="text-sm text-muted-foreground">
          {variants.length} variant{variants.length !== 1 ? "s" : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return (
        <div className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString()}
        </div>
      );
    },
  },
];
