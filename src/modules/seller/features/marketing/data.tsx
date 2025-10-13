import { TableAction } from "@/core/components/data-table/components/table-action";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { SELLER_ROUTES } from "../../routes/constant";
import type { ColumnDef } from "@tanstack/react-table";
import type { Coupon } from "@/modules/panel/services/http/coupon.service";
import { formatDate } from "@/core/utils";

export const columns = (): ColumnDef<Coupon>[] => [
  {
    accessorKey: "code",
    header: "Code",
    size: 120,
    cell: ({ row }) => {
      const code = row.getValue("code") as string;
      return (
        <div className="rounded bg-gray-100 px-2 py-1 font-mono text-sm font-medium">
          {code}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="font-medium">{title}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    size: 120,
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const typeLabels = {
        bogo: "BOGO",
        product: "Product",
        cart: "Cart",
      };
      return (
        <Badge variant="outline">
          {typeLabels[type as keyof typeof typeLabels] || type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "discountType",
    header: "Discount Type",
    size: 120,
    cell: ({ row }) => {
      const discountType = row.getValue("discountType") as string;
      const discountValue = row.original.discountValue;
      const typeLabels = {
        percentage: `${discountValue}%`,
        fixed_amount: `₹${discountValue}`,
        free_product: "Free Product",
      };
      return (
        <Badge variant="secondary">
          {typeLabels[discountType as keyof typeof typeLabels] || discountType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "usageLimit",
    size: 120,
    header: "Usage",
    cell: ({ row }) => {
      const usageLimit = row.getValue("usageLimit") as number;
      const usedCount = row.original.usedCount;
      return (
        <div className="text-sm">
          <div className="font-medium">
            {usedCount} / {usageLimit}
          </div>
          <div className="text-gray-500">
            {usageLimit - usedCount} remaining
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "validFrom",
    header: "Valid Period",
    size: 120,
    cell: ({ row }) => {
      const validFrom = new Date(row.getValue("validFrom"));
      const expiresAt = new Date(row.original.expiresAt);
      return (
        <div className="text-sm">
          <div className="font-medium">{formatDate(validFrom)}</div>
          <div className="text-gray-500">to {formatDate(expiresAt)}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isActive = row.original.isActive;

      // Determine the actual status based on isActive and status
      let actualStatus = status;
      if (status === "active" && !isActive) {
        actualStatus = "inactive";
      }

      return (
        <StatusBadge
          module="discount_coupon"
          status={actualStatus}
          variant="badge"
        />
      );
    },
  },
  {
    accessorKey: "createdAt",
    size: 120,
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-sm">{formatDate(date)}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const coupon = row.original;
      const meta = table.options.meta as any;

      return (
        <TableAction
          view={{
            onClick: () => {
              if (meta?.onView) {
                meta.onView(coupon._id);
              } else {
                // Fallback to navigation
                window.open(
                  SELLER_ROUTES.MARKETING.DISCOUNT_COUPONS.VIEW(coupon._id),
                  "_blank",
                );
              }
            },
            title: "View coupon",
          }}
          edit={{
            onClick: () => {
              if (meta?.onEdit) {
                meta.onEdit(coupon._id);
              } else {
                // Fallback to navigation
                window.open(
                  SELLER_ROUTES.MARKETING.DISCOUNT_COUPONS.EDIT(coupon._id),
                  "_blank",
                );
              }
            },
            title: "Edit coupon",
          }}
          delete={{
            onClick: () => {
              if (meta?.onDelete) {
                meta.onDelete(coupon._id);
              } else {
                // TODO: Implement delete functionality
              }
            },
            title: "Delete coupon",
          }}
        />
      );
    },
  },
];
