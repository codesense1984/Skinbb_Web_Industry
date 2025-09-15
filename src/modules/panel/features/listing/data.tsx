import {
  AvatarRoot,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { TableAction } from "@/core/components/data-table/components/table-action";
import type { Product } from "@/modules/panel/types/product.type";
import { formatCurrency, formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
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
  // {
  //   accessorKey: "productCategory",
  //   header: "Category",
  //   size: 150,
  //   cell: ({ getValue }) => {
  //     const categories = (getValue() as Array<{ name: string }>) || [];
  //     return (
  //       <div className="flex w-max flex-wrap gap-1">
  //         {categories.slice(0, 2).map((category, index) => (
  //           <Badge variant="outline" className="font-normal" key={index}>
  //             {category.name}
  //           </Badge>
  //         ))}
  //         {categories.length > 2 && (
  //           <span className="text-muted-foreground text-xs">
  //             +{categories.length - 2} more
  //           </span>
  //         )}
  //       </div>
  //     );
  //   },
  // },
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
    cell: ({ row, getValue }) => {
      const priceRange = (getValue() as { min: number; max: number }) || {
        min: 0,
        max: 0,
      };
      const salePriceRange = row.original.salePriceRange || { min: 0, max: 0 };

      return (
        <div className="flex w-max flex-col">
          <span className="font-medium">
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
  // {
  //   accessorKey: "variants",
  //   header: "Variants",
  //   cell: ({ getValue }) => {
  //     const variants = (getValue() as Array<unknown>) || [];
  //     return (
  //       <div className="w-max font-medium">
  //         {variants.length} variant{variants.length !== 1 ? "s" : ""}
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "capturedDate",
    header: "Created At",
    cell: ({ getValue }) => {
      const capturedDate = getValue() as string;
      return <div>{formatDate(capturedDate)}</div>;
    },
  },
  {
    header: "Action",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    size: 100,
    cell: ({ row }) => {
      return (
        <TableAction
          view={{
            to:
              PANEL_ROUTES.LISTING.CREATE + `?mode=view&id=${row.original._id}`,
            title: "View product details",
          }}
          edit={{
            to:
              PANEL_ROUTES.LISTING.CREATE + `?mode=edit&id=${row.original._id}`,
            title: "Edit product",
          }}
        />
      );
    },
  },
];
