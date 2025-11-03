import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
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

  const formattedSales = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(performanceData.sales);

  return (
    <Card className={cn("bg-white border-gray-200 border-l-4 border-l-[var(--chart-1)]", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Brand Performance Summary
          </CardTitle>
          <div className="bg-[var(--chart-1)]/20 rounded-full p-2 flex items-center justify-center">
            <BuildingStorefrontIcon className="h-5 w-5 text-[var(--chart-1)]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900">{performanceData.topBrand}</p>
            <p className="text-xs text-gray-500">Top performing brand</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-lg font-bold text-gray-900">{formattedSales}</p>
              <p className="text-xs text-gray-600">Sales</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{performanceData.orders}</p>
              <p className="text-xs text-gray-600">Orders</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-900">{performanceData.rating}</span>
              <span className="text-xs text-gray-600">★ avg rating</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
