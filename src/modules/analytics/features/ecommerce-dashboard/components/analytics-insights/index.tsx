import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatChartCard } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import {
  ChartBarIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { cn, formatCurrency } from "@/core/utils";
import { type ChartConfig } from "@/core/components/ui/chart";
import LineChart from "@/core/components/charts/LineChart";
import BarChart from "@/core/components/charts/BarChart";
import {
  apiGetSalesInsights,
  apiGetBrandInsights,
  apiGetCustomerInsights,
  apiGetAnalyticsOverview,
} from "../../../ecommerce/services";

// Sales Trend Graph Card (Graph Tile) - Uses Sales Insights API
interface SalesTrendGraphCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  brandId?: string;
}

export const SalesTrendGraphCard: React.FC<SalesTrendGraphCardProps> = ({
  className,
  startDate,
  endDate,
  brandId,
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
    data: salesInsights,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "sales-insights",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
      brandId,
    ],
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

  const revenueTrend = salesInsights?.revenueTrend || [];

  // Format revenue trend data for chart
  const salesData = revenueTrend.map((trend) => {
    const date = new Date(trend.date);
    const periodLabel = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return {
      period: periodLabel,
      sales: trend.revenue,
      orders: trend.orders,
      date: trend.date,
    };
  });

  // Calculate average if we have data
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const avgSales = salesData.length > 0 ? totalSales / salesData.length : 0;
  const formattedAvg = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(avgSales);

  const salesChartConfig = {
    sales: {
      label: "Revenue ($)",
      color: "var(--chart-1)",
    },
    orders: {
      label: "Orders",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const salesLineProps = [
    {
      dataKey: "sales",
      stroke: "var(--chart-1)",
      strokeWidth: 2,
      dot: { fill: "var(--chart-1)", r: 4 },
    },
    {
      dataKey: "orders",
      stroke: "var(--chart-2)",
      strokeWidth: 2,
      dot: { fill: "var(--chart-2)", r: 4 },
    },
  ];

  return (
    <StatChartCard
      name="Sales Trend Graph"
      className={cn("md:max-h-auto", className)}
      // actions={
      //   <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
      //     <EyeIcon className="h-4 w-4 mr-1" />
      //     View Details
      //   </Button>
      // }
    >
      {isLoading && (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading sales data...
        </div>
      )}
      {isError && (
        <div className="py-8 text-center text-sm text-red-500">
          Error loading sales data
        </div>
      )}
      {!isLoading && !isError && salesData.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          No sales data available
        </div>
      )}
      {!isLoading && !isError && salesData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Avg Revenue</p>
              <p className="text-foreground text-2xl font-bold">
                {formattedAvg}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-2">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <LineChart
            data={salesData}
            config={salesChartConfig}
            lineProps={salesLineProps}
            className="h-64"
            xAxisProps={{ dataKey: "period" }}
            showLegends={true}
            yAxisProps={{
              width: 40,
            }}
            legendProps={{ verticalAlign: "bottom", height: 36 }}
          />
        </div>
      )}
    </StatChartCard>
  );
};

// Ingredient Trends Card (Graph Tile) - Uses Top Products from Sales Insights
interface IngredientTrendsCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  brandId?: string;
}

export const IngredientTrendsCard: React.FC<IngredientTrendsCardProps> = ({
  className,
  startDate,
  endDate,
  brandId,
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
    data: salesInsights,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "sales-insights",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
      brandId,
    ],
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

  // Use top products as ingredient trends (showing product sales which can indicate ingredient popularity)
  const topProducts = salesInsights?.topProducts || [];

  const ingredientChartConfig = {
    value: {
      label: "Revenue ($)",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const ingredientChartData = topProducts.map((product) => ({
    key:
      product.productName.length > 15
        ? product.productName.substring(0, 15) + "..."
        : product.productName,
    value: product.totalRevenue,
    fullName: product.productName,
    quantity: product.totalQuantity,
  }));

  return (
    <StatChartCard
      name="Ingredient Trends"
      className={cn("md:max-h-auto", className)}
    >
      {isLoading && (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading trends...
        </div>
      )}
      {isError && (
        <div className="py-8 text-center text-sm text-red-500">
          Error loading trends
        </div>
      )}
      {!isLoading && !isError && ingredientChartData.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          No trend data available
        </div>
      )}
      {!isLoading && !isError && ingredientChartData.length > 0 && (
        <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
          <BarChart
            config={ingredientChartConfig}
            data={ingredientChartData}
            layout="horizontal"
            barSize={30}
            showTooltip={true}
            showGrid={true}
            yAxisProps={{
              width: 70,
            }}
            className="h-76"
          />
          <div className="space-y-4">
            {topProducts.slice(0, 4).map((product) => (
              <div key={product._id} className="rounded-lg bg-gray-50 p-3">
                <p className="text-muted-foreground truncate font-semibold">
                  {product.productName}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground text-sm">
                    Qty: {product.totalQuantity}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Price: {product.averagePrice}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Revenue: {product.totalRevenue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </StatChartCard>
  );
};

// Market Trends Overview Card (Graph Tile) - Uses Top Categories from Sales Insights
interface MarketTrendsOverviewCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  brandId?: string;
}

export const MarketTrendsOverviewCard: React.FC<
  MarketTrendsOverviewCardProps
> = ({ className, startDate, endDate, brandId }) => {
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
    data: salesInsights,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "sales-insights",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
      brandId,
    ],
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

  const topCategories = salesInsights?.topCategories || [];

  // Calculate growth based on order count (assuming higher order count = growth)
  const maxOrders =
    topCategories.length > 0
      ? Math.max(...topCategories.map((c) => c.orderCount))
      : 0;

  const marketChartData = topCategories.map((category) => {
    const growthPercent =
      maxOrders > 0 ? ((category.orderCount / maxOrders) * 100).toFixed(1) : 0;
    return {
      key:
        category.categoryName.length > 12
          ? category.categoryName.substring(0, 12) + "..."
          : category.categoryName,
      revenue: category.revenue,
      orders: category.orderCount * 100, // Scale for visibility
      fullCategory: category.categoryName,
      growthPercent: parseFloat(growthPercent),
      productCount: category.productCount,
    };
  });

  const marketChartConfig = {
    revenue: {
      label: "Revenue ($)",
      color: "var(--chart-1)",
    },
    orders: {
      label: "Orders (scaled)",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const marketLineProps = [
    {
      dataKey: "revenue",
      stroke: "var(--chart-1)",
      strokeWidth: 2,
      dot: { fill: "var(--chart-1)", r: 4 },
    },
    {
      dataKey: "orders",
      stroke: "var(--chart-2)",
      strokeWidth: 2,
      dot: { fill: "var(--chart-2)", r: 4 },
    },
  ];

  return (
    <StatChartCard
      name="Market Trends Overview"
      className={cn("md:max-h-auto", className)}
    >
      {isLoading && (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading market trends...
        </div>
      )}
      {isError && (
        <div className="py-8 text-center text-sm text-red-500">
          Error loading market trends
        </div>
      )}
      {!isLoading && !isError && marketChartData.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          No market data available
        </div>
      )}
      {!isLoading && !isError && marketChartData.length > 0 && (
        <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
          <LineChart
            data={marketChartData}
            config={marketChartConfig}
            lineProps={marketLineProps}
            className="h-64"
            xAxisProps={{ dataKey: "key" }}
            showLegends={true}
            legendProps={{ verticalAlign: "bottom", height: 36 }}
            yAxisProps={{ width: 45 }}
          />
          <div className="space-y-4">
            {topCategories.slice(0, 4).map((category) => (
              <div
                key={category.categoryId}
                className="rounded-lg bg-gray-50 p-3"
              >
                <p className="text-muted-foreground truncate font-semibold">
                  {category.categoryName}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground text-sm">
                    {category.orderCount} orders
                  </p>
                  <p className="text-muted-foreground text-sm">
                    ₹{(category.revenue / 1000).toFixed(0)}k revenue
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </StatChartCard>
  );
};

// Brand Report Snapshot Card (Graph Tile) - Uses Brand Insights API
interface BrandReportSnapshotCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
}

export const BrandReportSnapshotCard: React.FC<
  BrandReportSnapshotCardProps
> = ({ className, startDate, endDate }) => {
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
    data: brandInsights,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "brand-insights",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
    ],
    queryFn: async () => {
      const response = await apiGetBrandInsights({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
        limit: 10,
      });
      return response.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const brands = brandInsights?.brands || [];
  const totalActiveBrands = brandInsights?.totalActiveBrands || 0;

  const brandChartConfig = {
    value: {
      label: "Revenue",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const brandChartData = brands.map((brand) => ({
    key:
      brand.brandName.length > 15
        ? brand.brandName.substring(0, 15) + "..."
        : brand.brandName,
    value: brand.totalRevenue,
    fullBrand: brand.brandName,
    orders: brand.totalOrders,
    productCount: brand.productCount,
  }));

  return (
    <StatChartCard
      name="Brand Report Snapshot"
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
        <div className="py-8 text-center text-sm text-gray-500">
          Loading brand data...
        </div>
      )}
      {isError && (
        <div className="py-8 text-center text-sm text-red-500">
          Error loading brand data
        </div>
      )}
      {!isLoading && !isError && brands.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          No brand data available
        </div>
      )}
      {!isLoading && !isError && brands.length > 0 && (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <BarChart
            config={brandChartConfig}
            data={brandChartData}
            layout="horizontal"
            barSize={25}
            showTooltip={true}
            showGrid={true}
            yAxisProps={{
              width: 80,
            }}
            className="h-64"
          />
          <div className="space-y-2">
            <div className="">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Total Active Brands
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {totalActiveBrands}
                </span>
              </div>
            </div>
            {brands.slice(0, 3).map((brand) => (
              <div
                key={brand.brandId}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {brand.brandName}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {brand.totalOrders} orders
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">
                      {brand.productCount} products
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(brand.totalRevenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </StatChartCard>
  );
};

// Customer Insight Highlights Card (Graph Tile) - Uses Customer Insights and Analytics Overview APIs
interface CustomerInsightHighlightsCardProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  brandId?: string;
}

export const CustomerInsightHighlightsCard: React.FC<
  CustomerInsightHighlightsCardProps
> = ({ className, startDate, endDate, brandId }) => {
  // Calculate default date range (last 30 days)
  const defaultEndDate = React.useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const defaultStartDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }, []);

  // Fetch customer insights
  const { data: customerInsights, isLoading: isLoadingCustomers } = useQuery({
    queryKey: [
      "customer-insights",
      startDate || defaultStartDate,
      endDate || defaultEndDate,
      brandId,
    ],
    queryFn: async () => {
      const response = await apiGetCustomerInsights({
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
        brandId,
      });
      return response.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Fetch analytics overview
  const { data: analyticsOverview, isLoading: isLoadingOverview } = useQuery({
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
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const isLoading = isLoadingCustomers || isLoadingOverview;
  const isError = false; // Handle errors appropriately

  // Calculate insights from available data
  const totalCustomers = customerInsights?.totalCustomers || 0;
  const newCustomers = customerInsights?.newCustomers || 0;
  const returningCustomers = customerInsights?.returningCustomers || 0;
  const conversionRate = analyticsOverview?.conversionRate || 0;
  const averageOrderValue = analyticsOverview?.averageOrderValue || 0;
  const totalOrders = analyticsOverview?.totalOrders || 0;
  const activeCustomers = analyticsOverview?.activeCustomers || 0;

  // Calculate retention rate
  const retentionRate =
    totalCustomers > 0
      ? ((returningCustomers / totalCustomers) * 100).toFixed(1)
      : "0.0";

  // Calculate customer acquisition rate
  const acquisitionRate =
    totalCustomers > 0
      ? ((newCustomers / totalCustomers) * 100).toFixed(1)
      : "0.0";

  const insights = [
    {
      metric: "Active Customers",
      value: activeCustomers,
      change: 0, // Could calculate from historical data if available
      unit: "",
    },
    {
      metric: "Conversion Rate",
      value: conversionRate,
      change: 0,
      unit: "%",
    },
    {
      metric: "Avg Order Value",
      value: averageOrderValue,
      change: 0,
      unit: "₹",
    },
    {
      metric: "Retention Rate",
      value: parseFloat(retentionRate),
      change: 0,
      unit: "%",
    },
    {
      metric: "Total Orders",
      value: totalOrders,
      change: 0,
      unit: "",
    },
  ].filter((insight) => insight.value > 0);

  const insightChartConfig = {
    value: {
      label: "Value",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const insightChartData = insights.map((insight) => ({
    key:
      insight.metric.length > 15
        ? insight.metric.substring(0, 15) + "..."
        : insight.metric,
    value: insight.value,
    fullMetric: insight.metric,
    change: insight.change,
    unit: insight.unit || "",
  }));

  return (
    <StatChartCard
      name="Customer Insight Highlights"
      className={className}
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
        <div className="py-8 text-center text-sm text-gray-500">
          Loading insights...
        </div>
      )}
      {isError && (
        <div className="py-8 text-center text-sm text-red-500">
          Error loading insights
        </div>
      )}
      {!isLoading && !isError && insights.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          No insight data available
        </div>
      )}
      {!isLoading && !isError && insights.length > 0 && (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <BarChart
            config={insightChartConfig}
            data={insightChartData}
            layout="horizontal"
            barSize={20}
            showTooltip={true}
            showGrid={true}
            yAxisProps={{
              width: 70,
            }}
            className="h-56"
          />
          <div className="grid grid-cols-2 gap-3">
            {insights.map((insight) => (
              <div key={insight.metric} className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-600">
                  {insight.metric}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-muted-foreground text-lg font-bold">
                    {/* {insight.unit &&
                    insight.unit !== "%" &&
                    insight.unit !== "₹"
                      ? ""
                      : insight.unit} */}
                    {typeof insight.value === "number" && insight.unit === "₹"
                      ? insight.value.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })
                      : insight.value.toLocaleString()}
                    {insight.unit === "%" && "%"}
                    {insight.unit &&
                      insight.unit !== "%" &&
                      insight.unit !== "₹" &&
                      ` ${insight.unit}`}
                  </p>
                  {insight.change !== 0 && (
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        insight.change >= 0 ? "text-green-600" : "text-red-600",
                      )}
                    >
                      {insight.change >= 0 ? "+" : ""}
                      {insight.change}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </StatChartCard>
  );
};
