import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import type { AnalyticsOverviewData } from "@/modules/analytics/features/ecommerce/types";

interface BrandPartnersLiveCardProps {
  className?: string;
  data?: AnalyticsOverviewData;
}

export const BrandPartnersLiveCard: React.FC<BrandPartnersLiveCardProps> = ({ className, data }) => {
  const brandPartnersLive = data?.brandPartnersLive ?? 0;
  const formattedCount = brandPartnersLive.toLocaleString();

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
