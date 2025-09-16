import { TableAction } from "@/core/components/data-table/components/table-action";
import { Avatar } from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import { formatDate, formatCurrency, capitalize } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { CompanyLocationBrand } from "@/modules/panel/types/brand.type";
import type { ColumnDef } from "@tanstack/react-table";

export const columns = (
  companyId: string,
  locationId: string,
): ColumnDef<CompanyLocationBrand>[] => [
  {
    header: "Brand Name",
    accessorKey: "name",
    size: 180,
    cell: ({ row }) => (
      <div className="flex w-max items-center gap-3 font-medium">
        {
          <Avatar
            src={row?.original?.logoImage}
            feedback={capitalize(row.original.name?.charAt(0))}
          />
        }
        <span>{row.original?.name}</span>
      </div>
    ),
  },

  {
    header: "Total SKU",
    accessorKey: "totalSKU",
    size: 120,
    cell: ({ row }) => <div className="w-max">{row.original.totalSKU}</div>,
  },
  {
    header: "Marketing Budget",
    accessorKey: "marketingBudget",
    cell: ({ row }) => (
      <div className="w-max">
        {formatCurrency(row.original.marketingBudget)}
      </div>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    size: 120,
    cell: ({ row }) => (
      <StatusBadge status={row.original.status} module="brand" variant="badge">
        {row.original.status}
      </StatusBadge>
    ),
  },
  {
    header: "Created Date",
    accessorKey: "createdAt",
    size: 120,
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return <div className="w-max">{formatDate(createdAt)}</div>;
    },
  },
  {
    header: "Action",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    size: 80,
    cell: ({ row }) => {
      return (
        <TableAction
          view={{
            onClick: () => console.log("View brand:", row.original._id),
            to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_VIEW(
              companyId,
              locationId,
              row.original._id,
            ),
            title: "View brand details",
          }}
          edit={{
            loading: false,
            onClick: () => console.log("Edit brand:", row.original._id),
            to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(
              companyId,
              locationId,
              row.original._id,
            ),
            title: "Edit brand",
          }}
        />
      );
    },
  },
];
