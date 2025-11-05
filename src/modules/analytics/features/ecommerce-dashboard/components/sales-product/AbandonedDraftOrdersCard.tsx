import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";
import { apiGetAbandonedDraftOrders } from "../../../ecommerce/services";

interface AbandonedDraftOrdersCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  brandId?: string;
}

export const AbandonedDraftOrdersCard: React.FC<AbandonedDraftOrdersCardProps> = ({ 
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

  const { data: abandonedData, isLoading, isError } = useQuery({
    queryKey: ["abandoned-draft-orders", startDate || defaultStartDate, endDate || defaultEndDate, brandId],
    queryFn: async () => {
      const response = await apiGetAbandonedDraftOrders({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
        brandId,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  return (
    <div
      className={cn(
        "bg-background flex items-center gap-4 rounded-md p-4 shadow-md md:px-4 md:py-6",
        className,
      )}
    >
      <div className="h-full w-2 rounded-md bg-chart-1"></div>
      <div className="w-full flex-col">
        <p>Abandoned Draft Orders</p>
        {isLoading && <h4 className="font-bold">Loading...</h4>}
        {isError && <h4 className="font-bold text-red-500">Error</h4>}
        {!isLoading && !isError && abandonedData && (
          <>
            <h4 className="font-bold">{abandonedData.abandonedOrdersCount}</h4>
            <div className="mt-1 space-y-0.5">
              <p className="text-xs text-gray-500">
                Total: ₹{abandonedData.totalAbandonedValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Avg: ₹{abandonedData.averageAbandonedValue.toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>
      <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center flex-shrink-0">
        <ChartBarIcon className="h-6 w-6 text-[var(--chart-1)]" />
      </div>
    </div>
  );
};
