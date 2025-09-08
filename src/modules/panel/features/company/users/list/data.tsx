import {
  TableAction,
} from "@/core/components/data-table/components/table-action";
import { Avatar } from "@/core/components/ui/avatar";
import { Badge } from "@/core/components/ui/badge";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { SellerMemberList } from "@/modules/panel/types/user.type";
import type { ColumnDef } from "@tanstack/react-table";

export const columns = (companyId: string): ColumnDef<SellerMemberList>[] => [
  {
    header: "User",
    accessorKey: "firstName",
    cell: ({ row, getValue }) => {
      const firstName = getValue() as string;
      const user = row.original;
      
      // Handle cases where names might be undefined or empty
      const displayFirstName = firstName || '';
      const displayLastName = user.lastName || '';
      const displayFullName = displayFirstName && displayLastName 
        ? `${displayFirstName} ${displayLastName}` 
        : displayFirstName || displayLastName || 'Unknown User';
      
      return (
        <div className="flex w-max items-center gap-3 font-medium">
          <Avatar
            feedback={`${displayFirstName.charAt(0)}${displayLastName.charAt(0)}`}
          />
          <div>
            <div className="font-medium">{displayFullName}</div>
            {user.email && (
              <div className="text-sm text-muted-foreground">{user.email}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    header: "Phone",
    accessorKey: "phoneNumber",
    cell: ({ row }) => (
      <div className="w-max">{row.original.phoneNumber || "-"}</div>
    ),
  },
  {
    header: "Role",
    accessorKey: "roleId",
    cell: ({ getValue }) => {
      const roleId = getValue() as string;
      return roleId ? (
        <Badge variant="secondary" className="w-max">
          {roleId}
        </Badge>
      ) : (
        <div className="w-max text-muted-foreground">-</div>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ getValue }) => {
      const active = getValue() as boolean;
      return (
        <Badge 
          variant={active ? "default" : "destructive"} 
          className="w-max"
        >
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ getValue }) => {
      const createdAt = getValue() as string;
      return <div className="w-max">{formatDate(createdAt)}</div>;
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
            to: PANEL_ROUTES.COMPANY.USER_VIEW(companyId, user._id),
          }}
          edit={{
            to: PANEL_ROUTES.COMPANY.USER_EDIT(companyId, user._id),
          }}
          delete={{
            onClick: () => {
              // TODO: Implement delete functionality
              console.log("Delete user:", user._id);
            },
          }}
        />
      );
    },
  },
];
