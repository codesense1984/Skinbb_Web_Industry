import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

interface TotalSalesCardProps {
  className?: string;
}

interface SalesData {
  total: number;
  change: number;
  period: string;
  currency: string;
}

export const TotalSalesCard: React.FC<TotalSalesCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const salesData: SalesData = {
    total: 1254,
    change: 12.5,
    period: "vs last month",
    currency: "USD"
  };

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: salesData.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(salesData.total);

  return (
    <StatCard
      title="Total Sales"
      value={formattedTotal}
      barColor="bg-chart-1"
      icon={
        <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center">
          <CurrencyDollarIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
