import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { 
  ExclamationTriangleIcon,
  EyeIcon,
  ShoppingCartIcon
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

  const alerts = salesInsights?.lowInventoryAlerts || [];
  
  // Determine urgency based on stock quantity
  const getUrgency = (stockQuantity: number) => {
    if (stockQuantity === 0) return 'out';
    if (stockQuantity <= 2) return 'critical';
    return 'low';
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 text-xs px-2 py-1">
            Critical
          </Badge>
        );
      case 'out':
        return (
          <Badge variant="destructive" className="bg-red-200 text-red-900 hover:bg-red-200 text-xs px-2 py-1">
            Out of Stock
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs px-2 py-1">
            Low Stock
          </Badge>
        );
      default:
        return null;
    }
  };

  const criticalCount = alerts.filter(a => {
    const urgency = getUrgency(a.stockQuantity);
    return urgency === 'critical' || urgency === 'out';
  }).length;

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Low Inventory Alerts
            </CardTitle>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 text-xs px-2 py-1">
                {criticalCount} Critical
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading && (
          <div className="text-center py-8 text-gray-500 text-sm">Loading alerts...</div>
        )}
        {isError && (
          <div className="text-center py-8 text-red-500 text-sm">Error loading alerts</div>
        )}
        {!isLoading && !isError && alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">No low inventory alerts</div>
        )}
        {!isLoading && !isError && alerts.length > 0 && (
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert, index) => {
              const urgency = getUrgency(alert.stockQuantity);
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center border border-gray-300">
                      <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {alert.productName}
                    </p>
                    {alert.sku && (
                      <p className="text-xs text-gray-500">
                        SKU: {alert.sku}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">
                        Stock: {alert.stockQuantity}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    {getUrgencyBadge(urgency)}
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
