import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/components/ui/badge";
import { TableAction } from "@/core/components/data-table/components/table-action";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

export interface ProductTag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
}

export const columns = (): ColumnDef<ProductTag>[] => [
  {
    accessorKey: "name",
    header: "Tag Name",
    cell: ({ row }) => {
      const tag = row.original;
      return (
        <div className="flex items-center space-x-2">
          {tag.color && (
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
          )}
          <div className="font-medium">{tag.name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <code className="rounded bg-gray-100 px-2 py-1 text-sm">
        {row.getValue("slug")}
      </code>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-xs truncate" title={description}>
          {description || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "productsCount",
    header: "Products",
    cell: ({ row }) => {
      const count = row.getValue("productsCount") as number;
      return (
        <Badge variant="outline">
          {count || 0} {count === 1 ? "product" : "products"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
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
          view={{
            onClick: () =>
              window.open(
                PANEL_ROUTES.MASTER.PRODUCT_TAG_VIEW(tag._id),
                "_blank",
              ),
          }}
          edit={{
            onClick: () =>
              window.open(
                PANEL_ROUTES.MASTER.PRODUCT_TAG_EDIT(tag._id),
                "_blank",
              ),
          }}
          delete={{
            onClick: () => {
              // TODO: Implement delete functionality
              console.log("Delete tag:", tag._id);
            },
          }}
        />
      );
    },
  },
];
