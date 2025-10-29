import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatValue } from "@/core/components/ui/stat";
import { Badge } from "@/core/components/ui/badge";
import { 
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon 
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

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

  const isPositive = partnersData.change > 0;
  const formattedCount = partnersData.count.toLocaleString();

  return (
    <Card className={cn("bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-amber-700">
            Brand Partners Live
          </CardTitle>
          <BuildingStorefrontIcon className="h-5 w-5 text-amber-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <StatValue
            value={formattedCount}
            valueProps={{
              className: "text-2xl font-bold text-amber-900"
            }}
          />
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
                  {Math.abs(partnersData.change)}%
                </div>
              </Badge>
              <span className="text-xs text-gray-600">{partnersData.period}</span>
            </div>
            {partnersData.pendingCount > 0 && (
              <div className="text-xs text-gray-500">
                {partnersData.pendingCount} pending approval
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
