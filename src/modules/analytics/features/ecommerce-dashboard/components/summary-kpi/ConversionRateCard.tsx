import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface ConversionRateCardProps {
  className?: string;
}

interface ConversionRateData {
  rate: number;
  change: number;
  period: string;
  visitors: number;
}

export const ConversionRateCard: React.FC<ConversionRateCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const conversionData: ConversionRateData = {
    rate: 3.2,
    change: -0.8,
    period: "vs last month",
    visitors: 12543
  };

  const formattedRate = `${conversionData.rate}%`;

  return (
    <StatCard
      title="Conversion Rate"
      value={formattedRate}
      barColor="bg-chart-1"
      icon={
        <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center">
          <ArrowPathIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
