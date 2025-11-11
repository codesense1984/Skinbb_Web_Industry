import { StatusBadge } from "@/core/components/ui/badge";
import type { Order } from "@/modules/panel/types/order.type";
import { formatCurrency, formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { memo, type FC } from "react";
import { NavLink } from "react-router";

const Stat = memo(
  ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  ),
);
Stat.displayName = "Stat";

interface OrderCardProps {
  order: Order;
}

export const OrderCard: FC<OrderCardProps> = ({ order }) => {
  return (
    <NavLink to={PANEL_ROUTES.ORDER.VIEW(order._id)}>
      <article className="bg-background hover:ring-primary flex flex-col gap-4 rounded-md p-4 shadow-md hover:ring-3 md:p-5">
        <header className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h6 className="truncate font-medium">{order.orderNumber}</h6>
            <p className="text-muted-foreground text-sm">{order.fullName || "N/A"}</p>
            {order.brand && (
              <p className="text-muted-foreground mt-1 text-xs">
                {order.brand.name}
              </p>
            )}
          </div>
          <StatusBadge
            module="order"
            status={order.status || "pending"}
            variant="badge"
          />
        </header>

        <div className="grid grid-cols-2 gap-4 border-t pt-2">
          <Stat
            label="Amount"
            value={formatCurrency(order.totalAmount || 0)}
          />
          <Stat
            label="Payment"
            value={(order.paymentMethod || "N/A").toUpperCase()}
          />
        </div>

        <div className="text-muted-foreground text-xs">
          <span>{formatDate(order.createdAt)}</span>
        </div>
      </article>
    </NavLink>
  );
};

