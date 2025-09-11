import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FullLoader } from "../../../../core/components/ui/loader";
import { PageContent } from "../../../../core/components/ui/structure";
import { DatePicker } from "../../../../core/components/ui/date-picker";
import { CalendarDateRangeIcon } from "@heroicons/react/24/outline";
import Overview from "./components/Overview";
import TopProduct from "./components/TopProduct";
import TopBrand from "./components/TopBrand";
import TopSeller from "./components/TopSeller";
import { fetchAllAnalytics } from "./services";
import type { AnalyticsParams } from "./types";

const EcommerceDashboard: React.FC = () => {
  // Date range state for analytics filtering
  const [selectedRange, setSelectedRange] = useState<
    [Date | null, Date | null]
  >(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    return [startDate, endDate];
  });

  const shouldFetch = selectedRange[0] !== null && selectedRange[1] !== null;

  const params: AnalyticsParams | undefined = shouldFetch
    ? {
        startDate: selectedRange[0]!.toISOString().split("T")[0],
        endDate: selectedRange[1]!.toISOString().split("T")[0],
      }
    : undefined;

  const { data, error, isLoading } = useQuery({
    queryKey: ["analytics/ecommerce", params],
    queryFn: () => fetchAllAnalytics(params!),
    enabled: !!params,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const hasAnyData = !!(
    data &&
    (data.salesAnalytics ||
      data.topBrands ||
      data.topProducts ||
      data.topSellers)
  );

  if (error) {
    console.error("Analytics error:", error);
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">
            Failed to load analytics
          </p>
          <p className="text-muted-foreground mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  if (isLoading && !hasAnyData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <FullLoader />
      </div>
    );
  }

  return (
    <PageContent
      header={{
        title: "Ecommerce Analytics",
        description: "Track your sales performance and key metrics",
        actions: (
          <div className="flex gap-4">
            <DatePicker
              className="max-w-69"
              startIcon={<CalendarDateRangeIcon />}
              mode="range"
              value={{
                from: selectedRange[0] || undefined,
                to: selectedRange[1] || undefined,
              }}
              onChange={(range) => {
                if (range) {
                  setSelectedRange([range.from || null, range.to || null]);
                }
              }}
            />
          </div>
        ),
      }}
    >
      <div className="space-y-8">
        {data && (
          <>
            <Overview data={data.salesAnalytics} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
              {data.topProducts && data.topProducts.length > 0 && (
                <div className="lg:col-span-1">
                  <TopProduct data={data.topProducts} />
                </div>
              )}

              {data.topBrands && data.topBrands.length > 0 && (
                <div className="lg:col-span-1">
                  <TopBrand data={data.topBrands} />
                </div>
              )}

              {data.topSellers && data.topSellers.length > 0 && (
                <div className="lg:col-span-1 xl:col-span-1">
                  <TopSeller data={data.topSellers} />
                </div>
              )}
            </div>
          </>
        )}

        {!data && !isLoading && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                No analytics data available
              </p>
              <p className="text-muted-foreground mt-2">
                Select a date range to view analytics
              </p>
            </div>
          </div>
        )}
      </div>
    </PageContent>
  );
};

export default EcommerceDashboard;
