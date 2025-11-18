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
  ExclamationTriangleIcon,
  EyeIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";
import { apiGetSalesInsights, getImageUrl } from "../../../ecommerce/services";

interface LowInventoryAlertsCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  brandId?: string;
}

export const LowInventoryAlertsCard: React.FC<LowInventoryAlertsCardProps> = ({
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

  const alerts = salesInsights?.lowInventoryAlerts || [];

  // Determine urgency based on stock quantity
  const getUrgency = (stockQuantity: number) => {
    if (stockQuantity === 0) return "out";
    if (stockQuantity <= 2) return "critical";
    return "low";
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 px-2 py-1 text-xs text-red-800 hover:bg-red-100"
          >
            Critical
          </Badge>
        );
      case "out":
        return (
          <Badge
            variant="destructive"
            className="bg-red-200 px-2 py-1 text-xs text-red-900 hover:bg-red-200"
          >
            Out of Stock
          </Badge>
        );
      case "low":
        return (
          <Badge
            variant="default"
            className="bg-yellow-100 px-2 py-1 text-xs text-yellow-800 hover:bg-yellow-100"
          >
            Low Stock
          </Badge>
        );
      default:
        return null;
    }
  };

  const criticalCount = alerts.filter((a) => {
    const urgency = getUrgency(a.stockQuantity);
    return urgency === "critical" || urgency === "out";
  }).length;

  return (
    <StatChartCard name="Low Inventory Alerts">
      {isLoading && (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading alerts...
        </div>
      )}
      {isError && (
        <div className="py-8 text-center text-sm text-red-500">
          Error loading alerts
        </div>
      )}
      {!isLoading && !isError && alerts.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          No low inventory alerts
        </div>
      )}
      {!isLoading && !isError && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 5).map((alert, index) => {
            const urgency = getUrgency(alert.stockQuantity);
            return (
              <Fragment key={alert.productName + index}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-gray-200">
                      <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {alert.productName}
                    </p>
                    {alert.sku && (
                      <p className="text-xs text-gray-500">SKU: {alert.sku}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-600">
                        Stock: {alert.stockQuantity}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    {getUrgencyBadge(urgency)}
                  </div>
                </div>
                {alerts.slice(0, 5).length - 1 !== index && <hr />}
              </Fragment>
            );
          })}
        </div>
      )}
    </StatChartCard>
  );

  // return (
  //   <Card className={cn("border-gray-200 bg-white", className)}>
  //     <CardHeader className="pb-3">
  //       <div className="flex items-center justify-between">
  //         <div className="flex items-center gap-2">
  //           <CardTitle className="text-lg font-semibold text-gray-900">
  //             Low Inventory Alerts
  //           </CardTitle>
  //           {criticalCount > 0 && (
  //             <Badge
  //               variant="destructive"
  //               className="bg-red-100 px-2 py-1 text-xs text-red-800 hover:bg-red-100"
  //             >
  //               {criticalCount} Critical
  //             </Badge>
  //           )}
  //         </div>
  //         <Button
  //           variant="ghost"
  //           size="sm"
  //           className="text-blue-600 hover:text-blue-700"
  //         >
  //           <EyeIcon className="mr-1 h-4 w-4" />
  //           View All
  //         </Button>
  //       </div>
  //     </CardHeader>
  //     <CardContent className="pt-0">
  //       {isLoading && (
  //         <div className="py-8 text-center text-sm text-gray-500">
  //           Loading alerts...
  //         </div>
  //       )}
  //       {isError && (
  //         <div className="py-8 text-center text-sm text-red-500">
  //           Error loading alerts
  //         </div>
  //       )}
  //       {!isLoading && !isError && alerts.length === 0 && (
  //         <div className="py-8 text-center text-sm text-gray-500">
  //           No low inventory alerts
  //         </div>
  //       )}
  //       {!isLoading && !isError && alerts.length > 0 && (
  //         <div className="space-y-4">
  //           {alerts.slice(0, 5).map((alert, index) => {
  //             const urgency = getUrgency(alert.stockQuantity);
  //             return (
  //               <div
  //                 key={index}
  //                 className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
  //               >
  //                 <div className="flex-shrink-0">
  //                   <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-gray-200">
  //                     <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
  //                   </div>
  //                 </div>
  //                 <div className="min-w-0 flex-1">
  //                   <p className="truncate text-sm font-medium text-gray-900">
  //                     {alert.productName}
  //                   </p>
  //                   {alert.sku && (
  //                     <p className="text-xs text-gray-500">SKU: {alert.sku}</p>
  //                   )}
  //                   <div className="mt-1 flex items-center gap-2">
  //                     <span className="text-xs text-gray-600">
  //                       Stock: {alert.stockQuantity}
  //                     </span>
  //                   </div>
  //                 </div>
  //                 <div className="flex flex-shrink-0 flex-col items-end gap-2">
  //                   {getUrgencyBadge(urgency)}
  //                 </div>
  //               </div>
  //             );
  //           })}
  //         </div>
  //       )}
  //     </CardContent>
  //   </Card>
  // );
};
