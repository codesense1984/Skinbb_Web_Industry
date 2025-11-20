import { PageContent } from "@/core/components/ui/structure";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { apiGetAnalyticsOverview } from "../ecommerce/services";

// Summary/KPI Components
import {
  ActiveCustomersCard,
  AverageOrderValueCard,
  AverageProductRatingCard,
  BrandPartnersLiveCard,
  ConversionRateCard,
  NewCustomersCard,
  PendingOrdersCard,
  TotalOrdersCard,
  TotalSalesCard,
} from "./components/summary-kpi";

// Sales & Product Insights Components
import {
  AbandonedDraftOrdersCard,
  BrandPerformanceSummaryCard,
  LowInventoryAlertsCard,
  NewProductLaunchesCard,
  TopSellingProductsCard,
  TrendingCategoriesCard,
} from "./components/sales-product";

// Customer & Community Components
import {
  CustomerRetentionRateCard,
  CustomerSegmentsOverviewCard,
  RecentReviewsCard,
  TopRoutinesSharedCard,
} from "./components/customer-community";

// Marketing & Engagement Components
import {
  ActiveCampaignsCard,
  CouponUsageRateCard,
  OngoingPromotionsCard,
  RewardRedemptionsCard,
  SurveyResponsesCard,
  TopRewardEarnersCard,
} from "./components/marketing-engagement";

// Analytics & Insights Components
import {
  BrandReportSnapshotCard,
  CustomerInsightHighlightsCard,
  IngredientTrendsCard,
  MarketTrendsOverviewCard,
  SalesTrendGraphCard,
} from "./components/analytics-insights";

// System & Operations Components
import { DatePicker } from "@/core/components/ui/date-picker";
import { Select } from "@/core/components/ui/select";
import {
  AdminActivitySummaryCard,
  ApiIntegrationStatusCard,
  PendingBrandOnboardingsCard,
  RecentNotificationsCard,
  SystemHealthCheckCard,
} from "./components/system-operations";

// Quick Actions Components - Commented out for now
// import { CreateNewProductCard } from "./components/quick-actions/CreateNewProductCard";
// import { CreateNewOrderCard } from "./components/quick-actions/CreateNewOrderCard";
// import { AddDiscountCouponCard } from "./components/quick-actions/AddDiscountCouponCard";
// import {
//   AddBrandPartnerCard,
//   LaunchCampaignCard,
//   ViewFullAnalyticsReportCard,
//   RespondToRecentReviewChatCard
// } from "./components/quick-actions";

const EcommerceAnalyticsDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabOptions = [
    // { value: "summary-kpi", label: "Summary/KPI" },
    { value: "sales-insights", label: "Sales and Insights" },
    { value: "customer-community", label: "Customer and Community" },
    { value: "marketing-engagement", label: "Marketing and Engagement" },
    { value: "analytics-insights", label: "Analytics and Insights" },
    { value: "systems-operations", label: "Systems and Operations" },
  ];

  // Initialize date range state (defaults to last 30 days)
  const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  // Initialize state from URL params or defaults
  const getInitialTab = () => {
    const urlTab = searchParams.get("tab");
    return urlTab && tabOptions.some((opt) => opt.value === urlTab)
      ? urlTab
      : "sales-insights";
  };

  const getInitialDateRange = () => {
    const urlStartDate = searchParams.get("startDate");
    const urlEndDate = searchParams.get("endDate");
    const defaultRange = getDefaultDateRange();

    return {
      startDate: urlStartDate || defaultRange.startDate,
      endDate: urlEndDate || defaultRange.endDate,
    };
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [startDate, setStartDate] = useState<string>(
    () => getInitialDateRange().startDate,
  );
  const [endDate, setEndDate] = useState<string>(
    () => getInitialDateRange().endDate,
  );

  // Sync state changes to URL params
  useEffect(() => {
    const newParams = new URLSearchParams();

    // Update tab param (only store if not default)
    if (activeTab !== "summary-kpi") {
      newParams.set("tab", activeTab);
    }

    // Update date params (only store if not default)
    const defaultRange = getDefaultDateRange();
    if (startDate !== defaultRange.startDate) {
      newParams.set("startDate", startDate);
    }
    if (endDate !== defaultRange.endDate) {
      newParams.set("endDate", endDate);
    }

    // Update URL (replace to avoid adding history entries)
    setSearchParams(newParams, { replace: true });
  }, [activeTab, startDate, endDate, setSearchParams]);

  const activeTabLabel = useMemo(() => {
    return tabOptions?.find((option) => option?.value === activeTab)?.label;
  }, [activeTab]);

  // Calculate date range from state
  const dateRange = useMemo(() => {
    return {
      startDate,
      endDate,
    };
  }, [startDate, endDate]);

  // Fetch analytics overview data
  const { data: analyticsData } = useQuery({
    queryKey: ["analytics-overview", dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const response = await apiGetAnalyticsOverview({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  return (
    <PageContent
      header={{
        title: "E-commerce Analytics Dashboard",
        description:
          "Comprehensive overview of your e-commerce performance, customer insights, and business metrics.",
      }}
    >
      <div className="flex justify-end gap-2">
        <div className="flex flex-wrap items-center justify-start gap-0 md:gap-2">
          {/* <Label className="text-muted-foreground">Select a tab</Label> */}
          <Select
            options={tabOptions}
            onValueChange={setActiveTab}
            value={activeTab}
          />
        </div>
        <div className="flex flex-wrap items-center justify-start gap-0 md:gap-2">
          {/* <Label className="text-muted-foreground">Select a tab</Label> */}
          <DatePicker
            mode="range"
            value={
              startDate && endDate
                ? {
                    from: new Date(startDate),
                    to: new Date(endDate),
                  }
                : undefined
            }
            onChange={(dateRange) => {
              if (dateRange?.from && dateRange?.to) {
                setStartDate(dateRange.from.toISOString().split("T")[0]);
                setEndDate(dateRange.to.toISOString().split("T")[0]);
              }
            }}
            className="max-w-68"
          />
        </div>
      </div>
      {/* Tabs Navigation */}
      {/* <div className="mb-6 flex justify-center">
        <SegmentedControl
          value={activeTab}
          onValueChange={setActiveTab}
          options={tabOptions}
        />
      </div> */}
      <div className="mb-2 flex w-full items-center justify-center gap-2">
        <div className="border-border w-full border border-1 border-dashed"></div>
        <p className="font-bold whitespace-pre">{activeTabLabel}</p>
        <div className="border-border w-full border border-1 border-dashed"></div>
      </div>

      {/* Summary / KPI Section */}
      {/* {
        <div className="mb-4">
          {isLoading && (
            <div className="py-8 text-center text-gray-500">
              Loading analytics data...
            </div>
          )}
          {isError && (
            <div className="py-8 text-center text-red-500">
              Error loading analytics data. Please try again.
            </div>
          )}
          {analyticsData && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <TotalSalesCard data={analyticsData} />
              <TotalOrdersCard data={analyticsData} />
              <PendingOrdersCard data={analyticsData} />
              <AverageOrderValueCard data={analyticsData} />
              <ActiveCustomersCard data={analyticsData} />
              <NewCustomersCard data={analyticsData} />
              <BrandPartnersLiveCard data={analyticsData} />
            </div>
          )}
          {!isLoading && !isError && !analyticsData && (
            <div className="py-8 text-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      } */}

      {/* Sales & Product Insights Section */}
      {activeTab === "sales-insights" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Row 1: Top Selling Products, Trending Categories, Abandoned Draft Orders */}
          <div className="grid grid-cols-1 gap-4 md:col-span-3 lg:grid-cols-3">
            <TotalSalesCard data={analyticsData} />
            <TotalOrdersCard data={analyticsData} />
            <PendingOrdersCard data={analyticsData} />
            <AverageOrderValueCard data={analyticsData} />
            <ConversionRateCard data={analyticsData} />
            <AverageProductRatingCard data={analyticsData} />
            <AbandonedDraftOrdersCard
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
            />
          </div>
          <TopSellingProductsCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <LowInventoryAlertsCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <NewProductLaunchesCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <TrendingCategoriesCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />

          {/* Row 2: Low Inventory Alerts, New Product Launches, Brand Performance Summary */}
          <BrandPerformanceSummaryCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            className="md:col-span-2"
          />
        </div>
      )}

      {/* Customer & Community Section */}
      {activeTab === "customer-community" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ActiveCustomersCard data={analyticsData} />
              <NewCustomersCard data={analyticsData} />
              <BrandPartnersLiveCard data={analyticsData} />
            </div>
          </div>
          <CustomerSegmentsOverviewCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <CustomerRetentionRateCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <RecentReviewsCard />
          <TopRoutinesSharedCard />
          {/* <CustomerQueriesCard /> */}
          {/* <CommunityActivityCard /> */}
        </div>
      )}

      {/* Marketing & Engagement Section */}
      {activeTab === "marketing-engagement" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CouponUsageRateCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <OngoingPromotionsCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <SurveyResponsesCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <RewardRedemptionsCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <ActiveCampaignsCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <TopRewardEarnersCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
      )}

      {/* Analytics & Insights Section */}
      {activeTab === "analytics-insights" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
          <SalesTrendGraphCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <IngredientTrendsCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <MarketTrendsOverviewCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <BrandReportSnapshotCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <CustomerInsightHighlightsCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
      )}

      {/* System & Operations Section */}
      {activeTab === "systems-operations" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PendingBrandOnboardingsCard />
          <ApiIntegrationStatusCard />
          <RecentNotificationsCard />
          <SystemHealthCheckCard />
          <AdminActivitySummaryCard />
        </div>
      )}

      {/* Quick Actions Section - Commented out action keys for now */}
      {/* <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CreateNewProductCard />
          <CreateNewOrderCard />
          <AddDiscountCouponCard />
          <AddBrandPartnerCard />
          <LaunchCampaignCard />
          <ViewFullAnalyticsReportCard />
          <RespondToRecentReviewChatCard />
        </div>
      </div> */}
    </PageContent>
  );
};

export default EcommerceAnalyticsDashboard;
