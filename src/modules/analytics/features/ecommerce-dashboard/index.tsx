import React, { useState } from "react";
import { PageContent } from "@/core/components/ui/structure";
import { SegmentedControl } from "@/core/components/ui/segmented-control";

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
  CustomerQueriesCard,
  CommunityActivityCard
} from "./components/customer-community";

// Marketing & Engagement Components
import { 
  ActiveCampaignsCard,
  CouponUsageRateCard,
  OngoingPromotionsCard,
  SurveyResponsesCard,
  RewardRedemptionsCard,
  TopRewardEarnersCard
} from "./components/marketing-engagement";

// Analytics & Insights Components
import { 
  SalesTrendGraphCard,
  IngredientTrendsCard,
  MarketTrendsOverviewCard,
  BrandReportSnapshotCard,
  CustomerInsightHighlightsCard
} from "./components/analytics-insights";

// System & Operations Components
import { 
  PendingBrandOnboardingsCard,
  ApiIntegrationStatusCard,
  RecentNotificationsCard,
  SystemHealthCheckCard,
  AdminActivitySummaryCard
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
    { value: "analytics-insights", label: "Analytics and Insights" },
    { value: "systems-operations", label: "Systems and Operations" },
  ];

  return (
    <PageContent
      header={{
        title: "E-commerce Analytics Dashboard",
        description: "Comprehensive overview of your e-commerce performance, customer insights, and business metrics.",
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
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Summary / KPI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <TotalSalesCard />
            <TotalOrdersCard />
            <PendingOrdersCard />
            <AverageOrderValueCard />
            <ActiveCustomersCard />
            <NewCustomersCard />
            <BrandPartnersLiveCard />
            <ConversionRateCard />
            <AverageProductRatingCard />
          </div>
        </div>
      )}

      {/* Sales & Product Insights Section */}
      {activeTab === "sales-insights" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Top Selling Products - List Tile */}
            <TopSellingProductsCard />
            
            {/* 2. Trending Categories - Graph Tile */}
            <TrendingCategoriesCard />
            
            {/* 3. Low Inventory Alerts - Alert Tile */}
            <LowInventoryAlertsCard />
            
            {/* 4. New Product Launches - List Tile */}
            <NewProductLaunchesCard />
            
            {/* 5. Abandoned Draft Orders - Number Tile */}
            <AbandonedDraftOrdersCard />
            
            {/* 6. Brand Performance Summary - Graph Tile */}
            <BrandPerformanceSummaryCard />
          </div>
        </div>
      )}

      {/* Customer & Community Section */}
      {activeTab === "customer-community" && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Customer & Community</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomerSegmentsOverviewCard />
            <CustomerRetentionRateCard />
            <RecentReviewsCard />
            <TopRoutinesSharedCard />
            <CustomerQueriesCard />
            <CommunityActivityCard />
          </div>
        </div>
      )}

      {/* Analytics & Insights Section */}
      {activeTab === "analytics-insights" && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Analytics & Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesTrendGraphCard />
            <IngredientTrendsCard />
            <MarketTrendsOverviewCard />
            <BrandReportSnapshotCard />
            <CustomerInsightHighlightsCard />
          </div>
        </div>
      )}

      {/* System & Operations Section */}
      {activeTab === "systems-operations" && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">System & Operations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
