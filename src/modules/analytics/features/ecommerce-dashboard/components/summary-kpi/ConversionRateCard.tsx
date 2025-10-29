import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatValue } from "@/core/components/ui/stat";
import { Badge } from "@/core/components/ui/badge";
import { 
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon 
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

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

  const isPositive = conversionData.change > 0;
  const formattedRate = `${conversionData.rate}%`;

  return (
    <Card className={cn("bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-rose-700">
            Conversion Rate
          </CardTitle>
          <ArrowPathIcon className="h-5 w-5 text-rose-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <StatValue
            value={formattedRate}
            valueProps={{
              className: "text-2xl font-bold text-rose-900"
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
                  {Math.abs(conversionData.change)}%
                </div>
              </Badge>
              <span className="text-xs text-gray-600">{conversionData.period}</span>
            </div>
            <div className="text-xs text-gray-500">
              {conversionData.visitors.toLocaleString()} visitors
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
