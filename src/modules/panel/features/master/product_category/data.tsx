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
    header: "Name",
    cell: ({ row }) => {
      const category = row.original;
      return <div className="font-medium">{category.name}</div>;
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
    accessorKey: "totalProductCount",
    header: "Product Count",
    cell: ({ row }) => {
      const count = row.getValue("totalProductCount") as number;
      return (
        <button className="text-sm font-medium text-blue-600 underline hover:text-blue-800">
          {count}
        </button>
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
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <div className="flex items-center">
          <div
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${isActive ? "bg-blue-600" : "bg-gray-200"}`}
          >
            <div
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isActive ? "translate-x-6" : "translate-x-1"}`}
            />
          </div>
        </div>
      );
    },
  },
  {
    id: "showChild",
    header: "Sub Category",
    cell: ({ row, table }) => {
      const category = row.original;
      const meta = table.options.meta as any;

      if (!category.haveChild) {
        return <span className="text-gray-400">-</span>;
      }

      return (
        <button
          onClick={() => {
            if (meta?.onShowChild) {
              meta.onShowChild(category._id, category.name);
            }
          }}
          className="text-sm font-medium text-blue-600 underline hover:text-blue-800"
        >
          Show Child
        </button>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const category = row.original;
      const meta = table.options.meta as any;

      return (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (meta?.onEdit) {
                meta.onEdit(category._id);
              } else {
                // Fallback to navigation
                window.open(
                  PANEL_ROUTES.MASTER.PRODUCT_CATEGORY_EDIT(category._id),
                  "_blank",
                );
              }
            }}
            className="p-1 text-gray-600 hover:text-blue-600"
            title="Edit category"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              if (meta?.onDelete) {
                meta.onDelete(category._id);
              } else {
                // TODO: Implement delete functionality
                console.log("Delete category:", category._id);
              }
            }}
            className="p-1 text-gray-600 hover:text-red-600"
            title="Delete category"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      );
    },
  },
];
