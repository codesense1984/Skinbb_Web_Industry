import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/components/ui/badge";
// import { StatusBadge } from "@/core/components/ui/badge";
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/core/components/ui/avatar";
import { Button } from "@/core/components/ui/button";
import { DropdownMenu } from "@/core/components/ui/dropdown-menu";
import { formatCurrency } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { EyeIcon, PencilIcon, EllipsisVerticalIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

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
      const isApproved = status === "approved" || status === "publish";
      const isRejected = status === "rejected";
      // const _isPending = !isApproved && !isRejected;
      
      // Get approval reason from statusFeedback or statusReason field
      const approvalReason = (product as unknown as Record<string, unknown>).statusFeedback || 
                            (product as unknown as Record<string, unknown>).statusReason || 
                            (product as unknown as Record<string, unknown>).status_feedback;
      
      // Debug: Log the product data to see what fields are available
      if (isRejected) {
        console.log("Rejected product data:", product);
        console.log("statusFeedback field:", (product as unknown as Record<string, unknown>).statusFeedback);
        console.log("statusReason field:", (product as unknown as Record<string, unknown>).statusReason);
        console.log("status_feedback field:", (product as unknown as Record<string, unknown>).status_feedback);
        console.log("Approval reason found:", approvalReason);
      }
      
      if (isApproved) {
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="w-fit text-green-600 border-green-600">
              <CheckCircleIcon className="mr-1 h-3 w-3" />
              APPROVED
            </Badge>
          </div>
        );
      } else if (isRejected) {
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="w-fit text-red-600 border-red-600">
              <CheckCircleIcon className="mr-1 h-3 w-3" />
              REJECTED
            </Badge>
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
          </div>
        );
      } else {
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="w-fit text-orange-600 border-orange-600">
              <CheckCircleIcon className="mr-1 h-3 w-3" />
              PENDING
            </Badge>
          </div>
        );
      }
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
      const variants = (getValue() as Array<Record<string, unknown>>) || [];
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
