import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { Badge } from "@/core/components/ui/badge";
import type { CustomerList } from "@/modules/panel/types/customer.type";
import { formatCurrency } from "@/core/utils";
import { memo, type FC } from "react";

const Stat = memo(
  ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  ),
);
Stat.displayName = "Stat";

interface CustomerCardProps {
  customer: CustomerList;
}

export const CustomerCard: FC<CustomerCardProps> = ({ customer }) => {
  return (
    <article className="bg-background hover:ring-primary flex flex-col gap-4 rounded-md p-4 shadow-md hover:ring-3 md:p-5">
      <header className="flex items-center gap-3">
        <Avatar className="size-12 rounded-md border">
          <AvatarImage
            className="object-cover"
            src={customer.profilePic?.url}
            alt={`${customer.name || "Customer"} profile`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {customer.name
              ? customer.name.charAt(0)
              : customer.phoneNumber?.charAt(0) || "C"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h6 className="truncate font-medium">
            {customer.name || "Unknown Customer"}
          </h6>
          {customer.phoneNumber && (
            <p className="text-muted-foreground text-sm">
              {customer.phoneNumber}
            </p>
          )}
          {customer.email && (
            <p className="text-muted-foreground truncate text-sm">
              {customer.email}
            </p>
          )}
          {customer.city && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {customer.city}
            </Badge>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 border-t pt-2">
        <Stat label="Orders" value={customer.totalOrders} />
        <Stat
          label="Total Spent"
          value={formatCurrency(customer.totalSpent, { useAbbreviation: true })}
        />
      </div>

      <div className="text-muted-foreground text-xs">
        Joined {new Date(customer.createdAt).toLocaleDateString()}
      </div>
    </article>
  );
};
