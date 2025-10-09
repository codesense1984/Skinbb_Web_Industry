import { TableAction } from "@/core/components/data-table/components/table-action";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductAttributeResponse } from "@/modules/panel/services/http/product-attribute.service";

export const columns = (): ColumnDef<ProductAttributeResponse>[] => [
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => {
      const attribute = row.original;
      return (
        <div className="font-medium">{attribute.name}</div>
      );
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
    accessorKey: "createdAt",
    header: "CREATED AT",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm">
          {date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "configure",
    header: "Configure",
    cell: ({ row, table }) => {
      const attribute = row.original;
      const meta = table.options.meta as any;

      return (
        <button
          onClick={() => {
            if (meta?.onConfigure) {
              meta.onConfigure(attribute._id, attribute.name);
            }
          }}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Configure
        </button>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const attribute = row.original;
      const meta = table.options.meta as any;

      return (
        <TableAction
          view={{
            onClick: () => {
              if (meta?.onView) {
                meta.onView(attribute._id);
              } else {
                // Fallback to navigation
                window.open(
                  PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_VIEW(attribute._id),
                  "_blank",
                );
              }
            },
            title: "View attribute",
          }}
          edit={{
            onClick: () => {
              if (meta?.onEdit) {
                meta.onEdit(attribute._id);
              } else {
                // Fallback to navigation
                window.open(
                  PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_EDIT(attribute._id),
                  "_blank",
                );
              }
            },
            title: "Edit attribute",
          }}
          delete={{
            onClick: () => {
              if (meta?.onDelete) {
                meta.onDelete(attribute._id);
              } else {
                // TODO: Implement delete functionality
                console.log("Delete attribute:", attribute._id);
              }
            },
            title: "Delete attribute",
          }}
        />
      );
    },
  },
];
