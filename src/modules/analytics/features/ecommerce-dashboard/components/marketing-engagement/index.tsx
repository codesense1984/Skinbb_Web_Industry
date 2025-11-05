import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatChartCard } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { 
  MegaphoneIcon,
  TicketIcon,
  GiftIcon,
  DocumentTextIcon,
  SparklesIcon,
  TrophyIcon,
  EyeIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";
import { type ChartConfig } from "@/core/components/ui/chart";
import LineChart from "@/core/components/charts/LineChart";
import BarChart from "@/core/components/charts/BarChart";
import { apiGetAnalyticsOverview } from "../../../ecommerce/services";

// Active Campaigns Card (Status Tile)
interface ActiveCampaignsCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
}

export const ActiveCampaignsCard: React.FC<ActiveCampaignsCardProps> = ({ 
  className,
  startDate,
  endDate,
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

  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ["analytics-overview", startDate || defaultStartDate, endDate || defaultEndDate],
    queryFn: async () => {
      const response = await apiGetAnalyticsOverview({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const activeCampaigns = analyticsData?.marketingEngagement?.activeCampaigns || { count: 0, campaigns: [] };
  const campaigns = activeCampaigns.campaigns || [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "paused":
        return "bg-yellow-100 text-yellow-700";
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MegaphoneIcon className="h-5 w-5" />
            Active Campaigns
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700">
              {activeCampaigns.count} Active
            </Badge>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <EyeIcon className="h-4 w-4 mr-1" />
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {isLoading && (
          <div className="text-center py-4 text-gray-500 text-sm">Loading campaigns...</div>
        )}
        {isError && (
          <div className="text-center py-4 text-red-500 text-sm">Error loading campaigns</div>
        )}
        {!isLoading && !isError && campaigns.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">No active campaigns</div>
        )}
        {campaigns.slice(0, 4).map((campaign) => (
          <div
            key={campaign._id}
            className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {campaign.name || "Unnamed Campaign"}
                </p>
                {campaign.type && (
                  <p className="text-xs text-gray-500 capitalize mt-1">{campaign.type}</p>
                )}
              </div>
              <Badge className={cn("text-xs", getStatusColor(campaign.status || "active"))}>
                {campaign.status || "active"}
              </Badge>
            </div>
            {(campaign.startDate || campaign.endDate) && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <ClockIcon className="h-3 w-3" />
                {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Coupon Usage Rate Card (Graph Tile)
interface CouponUsageRateCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
}

export const CouponUsageRateCard: React.FC<CouponUsageRateCardProps> = ({ 
  className,
  startDate,
  endDate,
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

  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ["analytics-overview", startDate || defaultStartDate, endDate || defaultEndDate],
    queryFn: async () => {
      const response = await apiGetAnalyticsOverview({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const couponUsageStats = analyticsData?.marketingEngagement?.couponUsageStats;
  const couponUsageRate = analyticsData?.marketingEngagement?.couponUsageRate || 0;
  const topUsedCoupons = couponUsageStats?.topUsedCoupons || [];

  // Create chart data from top used coupons
  const couponChartData = topUsedCoupons.map((coupon) => ({
    key: coupon.couponCode.length > 12 ? coupon.couponCode.substring(0, 12) + "..." : coupon.couponCode,
    value: coupon.usageCount,
    fullCode: coupon.couponCode,
    title: coupon.couponTitle,
    discountValue: coupon.discountValue,
  }));

  const couponChartConfig = {
    value: {
      label: "Usage Count",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <StatChartCard 
      name="Coupon Usage Rate" 
      className={className}
      actions={
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
          <EyeIcon className="h-4 w-4 mr-1" />
          View Details
        </Button>
      }
    >
      {isLoading && (
        <div className="text-center py-8 text-gray-500 text-sm">Loading coupon data...</div>
      )}
      {isError && (
        <div className="text-center py-8 text-red-500 text-sm">Error loading coupon data</div>
      )}
      {!isLoading && !isError && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usage Rate</p>
              <p className="text-3xl font-bold text-gray-900">{couponUsageRate}%</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TicketIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          {topUsedCoupons.length > 0 ? (
            <>
              <BarChart
                config={couponChartConfig}
                data={couponChartData}
                layout="horizontal"
                barSize={20}
                showTooltip={true}
                showGrid={true}
                yAxisProps={{
                  width: 100,
                }}
                className="h-48"
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-600">Total Coupons</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {couponUsageStats?.totalCoupons || 0}
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-600">Used Coupons</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {couponUsageStats?.usedCoupons || 0}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">No coupon usage data available</p>
            </div>
          )}
        </div>
      )}
    </StatChartCard>
  );
};

// Ongoing Promotions Card (List Tile)
interface OngoingPromotionsCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
}

export const OngoingPromotionsCard: React.FC<OngoingPromotionsCardProps> = ({ 
  className,
  startDate,
  endDate,
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

  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ["analytics-overview", startDate || defaultStartDate, endDate || defaultEndDate],
    queryFn: async () => {
      const response = await apiGetAnalyticsOverview({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const promotions = analyticsData?.marketingEngagement?.ongoingPromotions || {
    ongoing: 0,
    scheduled: 0,
    expired: 0,
    total: 0,
  };

  const promotionItems = [
    { label: "Ongoing", count: promotions.ongoing, color: "bg-green-100 text-green-700" },
    { label: "Scheduled", count: promotions.scheduled, color: "bg-blue-100 text-blue-700" },
    { label: "Expired", count: promotions.expired, color: "bg-gray-100 text-gray-700" },
  ].filter(item => item.count > 0);

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Ongoing Promotions
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {isLoading && (
          <div className="text-center py-4 text-gray-500 text-sm">Loading promotions...</div>
        )}
        {isError && (
          <div className="text-center py-4 text-red-500 text-sm">Error loading promotions</div>
        )}
        {!isLoading && !isError && promotions.total === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">No promotions found</div>
        )}
        {!isLoading && !isError && promotions.total > 0 && (
          <>
            {promotionItems.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {item.label} Promotions
                    </p>
                  </div>
                  <Badge className={cn("text-xs", item.color)}>
                    {item.count}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Total Promotions</p>
                <p className="text-lg font-bold text-gray-900">{promotions.total}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Survey Responses Card (Number Tile)
interface SurveyResponsesCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
}

export const SurveyResponsesCard: React.FC<SurveyResponsesCardProps> = ({ 
  className,
  startDate,
  endDate,
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

  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ["analytics-overview", startDate || defaultStartDate, endDate || defaultEndDate],
    queryFn: async () => {
      const response = await apiGetAnalyticsOverview({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const surveyData = analyticsData?.marketingEngagement?.surveyResponses || {
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    completionRate: 0,
  };

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Survey Responses</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {surveyData.totalResponses.toLocaleString()}
            </h3>
          </div>
          <div className="bg-[var(--chart-1)]/20 rounded-full p-3 flex items-center justify-center">
            <DocumentTextIcon className="h-6 w-6 text-[var(--chart-1)]" />
          </div>
        </div>
        {isLoading && (
          <div className="text-center py-4 text-gray-500 text-xs">Loading...</div>
        )}
        {isError && (
          <div className="text-center py-4 text-red-500 text-xs">Error loading data</div>
        )}
        {!isLoading && !isError && (
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Total Surveys</span>
              <span className="font-semibold text-gray-900">{surveyData.totalSurveys}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Active Surveys</span>
              <span className="font-semibold text-gray-900">{surveyData.activeSurveys}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-semibold text-gray-900">{surveyData.completionRate}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Reward Redemptions Card (Number Tile)
interface RewardRedemptionsCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
}

export const RewardRedemptionsCard: React.FC<RewardRedemptionsCardProps> = ({ 
  className,
  startDate,
  endDate,
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

  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ["analytics-overview", startDate || defaultStartDate, endDate || defaultEndDate],
    queryFn: async () => {
      const response = await apiGetAnalyticsOverview({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const redemptionData = analyticsData?.marketingEngagement?.rewardRedemptions || {
    totalRedeemed: 0,
    redemptionCount: 0,
    uniqueUsers: 0,
    period: "this_week",
  };

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Reward Redemptions</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {redemptionData.redemptionCount.toLocaleString()}
            </h3>
          </div>
          <div className="bg-[var(--chart-2)]/20 rounded-full p-3 flex items-center justify-center">
            <GiftIcon className="h-6 w-6 text-[var(--chart-2)]" />
          </div>
        </div>
        {isLoading && (
          <div className="text-center py-4 text-gray-500 text-xs">Loading...</div>
        )}
        {isError && (
          <div className="text-center py-4 text-red-500 text-xs">Error loading data</div>
        )}
        {!isLoading && !isError && (
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Total Redeemed</span>
              <span className="font-semibold text-gray-900">
                {redemptionData.totalRedeemed.toLocaleString()} pts
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Unique Users</span>
              <span className="font-semibold text-gray-900">{redemptionData.uniqueUsers}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Period</span>
              <span className="font-semibold text-gray-900 capitalize">
                {redemptionData.period.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Top Reward Earners Card (List Tile)
interface TopRewardEarnersCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
}

export const TopRewardEarnersCard: React.FC<TopRewardEarnersCardProps> = ({ 
  className,
  startDate,
  endDate,
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

  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ["analytics-overview", startDate || defaultStartDate, endDate || defaultEndDate],
    queryFn: async () => {
      const response = await apiGetAnalyticsOverview({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const earners = analyticsData?.marketingEngagement?.topRewardEarners || [];

  const getTierColor = (badges: number) => {
    if (badges >= 5) return "bg-purple-100 text-purple-700";
    if (badges >= 3) return "bg-yellow-100 text-yellow-700";
    if (badges >= 2) return "bg-gray-100 text-gray-700";
    return "bg-orange-100 text-orange-700";
  };

  const getTierLabel = (badges: number) => {
    if (badges >= 5) return "Platinum";
    if (badges >= 3) return "Gold";
    if (badges >= 2) return "Silver";
    return "Bronze";
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <div className="h-5 w-5 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white font-bold">2</div>;
      case 3:
        return <div className="h-5 w-5 rounded-full bg-orange-400 flex items-center justify-center text-xs text-white font-bold">3</div>;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 font-bold">{rank}</div>;
    }
  };

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            Top Reward Earners
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {isLoading && (
          <div className="text-center py-4 text-gray-500 text-sm">Loading earners...</div>
        )}
        {isError && (
          <div className="text-center py-4 text-red-500 text-sm">Error loading earners</div>
        )}
        {!isLoading && !isError && earners.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">No reward earners found</div>
        )}
        {earners.slice(0, 5).map((earner, index) => (
          <div
            key={earner.userId || index}
            className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getRankIcon(index + 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {earner.userName || "Anonymous"}
                  </p>
                  <Badge className={cn("text-xs", getTierColor(earner.badges))}>
                    {getTierLabel(earner.badges)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <SparklesIcon className="h-3 w-3 text-purple-500" />
                    <span className="text-xs font-semibold text-gray-900">
                      {earner.currentBalance.toLocaleString()} pts
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {earner.badges} badges
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>Lifetime: {earner.lifetimeEarned.toLocaleString()} pts</span>
                  {earner.lifetimeRedeemed > 0 && (
                    <>
                      <span>•</span>
                      <span>Redeemed: {earner.lifetimeRedeemed.toLocaleString()} pts</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
