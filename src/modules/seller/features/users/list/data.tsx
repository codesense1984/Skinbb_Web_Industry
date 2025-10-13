import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { formatDate } from "@/core/utils";
import type { CompanyUserResponse } from "@/modules/panel/services/http/company.service";
import type { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<CompanyUserResponse>[] = [
  {
    header: "User",
    accessorKey: "firstName",
    size: 180,
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      // Handle cases where names might be undefined or empty
      const displayFirstName = user?.firstName || "";
      const displayLastName = user?.lastName || "";
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
    header: "Email",
    accessorKey: "email",
    size: 180,
  },
  {
    header: "Phone",
    accessorKey: "phoneNumber",
    size: 100,
  },

  {
    header: "Role",
    accessorKey: "roleValue",
    size: 100,
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="w-max capitalize">
          {row.original.roleValue}
        </Badge>
      );
    },
  },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   size: 100,
  //   cell: ({ row }) => {
  //     return (
  //       <StatusBadge
  //         status={row.original?.status || ""}
  //         module="company_user"
  //       />
  //     );
  //   },
  // },
  {
    accessorKey: "createdAt",
    header: "Joined",
    size: 100,
    cell: ({ row }) => {
      return formatDate(row.original.createdAt);
    },
  },
  // {
  //   header: "Action",
  //   accessorKey: "actions",
  //   enableSorting: false,
  //   size: 100,
  //   enableHiding: false,
  //   cell: ({ row }: { row: any }) => {
  //     const user = row.original;
  //     return (
  //       <TableAction
  //         view={{
  //           to: PANEL_ROUTES.COMPANY.USER_VIEW(companyId, user.userId),
  //         }}
  //         edit={{
  //           to: PANEL_ROUTES.COMPANY.USER_EDIT(companyId, user.userId),
  //         }}
  //       />
  //     );
  //   },
  // },
];
