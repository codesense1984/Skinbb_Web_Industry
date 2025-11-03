import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

interface TotalOrdersCardProps {
  className?: string;
}

interface OrdersData {
  total: number;
  change: number;
  period: string;
}

export const TotalOrdersCard: React.FC<TotalOrdersCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const ordersData: OrdersData = {
    total: 2847,
    change: 8.2,
    period: "vs last month"
  };

  const formattedTotal = ordersData.total.toLocaleString();

  return (
    <StatCard
      title="Total Orders"
      value={formattedTotal}
      barColor="bg-chart-1"
      icon={
        <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center">
          <ShoppingBagIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};