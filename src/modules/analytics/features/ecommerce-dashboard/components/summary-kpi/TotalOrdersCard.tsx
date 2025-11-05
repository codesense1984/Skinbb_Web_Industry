import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import type { AnalyticsOverviewData } from "@/modules/analytics/features/ecommerce/types";

interface TotalOrdersCardProps {
  className?: string;
  data?: AnalyticsOverviewData;
}

export const TotalOrdersCard: React.FC<TotalOrdersCardProps> = ({ className, data }) => {
  const totalOrders = data?.totalOrders ?? 0;
  const formattedTotal = totalOrders.toLocaleString();

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
