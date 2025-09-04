import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import type { CustomerList } from "@/modules/panel/types/customer.type";
import { formatCurrency, formatDate } from "@/core/utils";
import type { ColumnDef } from "@tanstack/react-table";

export const statsData = [
  {
    title: "Total Customers",
    value: 0, // This will be updated from API response
    barColor: "bg-primary",
    icon: true,
  },
  {
    title: "Active Customers",
    value: 0, // This will be updated from API response
    barColor: "bg-blue-300",
    icon: false,
  },
  {
    title: "Total Orders",
    value: 0, // This will be updated from API response
    barColor: "bg-violet-300",
    icon: false,
  },
  {
    title: "Total Revenue",
    value: 0, // This will be updated from API response
    barColor: "bg-red-300",
    icon: true,
  },
];

export const columns: ColumnDef<CustomerList>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row, getValue }) => {
      const name = getValue() as string;
      const customer = row.original;
      
      return (
        <ul className="flex min-w-40 items-center gap-2">
          <Avatar className="size-10 rounded-md border">
            <AvatarImage
              className="object-cover"
              src={customer.profilePic?.url}
              alt={`${name || 'Customer'} profile`}
            />
            <AvatarFallback className="rounded-md capitalize">
              {name ? name.charAt(0) : customer.phoneNumber?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{name || 'Unknown Customer'}</span>
            {customer.phoneNumber && (
              <span className="text-sm text-muted-foreground">{customer.phoneNumber}</span>
            )}
          </div>
        </ul>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => {
      const email = getValue() as string;
      return email ? (
        <div className="w-max">{email}</div>
      ) : (
        <div className="w-max text-muted-foreground">-</div>
      );
    },
  },
  {
    accessorKey: "city",
    header: "Location",
    cell: ({ getValue }) => {
      const city = getValue() as string;
      return city ? (
        <div className="w-max">{city}</div>
      ) : (
        <div className="w-max text-muted-foreground">-</div>
      );
    },
  },
  {
    accessorKey: "totalOrders",
    header: "Orders",
    cell: ({ getValue }) => {
      const orders = getValue() as number;
      return (
        <div className="w-max font-medium">{orders}</div>
      );
    },
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ getValue }) => {
      const amount = getValue() as number;
      return (
        <div className="w-max font-medium text-green-600">
          {formatCurrency(amount, { useAbbreviation: false })}
        </div>
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
];
