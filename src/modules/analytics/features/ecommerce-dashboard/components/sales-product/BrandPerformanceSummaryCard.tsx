import React, { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatChartCard } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { EyeIcon } from "@heroicons/react/24/outline";
import { type ChartConfig } from "@/core/components/ui/chart";
import BarChart from "@/core/components/charts/BarChart";
import { apiGetBrandInsights } from "../../../ecommerce/services";
import { formatCurrency, formatNumber } from "@/core/utils";

interface BrandPerformanceSummaryCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const BrandPerformanceSummaryCard: React.FC<
  BrandPerformanceSummaryCardProps
> = ({ className, startDate, endDate, limit = 10 }) => {
  // Calculate default date range (last 30 days)
  const defaultEndDate = React.useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const defaultStartDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }, []);

  const {
    data: brandInsights,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "brand-insights",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
      limit,
    ],
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
    key:
      brand.brandName.length > 15
        ? brand.brandName.substring(0, 15) + "..."
        : brand.brandName,
    value: brand.totalRevenue,
    fullBrand: brand.brandName,
    orders: brand.totalOrders,
    productCount: brand.productCount,
  }));

  return (
    <StatChartCard
      name="Brand Performance Summary"
      className={className}
      // actions={
      //   <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
      //     <EyeIcon className="h-4 w-4 mr-1" />
      //     View All
      //   </Button>
      // }
    >
      {isLoading && (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading brand data...
        </div>
      )}
      {isError && (
        <div className="py-8 text-center text-sm text-red-500">
          Error loading brand data
        </div>
      )}
      {!isLoading && !isError && brands.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          No brand data available
        </div>
      )}
      {!isLoading && !isError && brands.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <BarChart
            config={brandChartConfig}
            data={brandChartData}
            layout="horizontal"
            // barSize={25}
            showTooltip={true}
            showGrid={true}
            yAxisProps={{
              width: 70,
            }}
            className="max-h-64"
          />
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Total Active Brands
                </span>
                <span className="font-bold">{totalActiveBrands}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {brands.slice(0, 3).map((brand, index) => (
                <Fragment key={brand.brandId}>
                  <div
                    key={brand.brandId}
                    className="flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{brand.brandName}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                          {brand.totalOrders} orders
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {brand.productCount} products
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground text-sm font-bold">
                        ₹{formatNumber(brand.totalRevenue)}
                      </p>
                    </div>
                  </div>
                  {brands.slice(0, 3).length - 1 !== index && <hr />}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </StatChartCard>
  );
};
