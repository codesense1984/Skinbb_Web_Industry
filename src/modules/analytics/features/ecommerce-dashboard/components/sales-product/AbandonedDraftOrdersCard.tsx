import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatValue } from "@/core/components/ui/stat";
import { Badge } from "@/core/components/ui/badge";
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon 
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface AbandonedDraftOrdersCardProps {
  className?: string;
}

interface AbandonedOrderData {
  count: number;
  change: number;
  period: string;
  value: number;
}

export const AbandonedDraftOrdersCard: React.FC<AbandonedDraftOrdersCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const abandonedData: AbandonedOrderData = {
    count: 47,
    change: -8.2,
    period: "vs last month",
    value: 12540
  };

  const isPositive = abandonedData.change > 0;
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abandonedData.value);

  return (
    <Card className={cn("bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-orange-700">
            Abandoned Draft Orders
          </CardTitle>
          <ChartBarIcon className="h-5 w-5 text-orange-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <StatValue
            value={abandonedData.count}
            valueProps={{
              className: "text-2xl font-bold text-orange-900"
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
                  {Math.abs(abandonedData.change)}%
                </div>
              </Badge>
              <span className="text-xs text-gray-600">{abandonedData.period}</span>
            </div>
            <div className="text-xs text-gray-500">
              Value: {formattedValue}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
