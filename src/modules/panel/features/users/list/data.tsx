import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import type { SellerMemberList } from "@/modules/panel/types/user.type";
import { formatDate } from "@/core/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/components/ui/badge";
import { TableAction } from "@/core/components/data-table/components/table-action";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

export const statsData = [
  {
    title: "Total Users",
    value: 0, // This will be updated from API response
    barColor: "bg-primary",
    icon: true,
  },
  {
    title: "Active Users",
    value: 0, // This will be updated from API response
    barColor: "bg-blue-300",
    icon: false,
  },
  {
    title: "Inactive Users",
    value: 0, // This will be updated from API response
    barColor: "bg-violet-300",
    icon: false,
  },
  {
    title: "New This Month",
    value: 0, // This will be updated from API response
    barColor: "bg-red-300",
    icon: true,
  },
];

export const columns: ColumnDef<SellerMemberList>[] = [
  {
    accessorKey: "firstName",
    header: "User",
    cell: ({ row, getValue }) => {
      const firstName = getValue() as string;
      const user = row.original;
      const fullName = `${firstName} ${user.lastName}`;

      return (
        <ul className="flex min-w-40 items-center gap-2">
          <Avatar className="size-10 rounded-md border">
            <AvatarImage
              className="object-cover"
              src={undefined} // No profile pic in API response
              alt={`${fullName} profile`}
            />
            <AvatarFallback className="rounded-md capitalize">
              {firstName ? firstName.charAt(0) : user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{fullName}</span>
            {user.email && (
              <span className="text-muted-foreground text-sm">
                {user.email}
              </span>
            )}
          </div>
        </ul>
      );
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ getValue }) => {
      const phone = getValue() as string;
      return phone ? (
        <div className="w-max">{phone}</div>
      ) : (
        <div className="text-muted-foreground w-max">-</div>
      );
    },
  },
  {
    accessorKey: "roleId",
    header: "Role",
    cell: ({ getValue }) => {
      const roleId = getValue() as string;
      return roleId ? (
        <Badge variant="secondary" className="w-max">
          {roleId}
        </Badge>
      ) : (
        <div className="text-muted-foreground w-max">-</div>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ getValue }) => {
      const active = getValue() as boolean;
      return (
        <Badge variant={active ? "default" : "destructive"} className="w-max">
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
            to: PANEL_ROUTES.USER.VIEW(user._id),
            title: "View user details",
          }}
          edit={{
            to: PANEL_ROUTES.USER.EDIT(user._id),
            title: "Edit user",
          }}
          delete={{
            onClick: () => {
              // TODO: Implement delete functionality
              console.log("Delete user:", user._id);
            },
            title: "Delete user",
          }}
        />
      );
    },
  },
];
