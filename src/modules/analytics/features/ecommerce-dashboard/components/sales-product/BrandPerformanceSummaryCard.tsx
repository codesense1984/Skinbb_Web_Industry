import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatChartCard } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { EyeIcon } from "@heroicons/react/24/outline";
import { type ChartConfig } from "@/core/components/ui/chart";
import BarChart from "@/core/components/charts/BarChart";
import { apiGetBrandInsights } from "../../../ecommerce/services";

interface BrandPerformanceSummaryCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const BrandPerformanceSummaryCard: React.FC<BrandPerformanceSummaryCardProps> = ({ 
  className,
  startDate,
  endDate,
  limit = 10,
}) => {
  // Calculate default date range (last 30 days)
  const defaultEndDate = React.useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const defaultStartDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }, []);

  const { data: brandInsights, isLoading, isError } = useQuery({
    queryKey: ["brand-insights", startDate || defaultStartDate, endDate || defaultEndDate, limit],
    queryFn: async () => {
      const response = await apiGetBrandInsights({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
        page: 1,
        limit,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const brands = brandInsights?.brands || [];
  const totalActiveBrands = brandInsights?.totalActiveBrands || 0;

  const brandChartConfig = {
    value: {
      label: "Revenue",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const brandChartData = brands.map((brand) => ({
    key: brand.brandName.length > 15 ? brand.brandName.substring(0, 15) + "..." : brand.brandName,
    value: brand.totalRevenue,
    fullBrand: brand.brandName,
    orders: brand.totalOrders,
    productCount: brand.productCount,
  }));

  return (
    <StatChartCard 
      name="Brand Performance Summary" 
      className={className}
      actions={
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
          <EyeIcon className="h-4 w-4 mr-1" />
          View All
        </Button>
      }
    >
      {isLoading && (
        <div className="text-center py-8 text-gray-500 text-sm">Loading brand data...</div>
      )}
      {isError && (
        <div className="text-center py-8 text-red-500 text-sm">Error loading brand data</div>
      )}
      {!isLoading && !isError && brands.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">No brand data available</div>
      )}
      {!isLoading && !isError && brands.length > 0 && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Active Brands</span>
              <span className="text-lg font-bold text-gray-900">{totalActiveBrands}</span>
            </div>
          </div>
          <BarChart
            config={brandChartConfig}
            data={brandChartData}
            layout="horizontal"
            barSize={25}
            showTooltip={true}
            showGrid={true}
            yAxisProps={{
              width: 120,
            }}
            className="h-64"
          />
          <div className="mt-4 space-y-2">
            {brands.slice(0, 3).map((brand) => (
              <div key={brand.brandId} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{brand.brandName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600">{brand.totalOrders} orders</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-600">{brand.productCount} products</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-900">
                    ₹{(brand.totalRevenue / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </StatChartCard>
  );
};
