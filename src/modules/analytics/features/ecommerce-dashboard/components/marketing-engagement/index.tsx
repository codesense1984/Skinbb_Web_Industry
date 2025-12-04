import BarChart from "@/core/components/charts/BarChart";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatChartCard,
} from "@/core/components/ui/card";
import { type ChartConfig } from "@/core/components/ui/chart";
import { cn } from "@/core/utils";
import {
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  GiftIcon,
  MegaphoneIcon,
  SparklesIcon,
  TicketIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import React from "react";
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
    return new Date().toISOString().split("T")[0];
  }, []);

  const defaultStartDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }, []);

  const {
    data: analyticsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "analytics-overview",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
    ],
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

  const activeCampaigns = analyticsData?.marketingEngagement
    ?.activeCampaigns || { count: 0, campaigns: [] };
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
    <StatChartCard
      name={
        <div className="flex items-center gap-2">
          <MegaphoneIcon className="h-5 w-5" /> Active Campaigns/Promotions
        </div>
      }
      className={cn("md:max-h-auto", className)}
    >
      <div className="space-y-4">
        {isLoading && (
          <div className="text-muted-foreground py-4 text-center text-sm">
            Loading campaigns...
          </div>
        )}
        {isError && (
          <div className="py-4 text-center text-sm text-red-500">
            Error loading campaigns
          </div>
        )}
        {!isLoading && !isError && campaigns.length === 0 && (
          <div className="text-muted-foreground py-4 text-center text-sm">
            No active campaigns
          </div>
        )}
        {campaigns.slice(0, 4).map((campaign) => (
          <div
            key={campaign._id}
            className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{campaign.title || ""}</p>
                {campaign.subtitle && (
                  <p className="text-sm capitalize">{campaign.subtitle}</p>
                )}
              </div>
              {campaign.status && (
                <Badge
                  className={cn(
                    "text-xs capitalize",
                    getStatusColor(campaign.status || "active"),
                  )}
                >
                  {campaign.status || "active"}
                </Badge>
              )}
            </div>
            {(campaign.startAt || campaign.endAt) && (
              <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                <ClockIcon className="h-3 w-3" />
                {formatDate(campaign.startAt)} - {formatDate(campaign.endAt)}
              </div>
            )}
          </div>
        ))}
      </div>
    </StatChartCard>
  );

  return (
    <Card className={cn("border-gray-200 bg-white", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MegaphoneIcon className="h-5 w-5" />
            Active Campaigns
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700">
              {activeCampaigns.count} Active
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              <EyeIcon className="mr-1 h-4 w-4" />
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {isLoading && (
          <div className="text-muted-foreground py-4 text-center text-sm">
            Loading campaigns...
          </div>
        )}
        {isError && (
          <div className="py-4 text-center text-sm text-red-500">
            Error loading campaigns
          </div>
        )}
        {!isLoading && !isError && campaigns.length === 0 && (
          <div className="text-muted-foreground py-4 text-center text-sm">
            No active campaigns
          </div>
        )}
        {campaigns.slice(0, 4).map((campaign) => (
          <div
            key={campaign._id}
            className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {campaign.name || "Unnamed Campaign"}
                </p>
                {campaign.type && (
                  <p className="text-muted-foreground mt-1 text-xs capitalize">
                    {campaign.type}
                  </p>
                )}
              </div>
              <Badge
                className={cn(
                  "text-xs",
                  getStatusColor(campaign.status || "active"),
                )}
              >
                {campaign.status || "active"}
              </Badge>
            </div>
            {(campaign.startDate || campaign.endDate) && (
              <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                <ClockIcon className="h-3 w-3" />
                {formatDate(campaign.startDate)} -{" "}
                {formatDate(campaign.endDate)}
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
    return new Date().toISOString().split("T")[0];
  }, []);

  const defaultStartDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }, []);

  const {
    data: analyticsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "analytics-overview",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
    ],
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
  const couponUsageRate =
    analyticsData?.marketingEngagement?.couponUsageRate || 0;
  const topUsedCoupons = couponUsageStats?.topUsedCoupons || [];

  // Create chart data from top used coupons
  const couponChartData = topUsedCoupons.map((coupon) => ({
    key:
      coupon.couponCode.length > 12
        ? coupon.couponCode.substring(0, 12) + "..."
        : coupon.couponCode,
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
      className={cn("md:max-h-auto", className)}
      // actions={
      //   <Button
      //     variant="ghost"
      //     size="sm"
      //     className="text-blue-600 hover:text-blue-700"
      //   >
      //     <EyeIcon className="mr-1 h-4 w-4" />
      //     View Details
      //   </Button>
      // }
    >
      {isLoading && (
        <div className="text-muted-foreground py-8 text-center text-sm">
          Loading coupon data...
        </div>
      )}
      {isError && (
        <div className="py-8 text-center text-sm text-red-500">
          Error loading coupon data
        </div>
      )}
      {!isLoading && !isError && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{couponUsageRate}%</p>
              <p className="text-muted-foreground text-sm">Usage Rate</p>
            </div>
            <div className="rounded-full bg-green-100 p-2">
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
                  width: 50,
                }}
                className="h-32"
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <p className="text-xs text-gray-600">Total Coupons</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {couponUsageStats?.totalCoupons || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <p className="text-xs text-gray-600">Used Coupons</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {couponUsageStats?.usedCoupons || 0}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg bg-gray-50">
              <p className="text-muted-foreground text-sm">
                No coupon usage data available
              </p>
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
    return new Date().toISOString().split("T")[0];
  }, []);

  const defaultStartDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }, []);

  const {
    data: analyticsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "analytics-overview",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
    ],
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
    {
      label: "Ongoing",
      count: promotions.ongoing,
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Scheduled",
      count: promotions.scheduled,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Expired",
      count: promotions.expired,
      color: "bg-gray-100 text-gray-700",
    },
  ].filter((item) => item.count > 0);

  return (
    <StatChartCard name="Ongoing Promotions" className={className}>
      {isLoading && (
        <div className="text-muted-foreground py-4 text-center text-sm">
          Loading promotions...
        </div>
      )}
      {isError && (
        <div className="py-4 text-center text-sm text-red-500">
          Error loading promotions
        </div>
      )}
      {!isLoading && !isError && promotions.total === 0 && (
        <div className="text-muted-foreground py-4 text-center text-sm">
          No promotions found
        </div>
      )}
      {!isLoading && !isError && promotions.total > 0 && (
        <div className="space-y-4">
          {promotionItems.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground">
                    {item.label} Promotions
                  </p>
                </div>
                <Badge className={cn("text-sm", item.color)}>
                  {item.count}
                </Badge>
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Total Promotions</p>
              <Badge className={cn("text-sm")}>{promotions.total}</Badge>
            </div>
          </div>
        </div>
      )}
    </StatChartCard>
  );

  return (
    <Card className={cn("border-gray-200 bg-white", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Ongoing Promotions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <EyeIcon className="mr-1 h-4 w-4" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {isLoading && (
          <div className="text-muted-foreground py-4 text-center text-sm">
            Loading promotions...
          </div>
        )}
        {isError && (
          <div className="py-4 text-center text-sm text-red-500">
            Error loading promotions
          </div>
        )}
        {!isLoading && !isError && promotions.total === 0 && (
          <div className="text-muted-foreground py-4 text-center text-sm">
            No promotions found
          </div>
        )}
        {!isLoading && !isError && promotions.total > 0 && (
          <>
            {promotionItems.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
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
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  Total Promotions
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {promotions.total}
                </p>
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
    return new Date().toISOString().split("T")[0];
  }, []);

  const defaultStartDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }, []);

  const {
    data: analyticsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "analytics-overview",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
    ],
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
    <Card className={cn("border-gray-200 bg-white", className)}>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">Survey Responses</p>
            <h3 className="mt-1 text-3xl font-bold">
              {surveyData.totalResponses.toLocaleString()}
            </h3>
          </div>
          <div className="flex items-center justify-center rounded-full bg-[var(--chart-1)]/20 p-2">
            <DocumentTextIcon className="h-6 w-6 text-[var(--chart-1)]" />
          </div>
        </div>
        {isLoading && (
          <div className="text-muted-foreground py-4 text-center text-xs">
            Loading...
          </div>
        )}
        {isError && (
          <div className="py-4 text-center text-xs text-red-500">
            Error loading data
          </div>
        )}
        {!isLoading && !isError && (
          <div className="border-border space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Surveys</span>
              <span className="text-muted-foreground font-semibold">
                {surveyData.totalSurveys}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Surveys</span>
              <span className="text-muted-foreground font-semibold">
                {surveyData.activeSurveys}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="text-muted-foreground font-semibold">
                {surveyData.completionRate}%
              </span>
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
    return new Date().toISOString().split("T")[0];
  }, []);

  const defaultStartDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }, []);

  const {
    data: analyticsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "analytics-overview",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
    ],
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

  const redemptionData = analyticsData?.marketingEngagement
    ?.rewardRedemptions || {
    totalRedeemed: 0,
    redemptionCount: 0,
    uniqueUsers: 0,
    period: "this_week",
  };

  return (
    <Card className={cn("bg-white", className)}>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">Reward Redemptions</p>
            <h3 className="text-foreground mt-1 text-3xl font-bold">
              {redemptionData.redemptionCount.toLocaleString()}
            </h3>
          </div>
          <div className="flex items-center justify-center rounded-full bg-[var(--chart-2)]/20 p-2">
            <GiftIcon className="h-6 w-6 text-[var(--chart-2)]" />
          </div>
        </div>
        {isLoading && (
          <div className="text-muted-foreground py-4 text-center text-xs">
            Loading...
          </div>
        )}
        {isError && (
          <div className="py-4 text-center text-xs text-red-500">
            Error loading data
          </div>
        )}
        {!isLoading && !isError && (
          <div className="border-border space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Redeemed</span>
              <span className="text-muted-foreground font-semibold">
                {redemptionData.totalRedeemed.toLocaleString()} pts
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Unique Users</span>
              <span className="text-muted-foreground font-semibold">
                {redemptionData.uniqueUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Period</span>
              <span className="text-muted-foreground font-semibold capitalize">
                {redemptionData.period.replace("_", " ")}
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
    return new Date().toISOString().split("T")[0];
  }, []);

  const defaultStartDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }, []);

  const {
    data: analyticsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "analytics-overview",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
    ],
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
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white">
            2
          </div>
        );
      case 3:
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white">
            3
          </div>
        );
      default:
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-gray-600">
            {rank}
          </div>
        );
    }
  };

  return (
    <StatChartCard
      name={
        <div className="flex items-center gap-2">
          {" "}
          <SparklesIcon className="h-5 w-5" />
          Top Reward Earners
        </div>
      }
      className={cn("md:max-h-auto", className)}
    >
      {isLoading && (
        <div className="text-muted-foreground py-4 text-center text-sm">
          Loading earners...
        </div>
      )}
      {isError && (
        <div className="py-4 text-center text-sm text-red-500">
          Error loading earners
        </div>
      )}
      {!isLoading && !isError && earners.length === 0 && (
        <div className="text-muted-foreground py-4 text-center text-sm">
          No reward earners found
        </div>
      )}
      <div className="space-y-4">
        {earners.slice(0, 5).map((earner, index) => (
          <div
            key={earner.userId || index}
            className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex gap-3">
              <div className="mt-1 flex-shrink-0">{getRankIcon(index + 1)}</div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-muted-foreground truncate font-medium">
                    {earner.userName || "Anonymous"}
                  </p>
                  <Badge className={cn("text-xs", getTierColor(earner.badges))}>
                    {getTierLabel(earner.badges)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <SparklesIcon className="h-4 w-4 fill-blue-500 text-blue-500" />
                    <span className="text-muted-foreground text-sm font-semibold">
                      {earner.currentBalance.toLocaleString()} pts
                    </span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {earner.badges} badges
                  </span>
                </div>
                <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                  <span>
                    Lifetime: {earner.lifetimeEarned.toLocaleString()} pts
                  </span>
                  {earner.lifetimeRedeemed > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        Redeemed: {earner.lifetimeRedeemed.toLocaleString()} pts
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </StatChartCard>
  );

  return (
    <Card className={cn("border-gray-200 bg-white", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <SparklesIcon className="h-5 w-5" />
            Top Reward Earners
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <EyeIcon className="mr-1 h-4 w-4" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {isLoading && (
          <div className="text-muted-foreground py-4 text-center text-sm">
            Loading earners...
          </div>
        )}
        {isError && (
          <div className="py-4 text-center text-sm text-red-500">
            Error loading earners
          </div>
        )}
        {!isLoading && !isError && earners.length === 0 && (
          <div className="text-muted-foreground py-4 text-center text-sm">
            No reward earners found
          </div>
        )}
        {earners.slice(0, 5).map((earner, index) => (
          <div
            key={earner.userId || index}
            className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-gray-900">
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
                  <span className="text-muted-foreground text-xs">
                    {earner.badges} badges
                  </span>
                </div>
                <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                  <span>
                    Lifetime: {earner.lifetimeEarned.toLocaleString()} pts
                  </span>
                  {earner.lifetimeRedeemed > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        Redeemed: {earner.lifetimeRedeemed.toLocaleString()} pts
                      </span>
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
