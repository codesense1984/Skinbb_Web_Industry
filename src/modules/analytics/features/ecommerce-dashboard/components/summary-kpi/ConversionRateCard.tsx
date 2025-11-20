import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { AnalyticsOverviewData } from "@/modules/analytics/features/ecommerce/types";

interface ConversionRateCardProps {
  className?: string;
  data?: AnalyticsOverviewData;
}

export const ConversionRateCard: React.FC<ConversionRateCardProps> = ({
  className,
  data,
}) => {
  const conversionRate = data?.conversionRate ?? 0;
  const formattedRate = `${conversionRate.toFixed(2)}%`;

  return (
    <StatCard
      title="Conversion Rate"
      value={formattedRate}
      barColor="bg-chart-1"
      icon={
        <div className="flex items-center justify-center rounded-full bg-[var(--chart-1)]/20 p-3">
          <ArrowPathIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
