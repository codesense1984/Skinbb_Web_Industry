import React from "react";
import { PageContent } from "@/core/components/ui/structure";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";

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

// Quick Actions Components
import { CreateNewProductCard } from "./components/quick-actions/CreateNewProductCard";
import { CreateNewOrderCard } from "./components/quick-actions/CreateNewOrderCard";
import { AddDiscountCouponCard } from "./components/quick-actions/AddDiscountCouponCard";
import { 
  AddBrandPartnerCard,
  LaunchCampaignCard,
  ViewFullAnalyticsReportCard,
  RespondToRecentReviewChatCard
} from "./components/quick-actions";

const EcommerceAnalyticsDashboard: React.FC = () => {
  return (
    <PageContent
      header={{
        title: "E-commerce Analytics Dashboard",
        description: "Comprehensive overview of your e-commerce performance, customer insights, and business metrics.",
      }}
    >
      {/* Summary / KPI Section */}
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

      {/* Sales & Product Insights Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Sales & Product Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopSellingProductsCard />
          <TrendingCategoriesCard />
          <LowInventoryAlertsCard />
          <NewProductLaunchesCard />
          <AbandonedDraftOrdersCard />
          <BrandPerformanceSummaryCard />
        </div>
      </div>

      {/* Customer & Community Section */}
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

      {/* Marketing & Engagement Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Marketing & Engagement</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveCampaignsCard />
          <CouponUsageRateCard />
          <OngoingPromotionsCard />
          <SurveyResponsesCard />
          <RewardRedemptionsCard />
          <TopRewardEarnersCard />
        </div>
      </div>

      {/* Analytics & Insights Section */}
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

      {/* System & Operations Section */}
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

      {/* Quick Actions Section */}
      <div className="mb-8">
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
      </div>
    </PageContent>
  );
};

export default EcommerceAnalyticsDashboard;
