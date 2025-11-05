import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/core/components/ui/structure";
import { SegmentedControl } from "@/core/components/ui/segmented-control";
import { apiGetAnalyticsOverview } from "../ecommerce/services";

// Summary/KPI Components
import {
  TotalSalesCard,
  TotalOrdersCard,
  PendingOrdersCard,
  AverageOrderValueCard,
  ActiveCustomersCard,
  NewCustomersCard,
  BrandPartnersLiveCard,
  ConversionRateCard,
  AverageProductRatingCard,
} from "./components/summary-kpi";

// Sales & Product Insights Components
import {
  TopSellingProductsCard,
  TrendingCategoriesCard,
  LowInventoryAlertsCard,
  NewProductLaunchesCard,
  AbandonedDraftOrdersCard,
  BrandPerformanceSummaryCard,
} from "./components/sales-product";

// Customer & Community Components
import {
  CustomerSegmentsOverviewCard,
  CustomerRetentionRateCard,
  RecentReviewsCard,
  TopRoutinesSharedCard,
  // CustomerQueriesCard,
  // CommunityActivityCard
} from "./components/customer-community";

// Marketing & Engagement Components
import {
  ActiveCampaignsCard,
  CouponUsageRateCard,
  OngoingPromotionsCard,
  SurveyResponsesCard,
  RewardRedemptionsCard,
  TopRewardEarnersCard,
} from "./components/marketing-engagement";

// Analytics & Insights Components
import {
  SalesTrendGraphCard,
  IngredientTrendsCard,
  MarketTrendsOverviewCard,
  BrandReportSnapshotCard,
  CustomerInsightHighlightsCard,
} from "./components/analytics-insights";

// System & Operations Components
import {
  PendingBrandOnboardingsCard,
  ApiIntegrationStatusCard,
  RecentNotificationsCard,
  SystemHealthCheckCard,
  AdminActivitySummaryCard,
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
  const [activeTab, setActiveTab] = useState("summary-kpi");

  const tabOptions = [
    { value: "summary-kpi", label: "Summary/KPI" },
    { value: "sales-insights", label: "Sales and Insights" },
    { value: "customer-community", label: "Customer and Community" },
    { value: "marketing-engagement", label: "Marketing and Engagement" },
    { value: "analytics-insights", label: "Analytics and Insights" },
    { value: "systems-operations", label: "Systems and Operations" },
  ];

  // Calculate date range (defaults to last 30 days)
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, []);

  // Fetch analytics overview data
  const {
    data: analyticsData,
    isLoading,
    isError,
  } = useQuery({
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
      {/* Tabs Navigation */}
      <div className="mb-6 flex justify-center">
        <SegmentedControl
          value={activeTab}
          onValueChange={setActiveTab}
          options={tabOptions}
        />
      </div>

      {/* Summary / KPI Section */}
      {activeTab === "summary-kpi" && (
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Summary / KPI
          </h2>
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <TotalSalesCard data={analyticsData} />
              <TotalOrdersCard data={analyticsData} />
              <PendingOrdersCard data={analyticsData} />
              <AverageOrderValueCard data={analyticsData} />
              <ActiveCustomersCard data={analyticsData} />
              <NewCustomersCard data={analyticsData} />
              <BrandPartnersLiveCard data={analyticsData} />
              <ConversionRateCard data={analyticsData} />
              <AverageProductRatingCard data={analyticsData} />
            </div>
          )}
          {!isLoading && !isError && !analyticsData && (
            <div className="py-8 text-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      )}

      {/* Sales & Product Insights Section */}
      {activeTab === "sales-insights" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Row 1: Top Selling Products, Trending Categories, Abandoned Draft Orders */}
          <TopSellingProductsCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <TrendingCategoriesCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <AbandonedDraftOrdersCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />

          {/* Row 2: Low Inventory Alerts, New Product Launches, Brand Performance Summary */}
          <LowInventoryAlertsCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <NewProductLaunchesCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
          <BrandPerformanceSummaryCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
      )}

      {/* Customer & Community Section */}
      {activeTab === "customer-community" && (
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Customer & Community
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
        </div>
      )}

      {/* Marketing & Engagement Section */}
      {activeTab === "marketing-engagement" && (
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Marketing & Engagement
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ActiveCampaignsCard
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
            />
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
            <TopRewardEarnersCard
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
            />
          </div>
        </div>
      )}

      {/* Analytics & Insights Section */}
      {activeTab === "analytics-insights" && (
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Analytics & Insights
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
        </div>
      )}

      {/* System & Operations Section */}
      {activeTab === "systems-operations" && (
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            System & Operations
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PendingBrandOnboardingsCard />
            <ApiIntegrationStatusCard />
            <RecentNotificationsCard />
            <SystemHealthCheckCard />
            <AdminActivitySummaryCard />
          </div>
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
