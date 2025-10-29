import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatValue } from "@/core/components/ui/stat";
import { Badge } from "@/core/components/ui/badge";
import { 
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon 
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

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

  const isPositive = ratingData.change > 0;
  const formattedRating = ratingData.rating.toFixed(1);

  return (
    <Card className={cn("bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-yellow-700">
            Average Product Rating
          </CardTitle>
          <StarIcon className="h-5 w-5 text-yellow-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatValue
              value={formattedRating}
              valueProps={{
                className: "text-2xl font-bold text-yellow-900"
              }}
            />
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(ratingData.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge 
                variant={isPositive ? "default" : "destructive"}
                className={cn(
                  "text-xs px-2 py-1",
                  isPositive 
                    ? "bg-green-100 text-green-800 hover:bg-green-100" 
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                )}
              >
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3 w-3" />
                  )}
                  {Math.abs(ratingData.change)}
                </div>
              </Badge>
              <span className="text-xs text-gray-600">{ratingData.period}</span>
            </div>
            <div className="text-xs text-gray-500">
              {ratingData.totalReviews.toLocaleString()} reviews
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
