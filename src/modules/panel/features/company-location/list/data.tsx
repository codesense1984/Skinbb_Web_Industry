import { TableAction } from "@/core/components/data-table/components/table-action";
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
      <Badge variant="outline" className="capitalize">
        {row.original.addressType}
      </Badge>
    ),
  },
  {
    header: "Address",
    accessorKey: "addressLine1",
    cell: ({ row }) => (
      <div className="min-w-50">{row.original.addressLine1}</div>
    ),
  },

  // {
  //   header: "Landmark",
  //   accessorKey: "landmark",
  //   cell: ({ row }) => <div className="min-w-40">{row.original.landmark}</div>,
  // },
  // {
  //   header: "Country",
  //   accessorKey: "country",
  //   // cell: ({ row }) => <div className="w-max">{row.original.country}</div>,
  // },
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
  // {
  //   header: "Phone",
  //   accessorKey: "phoneNumber",
  //   cell: ({ row }) => (
  //     <div className="w-max">
  //       {row.original.phoneNumber ? (
  //         <span className="font-mono text-sm">{row.original.phoneNumber}</span>
  //       ) : (
  //         <span className="text-sm text-gray-400">-</span>
  //       )}
  //     </div>
  //   ),
  // },

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
            to: PANEL_ROUTES.ONBOARD.COMPANY_EDIT(companyId, row.original._id),
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
