import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
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
    change: 8.2,
    period: "vs last month",
    value: 12540
  };

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abandonedData.value);

  return (
    <Card className={cn("bg-white border-gray-200 border-l-4 border-l-[var(--chart-1)]", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Abandoned Draft Orders
          </CardTitle>
          <div className="bg-[var(--chart-1)]/20 rounded-full p-2 flex items-center justify-center">
            <ChartBarIcon className="h-5 w-5 text-[var(--chart-1)]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-2xl font-bold text-gray-900">{abandonedData.count}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge 
                variant="default"
                className="bg-[var(--chart-1)]/10 text-[var(--chart-1)] hover:bg-[var(--chart-1)]/20 text-xs px-2 py-1"
              >
                <div className="flex items-center gap-1">
                  <ArrowTrendingUpIcon className="h-3 w-3" />
                  {Math.abs(abandonedData.change)}%
                </div>
              </Badge>
              <span className="text-xs text-gray-600">{abandonedData.period}</span>
            </div>
            <div className="text-xs text-gray-600">
              Value: {formattedValue}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
