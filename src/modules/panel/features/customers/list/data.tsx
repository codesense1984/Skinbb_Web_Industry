import {
  AvatarRoot,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { Button } from "@/core/components/ui/button";
import type { CustomerList } from "@/modules/panel/types/customer.type";
import { formatCurrency } from "@/core/utils";
import { EyeIcon } from "@heroicons/react/24/outline";
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
          <AvatarRoot className="size-10 rounded-md border">
            <AvatarImage
              className="object-cover"
              src={customer.profilePic?.url}
              alt={`${name || "Customer"} profile`}
            />
            <AvatarFallback className="rounded-md capitalize">
              {name ? name.charAt(0) : customer.phoneNumber?.charAt(0) || "C"}
            </AvatarFallback>
          </AvatarRoot>
          <div className="flex flex-col">
            <span className="font-medium">{name || "Unknown Customer"}</span>
            {customer.phoneNumber && (
              <span className="text-muted-foreground text-sm">
                {customer.phoneNumber}
              </span>
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
        <span className="text-sm">{email}</span>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: "city",
    header: "Location",
    cell: ({ getValue }) => {
      const city = getValue() as string;
      return city ? (
        <span className="text-sm">{city}</span>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: "totalOrders",
    header: "Orders",
    cell: ({ getValue }) => {
      const orders = getValue() as number;
      return <span className="font-medium">{orders}</span>;
    },
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ getValue }) => {
      const amount = getValue() as number;
      return (
        <span className="font-medium text-green-600">
          {formatCurrency(amount, { useAbbreviation: false })}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return <span className="text-sm">{date.toLocaleDateString()}</span>;
    },
  },
  {
    header: "Action",
    id: "actions",
    enableHiding: false,
    cell: () => {
      return (
        <Button variant="ghost" size="icon" className="">
          <span className="sr-only">View Customer Details</span>
          <EyeIcon />
        </Button>
      );
    },
  },
];
