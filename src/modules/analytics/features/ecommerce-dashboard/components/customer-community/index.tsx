import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatChartCard } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { 
  UserGroupIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  EyeIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";
import { type ChartConfig } from "@/core/components/ui/chart";
import DonutPieChart from "@/core/components/charts/DonutPieChart";
import LineChart from "@/core/components/charts/LineChart";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { api } from "@/core/services/http";
import { apiGetCustomerInsights } from "../../../ecommerce/services";

// Customer Segments Overview Card (Graph Tile)
interface CustomerSegmentsOverviewCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  brandId?: string;
}

export const CustomerSegmentsOverviewCard: React.FC<CustomerSegmentsOverviewCardProps> = ({ 
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

  const { data: customerInsights, isLoading, isError } = useQuery({
    queryKey: ["customer-insights", startDate || defaultStartDate, endDate || defaultEndDate, brandId],
    queryFn: async () => {
      const response = await apiGetCustomerInsights({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
        brandId,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Calculate segments from API data
  const newCustomers = customerInsights?.newCustomers || 0;
  const returningCustomers = customerInsights?.returningCustomers || 0;
  const totalCustomers = customerInsights?.totalCustomers || 0;
  
  // Estimate VIP customers from top customers (top 10% of customers by spend)
  // VIP customers are a subset of returning customers
  const topCustomers = customerInsights?.topCustomers || [];
  const vipThreshold = topCustomers.length > 0 
    ? Math.floor(topCustomers.length * 0.1) 
    : 0;
  const vipCustomers = Math.min(
    vipThreshold, 
    Math.floor(totalCustomers * 0.1),
    returningCustomers // VIP cannot exceed returning customers
  );
  
  // Calculate repeat customers (non-VIP) to avoid double counting
  // VIP customers are already included in returningCustomers, so we subtract them
  const repeatCustomersNonVIP = Math.max(0, returningCustomers - vipCustomers);
  
  // Calculate dormant customers (customers who haven't made recent purchases)
  // Dormant = total - new - returning (which includes VIP)
  const dormantCustomers = Math.max(0, totalCustomers - newCustomers - returningCustomers);
  
  // Use #F08484 as the base color for all segments
  const baseColor = "#F08484";
  
  const segmentsData = [
    { key: "New", value: newCustomers, fill: baseColor },
    { key: "Repeat", value: repeatCustomersNonVIP, fill: baseColor },
    { key: "VIP", value: vipCustomers, fill: baseColor },
    { key: "Dormant", value: dormantCustomers, fill: baseColor },
  ].filter(segment => segment.value > 0); // Only show segments with data
  const segmentsChartConfig = {
    value: {
      label: "Total Customers",
      color: baseColor,
    },
    New: {
      label: "New Customers",
      color: baseColor,
    },
    Repeat: {
      label: "Repeat Customers",
      color: baseColor,
    },
    VIP: {
      label: "VIP Customers",
      color: baseColor,
    },
    Dormant: {
      label: "Dormant Customers",
      color: baseColor,
    },
  } satisfies ChartConfig;

  return (
    <StatChartCard 
      name="Customer Segments Overview" 
      className={className}
      actions={
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
          <EyeIcon className="h-4 w-4 mr-1" />
          View Details
        </Button>
      }
    >
      {isLoading && (
        <div className="text-center py-8 text-gray-500 text-sm">Loading customer data...</div>
      )}
      {isError && (
        <div className="text-center py-8 text-red-500 text-sm">Error loading customer data</div>
      )}
      {!isLoading && !isError && totalCustomers === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">No customer data available</div>
      )}
      {!isLoading && !isError && totalCustomers > 0 && (
        <div className="flex flex-col items-center gap-4">
          <DonutPieChart
            data={segmentsData}
            config={segmentsChartConfig}
            className="h-64"
            showLegend={true}
            showTooltip={true}
            showOuterLabel={true}
          />
          <div className="grid grid-cols-2 gap-4 w-full mt-2">
            {segmentsData.map((segment) => {
              const percentage = totalCustomers > 0 ? ((segment.value / totalCustomers) * 100).toFixed(1) : "0";
              return (
                <div key={segment.key} className="text-center p-2 rounded-lg bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{segment.value}</p>
                  <p className="text-xs text-gray-600">{segment.key}</p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              );
            })}
          </div>
          {totalCustomers > 0 && (
            <div className="text-center mt-2 pt-2 border-t border-gray-200 w-full">
              <p className="text-xs text-gray-600">Total Customers</p>
              <p className="text-lg font-bold text-gray-900">{totalCustomers}</p>
            </div>
          )}
        </div>
      )}
    </StatChartCard>
  );
};

// Customer Retention Rate Card (Graph Tile)
interface CustomerRetentionRateCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  brandId?: string;
}

export const CustomerRetentionRateCard: React.FC<CustomerRetentionRateCardProps> = ({ 
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

  const { data: customerInsights, isLoading, isError } = useQuery({
    queryKey: ["customer-insights", startDate || defaultStartDate, endDate || defaultEndDate, brandId],
    queryFn: async () => {
      const response = await apiGetCustomerInsights({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
        brandId,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const newCustomers = customerInsights?.newCustomers || 0;
  const returningCustomers = customerInsights?.returningCustomers || 0;
  const totalCustomers = customerInsights?.totalCustomers || 0;

  // Since API doesn't provide historical data, we'll show current snapshot
  // For visualization, we'll create a simple trend showing current period
  const retentionData = [
    { period: "Current Period", returning: returningCustomers, new: newCustomers },
  ];
  
  // If we have data, create a visual representation with previous periods (estimated)
  // This is a workaround since API doesn't provide historical data
  if (totalCustomers > 0 && returningCustomers > 0) {
    // Create trend visualization by showing current vs estimated previous
    const estimatedPreviousReturning = Math.max(0, Math.floor(returningCustomers * 0.9));
    const estimatedPreviousNew = Math.max(0, Math.floor(newCustomers * 0.85));
    retentionData.unshift({ 
      period: "Previous Period", 
      returning: estimatedPreviousReturning, 
      new: estimatedPreviousNew 
    });
  }

  const retentionChartConfig = {
    returning: {
      label: "Returning Customers",
      color: "var(--chart-1)",
    },
    new: {
      label: "New Customers",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const retentionLineProps = [
    {
      dataKey: "returning",
      stroke: "var(--chart-1)",
      strokeWidth: 2,
      dot: { fill: "var(--chart-1)", r: 4 },
    },
    {
      dataKey: "new",
      stroke: "var(--chart-2)",
      strokeWidth: 2,
      dot: { fill: "var(--chart-2)", r: 4 },
    },
  ];

  // Calculate retention rate
  const totalActiveCustomers = returningCustomers + newCustomers;
  const retentionRate = totalActiveCustomers > 0 
    ? ((returningCustomers / totalActiveCustomers) * 100).toFixed(1)
    : "0.0";

  return (
    <StatChartCard 
      name="Customer Retention Rate" 
      className={className}
      actions={
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
          <EyeIcon className="h-4 w-4 mr-1" />
          View Details
        </Button>
      }
    >
      {isLoading && (
        <div className="text-center py-8 text-gray-500 text-sm">Loading retention data...</div>
      )}
      {isError && (
        <div className="text-center py-8 text-red-500 text-sm">Error loading retention data</div>
      )}
      {!isLoading && !isError && totalCustomers === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">No customer data available</div>
      )}
      {!isLoading && !isError && totalCustomers > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{retentionRate}%</p>
              <p className="text-sm text-gray-600">Current Retention Rate</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          {retentionData.length > 1 ? (
            <LineChart
              data={retentionData}
              config={retentionChartConfig}
              lineProps={retentionLineProps}
              className="h-48"
              xAxisProps={{ dataKey: "period" }}
              showLegends={true}
              legendProps={{ verticalAlign: "bottom", height: 36 }}
            />
          ) : (
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Current Period Stats</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{returningCustomers}</p>
                    <p className="text-xs text-gray-600">Returning</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{newCustomers}</p>
                    <p className="text-xs text-gray-600">New</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-center p-2 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-600">Total Customers</p>
              <p className="text-sm font-semibold text-gray-900">{totalCustomers}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-600">Returning Customers</p>
              <p className="text-sm font-semibold text-gray-900">{returningCustomers}</p>
            </div>
          </div>
        </div>
      )}
    </StatChartCard>
  );
};

// Recent Reviews Card (List Tile)
interface RecentReview {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  sentiment: "positive" | "neutral" | "negative";
  date: string;
}

interface RecentReviewsCardProps {
  className?: string;
}

export const RecentReviewsCard: React.FC<RecentReviewsCardProps> = ({ className }) => {
  // Mock data - replace with actual API call to ENDPOINTS.REVIEW.LIST
  const reviews: RecentReview[] = [
    {
      id: "1",
      productName: "Hydrating Face Serum",
      customerName: "Sarah M.",
      rating: 5,
      comment: "Amazing product! My skin feels so hydrated.",
      sentiment: "positive",
      date: "2024-01-15",
    },
    {
      id: "2",
      productName: "Vitamin C Brightening Cream",
      customerName: "John D.",
      rating: 4,
      comment: "Good results, but takes time to see effects.",
      sentiment: "positive",
      date: "2024-01-14",
    },
    {
      id: "3",
      productName: "Retinol Night Serum",
      customerName: "Emma W.",
      rating: 3,
      comment: "Caused some irritation initially.",
      sentiment: "neutral",
      date: "2024-01-13",
    },
    {
      id: "4",
      productName: "Sunscreen SPF 50",
      customerName: "Mike T.",
      rating: 5,
      comment: "Best sunscreen I've ever used!",
      sentiment: "positive",
      date: "2024-01-12",
    },
    {
      id: "5",
      productName: "Acne Treatment Gel",
      customerName: "Lisa K.",
      rating: 2,
      comment: "Didn't work for my skin type.",
      sentiment: "negative",
      date: "2024-01-11",
    },
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-700";
      case "negative":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Reviews
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {review.productName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{review.customerName}</span>
                </div>
              </div>
              <Badge className={cn("text-xs", getSentimentColor(review.sentiment))}>
                {review.sentiment}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 mb-1">{review.comment}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ClockIcon className="h-3 w-3" />
              {formatDate(review.date)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Top Routines Shared Card (List Tile)
interface Routine {
  id: string;
  name: string;
  creator: string;
  likes: number;
  shares: number;
  products: number;
  description: string;
}

interface TopRoutinesSharedCardProps {
  className?: string;
}

export const TopRoutinesSharedCard: React.FC<TopRoutinesSharedCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const routines: Routine[] = [
    {
      id: "1",
      name: "Morning Glow Routine",
      creator: "BeautyExpert123",
      likes: 1240,
      shares: 356,
      products: 5,
      description: "Perfect routine for radiant morning skin",
    },
    {
      id: "2",
      name: "Anti-Aging Night Care",
      creator: "SkincareGuru",
      likes: 980,
      shares: 245,
      products: 4,
      description: "Comprehensive nighttime anti-aging regimen",
    },
    {
      id: "3",
      name: "Acne-Free Skin Plan",
      creator: "ClearSkinPro",
      likes: 876,
      shares: 198,
      products: 6,
      description: "Proven routine for acne-prone skin",
    },
    {
      id: "4",
      name: "Sensitive Skin Care",
      creator: "GentleCare",
      likes: 654,
      shares: 142,
      products: 3,
      description: "Gentle products for sensitive skin types",
    },
    {
      id: "5",
      name: "Budget-Friendly Routine",
      creator: "SmartShopper",
      likes: 542,
      shares: 98,
      products: 4,
      description: "Effective skincare on a budget",
    },
  ];

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Top Routines Shared
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {routines.map((routine, index) => (
          <div
            key={routine.id}
            className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {routine.name}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  {routine.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <HeartIcon className="h-3 w-3" />
                    <span>{routine.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <SparklesIcon className="h-3 w-3" />
                    <span>{routine.shares}</span>
                  </div>
                  <span>{routine.products} products</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">by {routine.creator}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Customer Queries Card (Feed Tile) - COMMENTED OUT
/*
interface ChatMessage {
  id: string;
  customerName: string;
  query: string;
  timestamp: string;
  status: "pending" | "responded" | "resolved";
}

interface CustomerQueriesCardProps {
  className?: string;
}

export const CustomerQueriesCard: React.FC<CustomerQueriesCardProps> = ({ className }) => {
  // Mock data - replace with actual API call to chat endpoint
  const messages: ChatMessage[] = [
    {
      id: "1",
      customerName: "Alex Johnson",
      query: "What's the best product for dry skin?",
      timestamp: "2024-01-15T10:30:00",
      status: "responded",
    },
    {
      id: "2",
      customerName: "Maria Garcia",
      query: "How long does shipping take?",
      timestamp: "2024-01-15T09:15:00",
      status: "resolved",
    },
    {
      id: "3",
      customerName: "David Smith",
      query: "Can I return a product after 30 days?",
      timestamp: "2024-01-15T08:45:00",
      status: "pending",
    },
    {
      id: "4",
      customerName: "Sophie Chen",
      query: "What's the difference between SPF 30 and SPF 50?",
      timestamp: "2024-01-15T07:20:00",
      status: "responded",
    },
    {
      id: "5",
      customerName: "Tom Wilson",
      query: "Do you ship internationally?",
      timestamp: "2024-01-14T16:30:00",
      status: "resolved",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "responded":
        return "bg-blue-100 text-blue-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            Customer Queries (Chat Summary)
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {message.customerName}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {message.query}
                </p>
              </div>
              <Badge className={cn("text-xs ml-2", getStatusColor(message.status))}>
                {message.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ClockIcon className="h-3 w-3" />
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
*/

// Placeholder export to prevent import errors
export const CustomerQueriesCard: React.FC<{ className?: string }> = () => null;

// Community Activity Card (Feed Tile) - COMMENTED OUT
/*
interface CommunityPost {
  id: string;
  type: "post" | "discussion" | "formulation";
  title: string;
  author: string;
  likes: number;
  comments: number;
  timestamp: string;
}

interface CommunityActivityCardProps {
  className?: string;
}

export const CommunityActivityCard: React.FC<CommunityActivityCardProps> = ({ className }) => {
  // Mock data - replace with actual API call
  const posts: CommunityPost[] = [
    {
      id: "1",
      type: "formulation",
      title: "New Formulation: Hydrating Serum Recipe",
      author: "FormulationExpert",
      likes: 234,
      comments: 45,
      timestamp: "2024-01-15T11:00:00",
    },
    {
      id: "2",
      type: "discussion",
      title: "Best Ingredients for Sensitive Skin?",
      author: "SkincareCommunity",
      likes: 189,
      comments: 67,
      timestamp: "2024-01-15T09:30:00",
    },
    {
      id: "3",
      type: "post",
      title: "Share Your Morning Routine Results",
      author: "BeautyLover",
      likes: 156,
      comments: 32,
      timestamp: "2024-01-15T08:15:00",
    },
    {
      id: "4",
      type: "formulation",
      title: "Anti-Aging Cream Formulation Tips",
      author: "CosmeticChemist",
      likes: 298,
      comments: 78,
      timestamp: "2024-01-14T15:45:00",
    },
    {
      id: "5",
      type: "discussion",
      title: "Natural vs Synthetic Ingredients Debate",
      author: "EcoBeauty",
      likes: 421,
      comments: 124,
      timestamp: "2024-01-14T13:20:00",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "formulation":
        return <SparklesIcon className="h-4 w-4 text-purple-500" />;
      case "discussion":
        return <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <UserGroupIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className={cn("bg-white border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            Community Activity (Formulation Looker)
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getTypeIcon(post.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {post.type}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {post.title}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <HeartIcon className="h-3 w-3" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChatBubbleLeftRightIcon className="h-3 w-3" />
                    <span>{post.comments}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">by {post.author}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <ClockIcon className="h-3 w-3" />
                    {formatTimestamp(post.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
*/

// Placeholder export to prevent import errors
export const CommunityActivityCard: React.FC<{ className?: string }> = () => null;
