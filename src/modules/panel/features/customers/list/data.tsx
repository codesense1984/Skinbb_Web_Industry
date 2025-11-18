import {
  AvatarRoot,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import type { CustomerList } from "@/modules/panel/types/customer.type";
import { formatCurrency, formatDate } from "@/core/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { Button } from "@/core/components/ui/button";
import { useNavigate } from "react-router";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/solid";

// Component for Orders button
const OrdersButton = ({ customerId }: { customerId: string }) => {
  const navigate = useNavigate();

  const handleViewOrders = () => {
    navigate(`${PANEL_ROUTES.ORDER.LIST}?customerId=${customerId}`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleViewOrders}
      className="w-max"
    >
      View Orders
    </Button>
  );
};

// Component for Action buttons
const CustomerActions = ({ customerId }: { customerId: string }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outlined"
        size="icon"
        className="size-7 border"
        startIcon={<EyeIcon className="!size-4" />}
        onClick={() => {
          console.log("View clicked, navigating to:", PANEL_ROUTES.CUSTOMER.VIEW(customerId));
          navigate(PANEL_ROUTES.CUSTOMER.VIEW(customerId));
        }}
        title="View customer details"
      />
      <Button
        variant="outlined"
        size="icon"
        className="size-7 border"
        startIcon={<PencilIcon className="!size-4" />}
        onClick={() => navigate(PANEL_ROUTES.CUSTOMER.EDIT(customerId))}
        title="Edit customer"
      />
    </div>
  );
};

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
        <div className="w-max">{email}</div>
      ) : (
        <div className="text-muted-foreground w-max">-</div>
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
        <div className="text-muted-foreground w-max">-</div>
      );
    },
  },
  {
    accessorKey: "totalOrders",
    header: "Orders",
    cell: ({ getValue }) => {
      const orders = getValue() as number;
      return <div className="w-max font-medium">{orders}</div>;
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
  {
    header: "Orders",
    accessorKey: "orders",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;
      return <OrdersButton customerId={customer._id} />;
    },
  },
  {
    header: "Action",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;
      return <CustomerActions customerId={customer._id} />;
    },
  },
];
