import { TableAction, renderActionButton } from "@/core/components/data-table/components/table-action";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { CompanyLocation } from "@/modules/panel/types/company-location.type";
import type { ColumnDef } from "@tanstack/react-table";

export const createColumns = (
  companyId: string,
): ColumnDef<CompanyLocation>[] => [
  {
    header: "Address Type",
    accessorKey: "addressType",
    cell: ({ row }) => (
      <div className="min-w-32">
        <Badge variant="outline" className="capitalize">
          {row.original.addressType}
        </Badge>
      </div>
    ),
  },
  {
    header: "Address",
    accessorKey: "addressLine1",
    cell: ({ row }) => (
      <div className="min-w-50">{row.original.addressLine1}</div>
    ),
  },

  {
    header: "Landmark",
    accessorKey: "landmark",
    cell: ({ row }) => <div className="min-w-40">{row.original.landmark}</div>,
  },
  {
    header: "Country",
    accessorKey: "country",
    // cell: ({ row }) => <div className="w-max">{row.original.country}</div>,
  },
  {
    header: "State",
    accessorKey: "state",
    // cell: ({ row }) => <div className="w-max">{row.original.state}</div>,
  },
  {
    header: "City",
    accessorKey: "city",
    cell: ({ row }) => <div className="w-max">{row.original.city}</div>,
  },
  {
    header: "Pincode",
    accessorKey: "postalCode",
    cell: ({ row }) => (
      <div className="w-max font-mono text-sm">{row.original.postalCode}</div>
    ),
  },
  {
    header: "Phone",
    accessorKey: "phoneNumber",
    cell: ({ row }) => (
      <div className="w-max">
        {row.original.phoneNumber ? (
          <span className="font-mono text-sm">{row.original.phoneNumber}</span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </div>
    ),
  },

  {
    header: "Primary",
    accessorKey: "isPrimary",
    cell: ({ row }) => (
      <div className="w-max">
        {row.original.isPrimary ? (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Primary
          </Badge>
        ) : (
          <Badge variant="outline">Secondary</Badge>
        )}
      </div>
    ),
  },
  {
    header: "Brands",
    accessorKey: "brands",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      // Calculate total brands for this location
      const totalBrands = row.original.brands?.length || 0;

      return (
        <TableAction>
          {renderActionButton(
            {
              className: "w-auto px-2 text-muted-foreground",
              size: "md",
              variant: "outlined",
              to: PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId, row.original._id),
              children: `Brands (${totalBrands})`,
              title: `View all ${totalBrands} brands for ${row.original.city} location`,
            },
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6h.008v.008H6V6z"
              />
            </svg>
          )}
        </TableAction>
      );
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.status}
        module="company"
        variant="badge"
      >
        {row.original.status}
      </StatusBadge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    header: "Created Date",
    accessorKey: "createdAt",
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
    cell: ({ row }) => {
      return (
        <TableAction
          view={{
            to: PANEL_ROUTES.COMPANY_LOCATION.VIEW(companyId, row.original._id),
            title: "View location details",
          }}
          edit={{
            to: PANEL_ROUTES.COMPANY_LOCATION.EDIT(companyId, row.original._id),
            title: "Edit location",
          }}
          // delete={{
          //   onClick: () => console.log("Delete location:", row.original._id),
          //   tooltip: "Delete location",
          // }}
        />
      );
    },
  },
];
