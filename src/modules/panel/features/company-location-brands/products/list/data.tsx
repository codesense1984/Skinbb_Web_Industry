import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/core/components/ui/avatar";
import { Button } from "@/core/components/ui/button";
import { DropdownMenu } from "@/core/components/ui/dropdown-menu";
import { formatCurrency } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  EyeIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

// Product type - this should match the actual product type from your API
interface Product {
  _id: string;
  productName: string;
  thumbnail?: {
    url: string;
  };
  brand?: {
    name: string;
    _id: string;
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
  variants?: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
}

export const columns = (
  companyId: string,
  locationId: string,
  _brandId: string,
): ColumnDef<Product>[] => [
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
    size: 200,
    cell: ({ row }) => {
      const product = row.original;
      const status = product.status;
      
      // Get approval reason from statusFeedback or statusReason field for rejected products
      const approvalReason = (product as unknown as Record<string, unknown>).statusFeedback || 
                            (product as unknown as Record<string, unknown>).statusReason || 
                            (product as unknown as Record<string, unknown>).status_feedback;
      
      return (
        <div className="flex flex-col gap-1">
          <StatusBadge 
            module="product" 
            status={status} 
            variant="badge" 
            showDot={true}
          />
          {status === "rejected" && (
            <div className="text-xs text-red-600 max-w-40 truncate font-medium">
              {approvalReason ? (
                <span title={String(approvalReason)}>
                  Reason: {String(approvalReason)}
                </span>
              ) : (
                <span title="No rejection reason provided">
                  Reason: No reason provided
                </span>
              )}
            </div>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priceRange",
    header: "Price Range",
    cell: ({ row, getValue }) => {
      const priceRange = getValue() as { min: number; max: number } | undefined;
      const product = row.original;
      
      // Check if priceRange exists and has valid values (> 0)
      if (priceRange && priceRange.min > 0 && priceRange.max > 0) {
        const minPrice = formatCurrency(priceRange.min);
        const maxPrice = formatCurrency(priceRange.max);
        return (
          <div className="text-sm">
            {minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`}
          </div>
        );
      }
      
      // If priceRange is 0-0 or missing, check variants
      const variants = product.variants || [];
      if (variants.length > 0) {
        const variantPrices = variants
          .map((v: any) => {
            // Try different possible price field names
            return v.price || v.salePrice || 0;
          })
          .filter((price: number) => price > 0);
        
        if (variantPrices.length > 0) {
          const minVariantPrice = Math.min(...variantPrices);
          const maxVariantPrice = Math.max(...variantPrices);
          const minPrice = formatCurrency(minVariantPrice);
          const maxPrice = formatCurrency(maxVariantPrice);
          return (
            <div className="text-sm">
              {minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`}
            </div>
          );
        }
      }
      
      // If no variants or no variant prices, check for single price field
      const productPrice = (product as any).price;
      if (productPrice && productPrice > 0) {
        return (
          <div className="text-sm">
            {formatCurrency(productPrice)}
          </div>
        );
      }
      
      // If all else fails, show dash
      return "-";
    },
  },
  {
    accessorKey: "variants",
    header: "Variants",
    cell: ({ getValue }) => {
      const variants = (getValue() as Array<Record<string, unknown>>) || [];
      return (
        <div className="text-muted-foreground text-sm">
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
        <div className="text-muted-foreground text-sm">
          {new Date(date).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    header: "Action",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    size: 100,
    cell: ({ row }) => {
      const items = [
        {
          type: "link" as const,
          to: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_VIEW(
            companyId,
            locationId,
            row.original.brand?._id,
            row.original._id,
          ),
          title: "View product details",
          children: (
            <>
              <EyeIcon className="size-4" /> View
            </>
          ),
        },
        {
          type: "link" as const,
          to: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_EDIT(
            companyId,
            locationId,
            row.original.brand?._id,
            row.original._id,
          ),
          title: "Edit product",
          children: (
            <>
              <PencilIcon className="size-4" /> Edit
            </>
          ),
        },
        {
          type: "link" as const,
          to: "#",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            // This will be handled by the parent component
            const event = new CustomEvent("product-approval-request", {
              detail: { product: row.original }
            });
            window.dispatchEvent(event);
          },
          title: "Manage approval status",
          children: (
            <>
              <CheckCircleIcon className="size-4" /> Manage Approval
            </>
          ),
        },
      ];

      return (
        <DropdownMenu items={items}>
          <Button variant="outlined" size="icon">
            <EllipsisVerticalIcon className="size-4" />
          </Button>
        </DropdownMenu>
      );
    },
  },
];
