import React, { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatChartCard,
} from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import {
  SparklesIcon,
  EyeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { cn, formatNumber } from "@/core/utils";
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
    return new Date().toISOString().split("T")[0];
  }, []);

  const defaultStartDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }, []);

  const {
    data: salesInsights,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "sales-insights",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
      brandId,
    ],
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
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getImageSrc = (thumbnail: string) => {
    if (!thumbnail) return undefined;
    // If it's already a full URL, return it
    if (thumbnail.startsWith("http")) return thumbnail;
    // Otherwise, use the getImageUrl utility
    return getImageUrl(thumbnail);
  };

  return (
    <StatChartCard name="New Product Launches">
      {isLoading && (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading products...
        </div>
      )}
      {isError && (
        <div className="py-8 text-center text-sm text-red-500">
          Error loading products
        </div>
      )}
      {!isLoading && !isError && newProducts.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          No new products
        </div>
      )}
      {!isLoading && !isError && newProducts.length > 0 && (
        <div className="space-y-4">
          {newProducts.slice(0, 5).map((product, index) => {
            const imageSrc = getImageSrc(product.thumbnail);
            return (
              <Fragment key={product.productId}>
                <div
                  key={product.productId}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={product.productName}
                        className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-gray-200">
                        <SparklesIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {product.productName}
                    </p>
                    {/* <p className="text-xs text-gray-500">{product.brandName}</p> */}
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="text-muted-foreground h-3 w-3" />
                      <span className="text-muted-foreground text-sm">
                        {formatDate(product.createdAt)}
                      </span>
                      &nbsp;
                      <span className="text-muted-foreground text-sm">
                        ₹{formatNumber(product.price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge
                      variant="default"
                      className="bg-green-100 px-2 py-1 text-xs text-green-800 hover:bg-green-100"
                    >
                      New
                    </Badge>
                  </div>
                </div>
                {newProducts.slice(0, 5).length - 1 !== index && <hr />}
              </Fragment>
            );
          })}
        </div>
      )}
    </StatChartCard>
  );

  return (
    <Card className={cn("border-gray-200 bg-white", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            New Product Launches
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <EyeIcon className="mr-1 h-4 w-4" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading && (
          <div className="py-8 text-center text-sm text-gray-500">
            Loading products...
          </div>
        )}
        {isError && (
          <div className="py-8 text-center text-sm text-red-500">
            Error loading products
          </div>
        )}
        {!isLoading && !isError && newProducts.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            No new products
          </div>
        )}
        {!isLoading && !isError && newProducts.length > 0 && (
          <div className="space-y-4">
            {newProducts.slice(0, 5).map((product) => {
              const imageSrc = getImageSrc(product.thumbnail);
              return (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={product.productName}
                        className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-gray-200">
                        <SparklesIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.productName}
                    </p>
                    <p className="text-xs text-gray-500">{product.brandName}</p>
                    <div className="mt-1 flex items-center gap-2">
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
                    <Badge
                      variant="default"
                      className="bg-green-100 px-2 py-1 text-xs text-green-800 hover:bg-green-100"
                    >
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
