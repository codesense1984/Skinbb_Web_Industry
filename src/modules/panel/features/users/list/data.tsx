import { TableAction } from "@/core/components/data-table/components/table-action";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { formatDate } from "@/core/utils";
import { hasAccess } from "@/modules/auth/components/guard";
import { PAGE, PERMISSION } from "@/modules/auth/types/permission.type.";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { CompanyUserResponse } from "@/modules/panel/services/http/company.service";
import type { ColumnDef } from "@tanstack/react-table";

export const columns = (): ColumnDef<CompanyUserResponse>[] => [
  {
    header: "User",
    accessorKey: "firstName",
    size: 200,
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      const displayFirstName = user?.firstName || "";
      const displayLastName = user?.lastName || "";
      const displayFullName =
        displayFirstName && displayLastName
          ? `${displayFirstName} ${displayLastName}`
          : displayFirstName || displayLastName || "Unknown User";

      return (
        <div className="flex items-center gap-3 font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {displayFirstName.charAt(0).toUpperCase()}
            {displayLastName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{displayFullName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    header: "Phone",
    accessorKey: "phoneNumber",
    size: 150,
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.original.phoneNumber || "-"}
        </div>
      );
    },
  },
  {
    header: "Role",
    accessorKey: "roleValue",
    size: 120,
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="w-max capitalize">
          {row.original.roleValue || "Unknown"}
        </Badge>
      );
    },
  },
  {
    header: "Brands",
    accessorKey: "allowedBrands",
    size: 100,
    cell: ({ row }) => {
      const brandCount = row.original.allowedBrands?.length || 0;
      return (
        <div className="text-sm">
          {brandCount > 0 ? `${brandCount} brand${brandCount > 1 ? 's' : ''}` : "No brands"}
        </div>
      );
    },
  },
  {
    header: "Addresses",
    accessorKey: "allowedAddresses",
    size: 100,
    cell: ({ row }) => {
      const addressCount = row.original.allowedAddresses?.length || 0;
      return (
        <div className="text-sm">
          {addressCount > 0 ? `${addressCount} address${addressCount > 1 ? 'es' : ''}` : "No addresses"}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    size: 100,
    cell: ({ row }) => {
      return (
        <StatusBadge
          status={row.original.isActive ? "active" : "inactive"}
          module="user"
        />
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    size: 120,
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {formatDate(row.original.createdAt)}
        </div>
      );
    },
  },
  {
    header: "Actions",
    accessorKey: "actions",
    enableSorting: false,
    size: 100,
    enableHiding: false,
    cell: ({ row }: { row: { original: CompanyUserResponse } }) => {
      const user = row.original;
      return (
        <TableAction
          view={{
            to: PANEL_ROUTES.USER.VIEW(user.userId),
          }}
          edit={{
            to: PANEL_ROUTES.USER.EDIT(user.userId),
          }}
        />
      );
    },
  },
];