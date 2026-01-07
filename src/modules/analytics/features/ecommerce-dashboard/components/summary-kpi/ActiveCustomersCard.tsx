import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { UsersIcon } from "@heroicons/react/24/outline";
import type { AnalyticsOverviewData } from "@/modules/analytics/features/ecommerce/types";

interface ActiveCustomersCardProps {
  className?: string;
  data?: AnalyticsOverviewData;
}

export const ActiveCustomersCard: React.FC<ActiveCustomersCardProps> = ({
  className,
  data,
}) => {
  const activeCustomers = data?.activeCustomers ?? 0;
  const formattedCount = activeCustomers.toLocaleString();

  return (
    <StatCard
      title="Active Customers"
      value={formattedCount}
      barColor="bg-chart-1"
      icon={
        <div className="flex items-center justify-center rounded-full bg-[var(--chart-1)]/20 p-3">
          <UsersIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
