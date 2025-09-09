import { TableAction } from "@/core/components/data-table/components/table-action";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { CompanyUserResponse } from "@/modules/panel/services/http/company.service";
import type { ColumnDef } from "@tanstack/react-table";

export const columns = (
  companyId: string,
): ColumnDef<CompanyUserResponse>[] => [
  {
    header: "User",
    accessorKey: "firstName",
    cell: ({ row }) => {
      const user = row.original;

      // Handle cases where names might be undefined or empty
      const displayFirstName = user.user.firstName || "";
      const displayLastName = user.user.lastName || "";
      const displayFullName =
        displayFirstName && displayLastName
          ? `${displayFirstName} ${displayLastName}`
          : displayFirstName || displayLastName || "Unknown User";

      return (
        <div className="flex w-max items-center gap-3 font-medium">
          {/* <Avatar
            feedback={`${displayFirstName.charAt(0)}${displayLastName.charAt(0)}`}
          /> */}
          <div className="font-medium">{displayFullName}</div>
        </div>
      );
    },
  },
  {
    header: "Phone",
    accessorKey: "phoneNumber",
    cell: ({ row }) => (
      <div className="w-max">{row.original.user.phoneNumber || "-"}</div>
    ),
  },
  {
    header: "Phone",
    accessorKey: "email",
    cell: ({ row }) => (
      <div className="w-max">{row.original.user.email || "-"}</div>
    ),
  },
  {
    header: "Role",
    accessorKey: "roleValue",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="w-max capitalize">
          {row.original.roleValue}
        </Badge>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => {
      return (
        <StatusBadge
          status={row.original?.user?.status || ""}
          module="company_user"
        />
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      return <div className="w-max">{formatDate(row.original.createdAt)}</div>;
    },
  },
  {
    header: "Action",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <TableAction
          view={{
            to: PANEL_ROUTES.COMPANY.USER_VIEW(companyId, user.userId),
          }}
          edit={{
            to: PANEL_ROUTES.COMPANY.USER_EDIT(companyId, user.userId),
          }}
        />
      );
    },
  },
];
