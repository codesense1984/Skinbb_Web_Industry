import { StatChartCard } from "@/core/components/ui/card";
import { cn, formatNumber } from "@/core/utils";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import React, { Fragment } from "react";
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
      limit,
    ],
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
        return (
          <div
            className={cn(
              iconSize,
              "flex items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white",
            )}
          >
            2
          </div>
        );
      case 3:
        return (
          <div
            className={cn(
              iconSize,
              "flex items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white",
            )}
          >
            3
          </div>
        );
      default:
        return (
          <div
            className={cn(
              iconSize,
              "flex items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-gray-600",
            )}
          >
            {rank}
          </div>
        );
    }
  };

  return (
    <StatChartCard name="Top Selling Products" className={className}>
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
      {!isLoading && !isError && products.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          No products found
        </div>
      )}
      <div className="space-y-2">
        {[...products].slice(0, limit).map((product, index) => (
          <Fragment key={product._id}>
            <div key={product._id} className="flex items-center gap-3">
              <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{product.productName}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm">
                    ₹{formatNumber(product.totalRevenue)}
                  </p>
                  <p className="text-sm">Qty: {product.totalQuantity}</p>
                </div>
              </div>
            </div>
            {[...products].length - 1 !== index && <hr />}
          </Fragment>
        ))}
      </div>
    </StatChartCard>
  );

  // return (
  //   <Card className={cn("border-gray-200 bg-white", className)}>
  //     <CardHeader className="">
  //       <CardTitle className="text-lg">Top Selling Products</CardTitle>
  //     </CardHeader>
  //     <hr />
  //     <CardContent className="space-y-2 px-0 pt-0">
  //       {isLoading && (
  //         <div className="py-4 text-center text-sm text-gray-500">
  //           Loading products...
  //         </div>
  //       )}
  //       {isError && (
  //         <div className="py-4 text-center text-sm text-red-500">
  //           Error loading products
  //         </div>
  //       )}
  //       {!isLoading && !isError && products.length === 0 && (
  //         <div className="py-4 text-center text-sm text-gray-500">
  //           No products found
  //         </div>
  //       )}
  //       {[...products].slice(0, limit).map((product, index) => (
  //         <Fragment key={product._id}>
  //           <div
  //             key={product._id}
  //             className="flex items-center gap-3 px-6 transition-colors hover:bg-gray-50"
  //           >
  //             <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>
  //             <div className="min-w-0 flex-1">
  //               <p className="truncate">{product.productName}</p>
  //               <div className="mt-1 flex items-center gap-2">
  //                 <p className="text-sm">
  //                   ₹{formatNumber(product.totalRevenue)}
  //                 </p>
  //                 <p className="text-sm">Qty: {product.totalQuantity}</p>
  //               </div>
  //             </div>
  //           </div>
  //           {products.length - 1 !== index && <hr />}
  //         </Fragment>
  //       ))}
  //     </CardContent>
  //   </Card>
  // );
};
