import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { 
  SparklesIcon,
  EyeIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";
import { apiGetSalesInsights, getImageUrl } from "../../../ecommerce/services";

interface NewProductLaunchesCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  brandId?: string;
}

export const NewProductLaunchesCard: React.FC<NewProductLaunchesCardProps> = ({ 
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

  const newProducts = salesInsights?.newProductLaunches || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getImageSrc = (thumbnail: string) => {
    if (!thumbnail) return undefined;
    // If it's already a full URL, return it
    if (thumbnail.startsWith('http')) return thumbnail;
    // Otherwise, use the getImageUrl utility
    return getImageUrl(thumbnail);
  };

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            New Product Launches
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading && (
          <div className="text-center py-8 text-gray-500 text-sm">Loading products...</div>
        )}
        {isError && (
          <div className="text-center py-8 text-red-500 text-sm">Error loading products</div>
        )}
        {!isLoading && !isError && newProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">No new products</div>
        )}
        {!isLoading && !isError && newProducts.length > 0 && (
          <div className="space-y-4">
            {newProducts.slice(0, 5).map((product) => {
              const imageSrc = getImageSrc(product.thumbnail);
              return (
                <div key={product.productId} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={product.productName}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center border border-gray-300">
                        <SparklesIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.brandName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {formatDate(product.createdAt)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-semibold text-gray-700">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs px-2 py-1">
                      New
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
