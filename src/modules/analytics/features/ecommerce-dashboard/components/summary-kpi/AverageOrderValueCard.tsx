import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import type { AnalyticsOverviewData } from "@/modules/analytics/features/ecommerce/types";

interface AverageOrderValueCardProps {
  className?: string;
  data?: AnalyticsOverviewData;
}

export const AverageOrderValueCard: React.FC<AverageOrderValueCardProps> = ({
  className,
  data,
}) => {
  const averageOrderValue = data?.averageOrderValue ?? 0;
  const currency = "INR";

  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(averageOrderValue);

  return (
    <StatCard
      title="Average Order Value"
      value={formattedValue}
      barColor="bg-chart-1"
      icon={
        <div className="flex items-center justify-center rounded-full bg-[var(--chart-1)]/20 p-3">
          <ChartBarIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
