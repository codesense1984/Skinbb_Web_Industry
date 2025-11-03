import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { ChartBarIcon } from "@heroicons/react/24/outline";

interface AverageOrderValueCardProps {
  className?: string;
}

interface AOVData {
  value: number;
  change: number;
  period: string;
  currency: string;
}

export const AverageOrderValueCard: React.FC<AverageOrderValueCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const aovData: AOVData = {
    value: 89.50,
    change: -2.1,
    period: "vs last month",
    currency: "USD"
  };

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: aovData.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(aovData.value);

  return (
    <StatCard
      title="Average Order Value"
      value={formattedValue}
      barColor="bg-chart-1"
      icon={
        <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center">
          <ChartBarIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
