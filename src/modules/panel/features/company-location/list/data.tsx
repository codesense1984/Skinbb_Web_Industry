import {
  // renderActionButton,
} from "@/core/components/data-table/components/table-action";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { CompanyLocation } from "@/modules/panel/types/company-location.type";
import { BuildingOfficeIcon } from "@heroicons/react/24/solid";
import type { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu } from "@/core/components/ui/dropdown-menu";
import { EyeIcon, PencilIcon, EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { WithAccess } from "@/modules/auth/components/guard";
import { PAGE } from "@/modules/auth/types/permission.type.";

export const createColumns = (
  companyId: string,
): ColumnDef<CompanyLocation>[] => [
  {
    header: "Address Type",
    accessorKey: "addressType",
    size: 120,
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.addressType}
      </Badge>
    ),
  },
  {
    header: "Address",
    accessorKey: "addressLine1",
    size: 200,
    // cell: ({ row }) => (
    //   <div className="min-w-50">{row.original.addressLine1}</div>
    // ),
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
    size: 100,
    // cell: ({ row }) => <div className="w-max">{row.original.state}</div>,
  },
  {
    header: "City",
    accessorKey: "city",
    size: 100,
    // cell: ({ row }) => <div className="w-max">{row.original.city}</div>,
  },
  {
    header: "Pincode",
    accessorKey: "postalCode",
    size: 100,
    // cell: ({ row }) => (
    //   <div className="w-max font-mono text-sm">{row.original.postalCode}</div>
    // ),
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
    size: 120,
    cell: ({ row }) => (
      <div>
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
    size: 120,
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
    size: 120,
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return formatDate(createdAt);
    },
  },
  {
    header: "Action",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    size: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <DropdownMenu
            items={[
              {
                type: "link",
                to: PANEL_ROUTES.COMPANY_LOCATION.VIEW(companyId, row.original._id),
                title: "View location details",
                children: (
                  <WithAccess page={PAGE.COMPANY_LOCATIONS} actions="view">
                    <EyeIcon className="size-4" /> View
                  </WithAccess>
                ),
              },
              {
                type: "link",
                to: PANEL_ROUTES.ONBOARD.COMPANY_EDIT(companyId, row.original._id),
                title: "Edit location",
                children: (
                  <WithAccess page={PAGE.COMPANY_LOCATIONS} actions="update">
                    <PencilIcon className="size-4" /> Edit
                  </WithAccess>
                ),
              },
              {
                type: "link",
                to: PANEL_ROUTES.COMPANY_LOCATION.BRANDS(
                  companyId,
                  row.original._id,
                ),
                title: "View Brands",
                children: (
                  <WithAccess page={PAGE.COMPANY_LOCATIONS} actions="view">
                    <BuildingOfficeIcon className="size-4" /> Brands
                  </WithAccess>
                ),
              },
            ]}
          >
            <Button variant="outlined" size="icon">
              <EllipsisVerticalIcon className="size-4" />
            </Button>
          </DropdownMenu>
        </div>
      );
    },
  },
];