import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

interface BrandPartnersLiveCardProps {
  className?: string;
}

interface BrandPartnersData {
  count: number;
  change: number;
  period: string;
  pendingCount: number;
}

export const BrandPartnersLiveCard: React.FC<BrandPartnersLiveCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const partnersData: BrandPartnersData = {
    count: 156,
    change: 4.2,
    period: "vs last month",
    pendingCount: 12
  };

  const formattedCount = partnersData.count.toLocaleString();

  return (
    <StatCard
      title="Brand Partners Live"
      value={formattedCount}
      barColor="bg-chart-1"
      icon={
        <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center">
          <BuildingStorefrontIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
