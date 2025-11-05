import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatChartCard } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { EyeIcon } from "@heroicons/react/24/outline";
import { type ChartConfig } from "@/core/components/ui/chart";
import BarChart from "@/core/components/charts/BarChart";
import { apiGetSalesInsights } from "../../../ecommerce/services";

interface TrendingCategoriesCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  brandId?: string;
}

export const TrendingCategoriesCard: React.FC<TrendingCategoriesCardProps> = ({ 
  className,
  startDate,
  endDate,
  brandId,
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

  const { data: salesInsights, isLoading, isError } = useQuery({
    queryKey: ["sales-insights", startDate || defaultStartDate, endDate || defaultEndDate, brandId],
    queryFn: async () => {
      const response = await apiGetSalesInsights({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
        brandId,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const categories = salesInsights?.topCategories || [];

  const categoryChartConfig = {
    value: {
      label: "Revenue",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const categoryChartData = categories.map((category) => ({
    key: category.categoryName.length > 15 ? category.categoryName.substring(0, 15) + "..." : category.categoryName,
    value: category.revenue,
    fullName: category.categoryName,
    orderCount: category.orderCount,
    productCount: category.productCount,
  }));

  return (
    <StatChartCard 
      name="Trending Categories" 
      className={className}
      actions={
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
          <EyeIcon className="h-4 w-4 mr-1" />
          View All
        </Button>
      }
    >
      {isLoading && (
        <div className="text-center py-8 text-gray-500 text-sm">Loading categories...</div>
      )}
      {isError && (
        <div className="text-center py-8 text-red-500 text-sm">Error loading categories</div>
      )}
      {!isLoading && !isError && categories.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">No categories found</div>
      )}
      {!isLoading && !isError && categories.length > 0 && (
        <BarChart
          config={categoryChartConfig}
          data={categoryChartData}
          layout="horizontal"
          barSize={30}
          showTooltip={true}
          showGrid={true}
          yAxisProps={{
            width: 100,
          }}
          className="h-64"
        />
      )}
    </StatChartCard>
  );
};
