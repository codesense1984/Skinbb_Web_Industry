import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { StarIcon } from "@heroicons/react/24/outline";
import type { AnalyticsOverviewData } from "@/modules/analytics/features/ecommerce/types";

interface AverageProductRatingCardProps {
  className?: string;
  data?: AnalyticsOverviewData;
}

export const AverageProductRatingCard: React.FC<AverageProductRatingCardProps> = ({ className, data }) => {
  const averageProductRating = data?.averageProductRating ?? 0;
  const formattedRating = averageProductRating.toFixed(1);

  return (
    <StatCard
      title="Average Product Rating"
      value={formattedRating}
      barColor="bg-chart-1"
      icon={
        <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center">
          <StarIcon className="h-6 w-6 text-[var(--chart-1)]" />
        </div>
      }
      className={className}
    />
  );
};
