import React from "react";
import { StatCard } from "@/core/components/ui/stat";
import { StarIcon } from "@heroicons/react/24/outline";

interface AverageProductRatingCardProps {
  className?: string;
}

interface RatingData {
  rating: number;
  change: number;
  period: string;
  totalReviews: number;
}

export const AverageProductRatingCard: React.FC<AverageProductRatingCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const ratingData: RatingData = {
    rating: 4.3,
    change: 0.2,
    period: "vs last month",
    totalReviews: 2847
  };

  const formattedRating = ratingData.rating.toFixed(1);

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
