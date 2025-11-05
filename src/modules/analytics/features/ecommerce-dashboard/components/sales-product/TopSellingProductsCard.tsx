import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { 
  TrophyIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";
import { apiGetSalesInsights } from "../../../ecommerce/services";

interface TopSellingProductsCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  brandId?: string;
  limit?: number;
}

export const TopSellingProductsCard: React.FC<TopSellingProductsCardProps> = ({ 
  className,
  startDate,
  endDate,
  brandId,
  limit = 5,
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
    queryKey: ["sales-insights", startDate || defaultStartDate, endDate || defaultEndDate, brandId, limit],
    queryFn: async () => {
      const response = await apiGetSalesInsights({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
        brandId,
        page: 1,
        limit,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const products = salesInsights?.topProducts || [];

  const getRankIcon = (rank: number) => {
    const iconSize = "h-5 w-5";
    switch (rank) {
      case 1:
        return <TrophyIcon className={cn(iconSize, "text-yellow-500")} />;
      case 2:
        return <div className={cn(iconSize, "rounded-full bg-gray-400 flex items-center justify-center text-xs text-white font-bold")}>2</div>;
      case 3:
        return <div className={cn(iconSize, "rounded-full bg-orange-400 flex items-center justify-center text-xs text-white font-bold")}>3</div>;
      default:
        return <div className={cn(iconSize, "rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 font-bold")}>{rank}</div>;
    }
  };

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Top Selling Products
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {isLoading && (
          <div className="text-center py-4 text-gray-500 text-sm">Loading products...</div>
        )}
        {isError && (
          <div className="text-center py-4 text-red-500 text-sm">Error loading products</div>
        )}
        {!isLoading && !isError && products.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">No products found</div>
        )}
        {products.slice(0, limit).map((product, index) => (
          <div
            key={product._id}
            className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0">
              {getRankIcon(index + 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {product.productName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-gray-700">
                  ₹{product.totalRevenue.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">
                  Qty: {product.totalQuantity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
