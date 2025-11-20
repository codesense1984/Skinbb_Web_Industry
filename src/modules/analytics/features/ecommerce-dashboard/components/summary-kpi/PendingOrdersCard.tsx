import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { ClockIcon } from "@heroicons/react/24/outline";
import type { AnalyticsOverviewData } from "@/modules/analytics/features/ecommerce/types";

interface PendingOrdersCardProps {
  className?: string;
  data?: AnalyticsOverviewData;
}

export const PendingOrdersCard: React.FC<PendingOrdersCardProps> = ({
  className,
  data,
}) => {
  const pendingOrders = data?.pendingOrders ?? 0;
  const formattedCount = pendingOrders.toLocaleString();

  return (
    <StatCard
      title="Pending Orders"
      value={formattedCount}
      barColor="bg-chart-1"
      icon={
        <div className="flex items-center justify-center rounded-full bg-[var(--chart-1)]/20 p-3">
          <ClockIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
