import { TableAction } from "@/core/components/data-table/components/table-action";
import { Badge } from "@/core/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductAttributeValueResponse } from "@/modules/panel/services/http/product-attribute-value.service";

export const columns = (): ColumnDef<ProductAttributeValueResponse>[] => [
  {
    accessorKey: "label",
    header: "Name",
    cell: ({ row }) => {
      const value = row.original;
      return (
        <div className="flex items-center space-x-2">
          <div className="font-medium">{value.label}</div>
          {value.colorCode && (
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: value.colorCode }}
              title={`Color: ${value.colorCode}`}
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "value",
    header: "Slug",
    cell: ({ row }) => (
      <code className="rounded bg-gray-100 px-2 py-1 text-sm">
        {row.getValue("value")}
      </code>
    ),
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
    header: "Created At",
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
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const attributeValue = row.original;
      const meta = table.options.meta as any;

      return (
        <TableAction
          edit={{
            onClick: () => {
              if (meta?.onEdit) {
                meta.onEdit(attributeValue._id);
              } else {
                // TODO: Implement edit functionality
                console.log("Edit attribute value:", attributeValue._id);
              }
            },
            title: "Edit attribute value",
          }}
          delete={{
            onClick: () => {
              if (meta?.onDelete) {
                meta.onDelete(attributeValue._id);
              } else {
                // TODO: Implement delete functionality
                console.log("Delete attribute value:", attributeValue._id);
              }
            },
            title: "Delete attribute value",
          }}
        />
      );
    },
  },
];
