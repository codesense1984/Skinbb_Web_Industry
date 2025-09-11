import { TableAction } from "@/core/components/data-table/components/table-action";
import { Badge } from "@/core/components/ui/badge";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { ColumnDef } from "@tanstack/react-table";

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  haveChild: boolean;
  totalProductCount: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export const columns = (): ColumnDef<ProductCategory>[] => [
  {
    accessorKey: "name",
    header: "Category Name",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex items-center space-x-2">
          <div className="font-medium">{category.name}</div>
          {category.haveChild && (
            <Badge variant="outline" className="text-xs">
              Has Children
            </Badge>
          )}
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
    accessorKey: "haveChild",
    header: "Has Children",
    cell: ({ row }) => {
      const haveChild = row.getValue("haveChild") as boolean;
      return (
        <Badge variant={haveChild ? "default" : "secondary"}>
          {haveChild ? "Yes" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "totalProductCount",
    header: "Products",
    cell: ({ row }) => {
      const count = row.getValue("totalProductCount") as number;
      return (
        <Badge variant="outline">
          {count} {count === 1 ? "product" : "products"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    cell: ({ row }) => {
      const createdBy = row.getValue(
        "createdBy",
      ) as ProductCategory["createdBy"];
      return (
        <div className="text-sm">
          <div className="font-medium">
            {createdBy.firstName} {createdBy.lastName}
          </div>
          <div className="text-gray-500">{createdBy.email}</div>
        </div>
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
    cell: ({ row, table }) => {
      const category = row.original;
      const meta = table.options.meta as any;
      
      return (
        <TableAction
          view={{
            onClick: () => {
              if (meta?.onView) {
                meta.onView(category._id);
              } else {
                // Fallback to navigation
                window.open(PANEL_ROUTES.MASTER.PRODUCT_CATEGORY_VIEW(category._id), '_blank');
              }
            },
            title: "View category",
          }}
          edit={{
            onClick: () => {
              if (meta?.onEdit) {
                meta.onEdit(category._id);
              } else {
                // Fallback to navigation
                window.open(PANEL_ROUTES.MASTER.PRODUCT_CATEGORY_EDIT(category._id), '_blank');
              }
            },
            title: "Edit category",
          }}
          delete={{
            onClick: () => {
              // TODO: Implement delete functionality
              console.log("Delete category:", category._id);
            },
            title: "Delete category",
          }}
        />
      );
    },
  },
];
