import { TableAction } from "@/core/components/data-table/components/table-action";
import { Avatar } from "@/core/components/ui/avatar";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { ColumnDef } from "@tanstack/react-table";

// Extended brand type that includes location information
export interface CompanyBrandWithLocation {
  _id: string;
  name: string;
  slug: string;
  aboutTheBrand: string;
  websiteUrl: string;
  isActive: boolean;
  logoImage: string | null;
  coverImage: string | null;
  authorizationLetter: string | null;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  brandStatus: string;
  statusChangeReason?: string | null;
  statusChangedAt?: string | null;
  // Location information
  locationId: string;
  locationType: string;
  locationCity: string;
  locationState: string;
}

export const columns = (
  companyId: string,
): ColumnDef<CompanyBrandWithLocation>[] => [
  {
    header: "Brand Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="flex w-max items-center gap-3 font-medium">
        {row.original.logoImage && (
          <Avatar
            src={row.original.logoImage}
            feedback={row.original.name.charAt(0)}
          />
        )}
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    header: "Website",
    accessorKey: "websiteUrl",
    cell: ({ row }) => (
      <div className="w-max">
        {row.original.websiteUrl ? (
          <a
            href={row.original.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {row.original.websiteUrl}
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    ),
  },
  {
    header: "Location",
    accessorKey: "locationCity",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className="w-fit">
          {row.original.locationCity}
        </Badge>
        <span className="text-xs text-gray-500">
          {row.original.locationType} • {row.original.locationState}
        </span>
      </div>
    ),
  },
  {
    header: "Status",
    accessorKey: "brandStatus",
    size: 200,
    cell: ({ row }) => (
      <div className="space-y-1">
        <StatusBadge
          status={row.original.brandStatus}
          module="brand"
          variant="badge"
        >
          {row.original.brandStatus}
        </StatusBadge>
        {row.original.brandStatus === "rejected" && row.original.statusChangeReason && (
          <div className="text-xs text-red-600 max-w-[180px] truncate" title={row.original.statusChangeReason}>
            Reason: {row.original.statusChangeReason}
          </div>
        )}
      </div>
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
            onClick: () => console.log("View brand:", row.original._id),
            to: PANEL_ROUTES.COMPANY.BRAND_VIEW(companyId, row.original._id),
            title: "View brand details",
          }}
          edit={{
            loading: false,
            onClick: () => console.log("Edit brand:", row.original._id),
            to: PANEL_ROUTES.COMPANY.BRAND_EDIT(companyId, row.original._id),
            title: "Edit brand",
          }}
          delete={{
            onClick: () => console.log("Delete brand:", row.original._id),
          }}
        />
      );
    },
  },
];
