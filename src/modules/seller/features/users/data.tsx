import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { StatusBadge } from "@/core/components/ui/badge";
import { formatDate } from "@/core/utils";
import { SELLER_ROUTES } from "@/modules/seller/routes/constant";
import { CompanyUserResponse } from "@/modules/panel/services/http/company.service";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router";

// Avatar component for user initials
const UserAvatar = ({ firstName, lastName }: { firstName: string; lastName: string }) => {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
      {initials}
    </div>
  );
};

// Table actions component
const TableAction = ({ user }: { user: CompanyUserResponse }) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        asChild
      >
        <NavLink to={SELLER_ROUTES.USERS.VIEW(user.companyId, user.userId)}>
          <EyeIcon className="h-4 w-4" />
        </NavLink>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        asChild
      >
        <NavLink to={SELLER_ROUTES.USERS.EDIT(user.companyId, user.userId)}>
          <PencilIcon className="h-4 w-4" />
        </NavLink>
      </Button>
    </div>
  );
};

export const columns: ColumnDef<CompanyUserResponse>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <UserAvatar firstName={user.firstName} lastName={user.lastName} />
          <div>
            <div className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.original.phoneNumber;
      return <div className="text-sm text-gray-900">{phone || "-"}</div>;
    },
  },
  {
    accessorKey: "roleValue",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.roleValue;
      return (
        <Badge variant="secondary" className="capitalize">
          {role || "-"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "allowedBrands",
    header: "Brands",
    cell: ({ row }) => {
      const brands = row.original.allowedBrands || [];
      return (
        <div className="text-sm text-gray-900">
          {brands.length} brand{brands.length !== 1 ? "s" : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "allowedAddresses",
    header: "Locations",
    cell: ({ row }) => {
      const addresses = row.original.allowedAddresses || [];
      return (
        <div className="text-sm text-gray-900">
          {addresses.length} location{addresses.length !== 1 ? "s" : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <StatusBadge status={isActive ? "active" : "inactive"}>
          {isActive ? "Active" : "Inactive"}
        </StatusBadge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <div className="text-sm text-gray-900">
          {date ? formatDate(date) : "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <TableAction user={row.original} />,
  },
];
