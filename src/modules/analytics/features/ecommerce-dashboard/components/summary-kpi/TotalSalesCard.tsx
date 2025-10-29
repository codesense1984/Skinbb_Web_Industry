import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatValue } from "@/core/components/ui/stat";
import { Badge } from "@/core/components/ui/badge";
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon 
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface TotalSalesCardProps {
  className?: string;
}

interface SalesData {
  total: number;
  change: number;
  period: string;
  currency: string;
}

export const TotalSalesCard: React.FC<TotalSalesCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const salesData: SalesData = {
    total: 125430,
    change: 12.5,
    period: "vs last month",
    currency: "USD"
  };

  const isPositive = salesData.change > 0;
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: salesData.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(salesData.total);

  return (
    <Card className={cn("bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-blue-700">
            Total Sales
          </CardTitle>
          <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <StatValue
            value={formattedTotal}
            valueProps={{
              className: "text-2xl font-bold text-blue-900"
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
                {Math.abs(salesData.change)}%
              </div>
            </Badge>
            <span className="text-xs text-gray-600">{salesData.period}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
