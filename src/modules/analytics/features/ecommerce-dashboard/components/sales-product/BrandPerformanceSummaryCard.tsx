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

interface BrandPerformanceSummaryCardProps {
  className?: string;
}

interface BrandPerformanceData {
  topBrand: string;
  sales: number;
  orders: number;
  rating: number;
  change: number;
  period: string;
}

export const BrandPerformanceSummaryCard: React.FC<BrandPerformanceSummaryCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const performanceData: BrandPerformanceData = {
    topBrand: "Luxury Skincare Co.",
    sales: 45620,
    orders: 234,
    rating: 4.7,
    change: 12.3,
    period: "vs last month"
  };

  const isPositive = performanceData.change > 0;
  const formattedSales = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(performanceData.sales);

  return (
    <Card className={cn("bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-indigo-700">
            Brand Performance Summary
          </CardTitle>
          <BuildingStorefrontIcon className="h-5 w-5 text-indigo-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-indigo-900">{performanceData.topBrand}</p>
            <p className="text-xs text-gray-600">Top performing brand</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <StatValue
                value={formattedSales}
                valueProps={{
                  className: "text-lg font-bold text-indigo-900"
                }}
              />
              <p className="text-xs text-gray-600">Sales</p>
            </div>
            <div>
              <StatValue
                value={performanceData.orders}
                valueProps={{
                  className: "text-lg font-bold text-indigo-900"
                }}
              />
              <p className="text-xs text-gray-600">Orders</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-indigo-900">{performanceData.rating}</span>
              <span className="text-xs text-gray-600">★ avg rating</span>
            </div>
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
                {Math.abs(performanceData.change)}%
              </div>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
