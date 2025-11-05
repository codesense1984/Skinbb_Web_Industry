import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { CurrencyRupeeIcon } from "@heroicons/react/24/outline";
import type { AnalyticsOverviewData } from "@/modules/analytics/features/ecommerce/types";

interface TotalSalesCardProps {
  className?: string;
  data?: AnalyticsOverviewData;
}

export const TotalSalesCard: React.FC<TotalSalesCardProps> = ({ className, data }) => {
  const totalSales = data?.totalSales ?? 0;
  const currency = "INR";

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalSales);

  return (
    <StatCard
      title="Total Sales"
      value={formattedTotal}
      barColor="bg-chart-1"
      icon={
        <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center">
          <CurrencyRupeeIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
