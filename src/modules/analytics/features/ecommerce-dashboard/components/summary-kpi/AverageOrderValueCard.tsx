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

interface AverageOrderValueCardProps {
  className?: string;
}

interface AOVData {
  value: number;
  change: number;
  period: string;
  currency: string;
}

export const AverageOrderValueCard: React.FC<AverageOrderValueCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const aovData: AOVData = {
    value: 89.50,
    change: -2.1,
    period: "vs last month",
    currency: "USD"
  };

  const isPositive = aovData.change > 0;
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: aovData.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(aovData.value);

  return (
    <Card className={cn("bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-purple-700">
            Average Order Value
          </CardTitle>
          <ChartBarIcon className="h-5 w-5 text-purple-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <StatValue
            value={formattedValue}
            valueProps={{
              className: "text-2xl font-bold text-purple-900"
            }}
          />
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
                {Math.abs(aovData.change)}%
              </div>
            </Badge>
            <span className="text-xs text-gray-600">{aovData.period}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
