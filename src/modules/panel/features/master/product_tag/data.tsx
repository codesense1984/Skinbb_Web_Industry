import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/components/ui/badge";
import { TableAction } from "@/core/components/data-table/components/table-action";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiDeleteProductTag } from "@/modules/panel/services/http/product.service";
import { toast } from "sonner";

export interface ProductTag {
  _id: string;
  name: string;
  slug: string;
  totalCount?: number; // Only present in list API
  description?: string;
  seoKeywords?: string[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const columns = (): ColumnDef<ProductTag>[] => [
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => {
      const tag = row.original;
      return <div className="font-medium">{tag.name}</div>;
    },
  },
  {
    accessorKey: "slug",
    header: "SLUG",
    cell: ({ row }) => (
      <code className="rounded bg-gray-100 px-2 py-1 text-sm">
        {row.getValue("slug")}
      </code>
    ),
  },
  {
    accessorKey: "totalCount",
    header: "TOTAL",
    cell: ({ row }) => {
      const count = row.getValue("totalCount") as number;
      return <span className="font-medium">{count || 0}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "CREATED AT",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const tag = row.original;
      return (
        <TableAction
          edit={{
            onClick: () =>
              window.open(
                PANEL_ROUTES.MASTER.PRODUCT_TAG_EDIT(tag._id),
                "_blank",
              ),
          }}
          delete={{
            onClick: async () => {
              if (
                window.confirm(
                  `Are you sure you want to delete the tag "${tag.name}"?`,
                )
              ) {
                try {
                  await apiDeleteProductTag(tag._id);
                  toast.success("Tag deleted successfully");
                  // Refresh the table by triggering a refetch
                  window.location.reload();
                } catch (error: any) {
                  toast.error(
                    error?.response?.data?.message || "Failed to delete tag",
                  );
                }
              }
            },
          }}
        />
      );
    },
  },
];
