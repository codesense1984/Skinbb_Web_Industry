import React, { useState, useEffect } from "react";
import { PageContent } from "@/core/components/ui/structure";
import { MetricsCard } from "@/core/components/ui/metrics-card";
import { SimpleLineChart } from "@/core/components/charts/SimpleLineChart";
import { SalesTargetCard } from "@/core/components/ui/sales-target-card";
import { TopProductsList } from "@/core/components/ui/top-products-list";
import {
  TimePeriodSelector,
  type TimePeriod,
} from "@/core/components/ui/time-period-selector";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

// Mock data generator for real-time updates
const generateMockData = (days: number = 12) => {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Generate realistic ecommerce data
    const baseValue = 200000 + Math.random() * 400000;
    const trend = Math.sin((i / days) * Math.PI) * 0.3 + 0.7;
    const noise = (Math.random() - 0.5) * 0.2;
    const value = Math.round(baseValue * trend * (1 + noise));

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: value,
      label: "Impressions",
    });
  }

  return data;
};

const generateTopProducts = () => [
  {
    id: "1",
    name: "Maneki Neko Poster",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center",
    sold: 1249,
    change: 15.2,
    isPositive: true,
  },
  {
    id: "2",
    name: "Echoes Necklace",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop&crop=center",
    sold: 1145,
    change: 13.9,
    isPositive: true,
  },
  {
    id: "3",
    name: "Spiky Ring",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&h=100&fit=crop&crop=center",
    sold: 1073,
    change: 9.5,
    isPositive: true,
  },
  {
    id: "4",
    name: "Pastel Petals Poster",
    image:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop&crop=center",
    sold: 1022,
    change: 2.3,
    isPositive: true,
  },
  {
    id: "5",
    name: "Il Limone",
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100&h=100&fit=crop&crop=center",
    sold: 992,
    change: -0.7,
    isPositive: false,
  },
];

interface EcommerceAnalyticsDashboardProps {
  isAdmin?: boolean;
}

const EcommerceAnalyticsDashboard: React.FC<
  EcommerceAnalyticsDashboardProps
> = ({ isAdmin = false }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly");
  const [chartData, setChartData] = useState(generateMockData(12));

  // Generate metrics based on current data
  const totalProfit = 82373.21;
  const totalOrders = 7234;
  const impressions = 3100000;

  const profitChange = { value: "+3.4% from last month", isPositive: true };
  const ordersChange = { value: "-2.8% from last month", isPositive: false };
  const impressionsChange = {
    value: "+4.6% from last month",
    isPositive: true,
  };

  // Sales target data
  const salesTarget = {
    current: 1300,
    target: 1800,
    period: timePeriod,
    onPeriodChange: setTimePeriod,
  };

  // Top products data
  const topProducts = generateTopProducts();

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prevData) => {
        const newData = [...prevData];
        // Update the last data point with some variation
        const lastIndex = newData.length - 1;
        if (lastIndex >= 0) {
          const variation = (Math.random() - 0.5) * 0.1;
          newData[lastIndex] = {
            ...newData[lastIndex],
            value: Math.round(newData[lastIndex].value * (1 + variation)),
          };
        }
        return newData;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Update chart data when time period changes
  useEffect(() => {
    const days =
      timePeriod === "daily"
        ? 7
        : timePeriod === "weekly"
          ? 4
          : timePeriod === "monthly"
            ? 12
            : 12;
    const newData = generateMockData(days);
    console.log("Generated chart data:", newData);
    setChartData(newData);
  }, [timePeriod]);

  const handleViewAllProducts = () => {
    // Navigate to products page
    console.log("Navigate to all products");
  };

  return (
    <PageContent
      header={{
        title: "Ecommerce Analytics",
        description: isAdmin
          ? "Comprehensive ecommerce analytics and insights for all sellers"
          : "Track your sales performance, orders, and revenue insights",
        hasBack: false,
      }}
    >
      <div className="space-y-6">
        {/* Overview Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
            <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <MetricsCard
              title="Total profit"
              value={`$${totalProfit.toLocaleString()}`}
              change={profitChange}
              icon={
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                </div>
              }
            />
            <MetricsCard
              title="Total order"
              value={totalOrders.toLocaleString()}
              change={ordersChange}
              icon={
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <ShoppingBagIcon className="h-6 w-6 text-green-600" />
                </div>
              }
            />
            <MetricsCard
              title="Impression"
              value={`${(impressions / 1000000).toFixed(1)}M`}
              change={impressionsChange}
              icon={
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <EyeIcon className="h-6 w-6 text-purple-600" />
                </div>
              }
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Impressions Over Time
              </h3>
              <SimpleLineChart
                data={chartData}
                height={400}
                color="#8b5cf6"
                className="w-full"
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Sales Target */}
            <SalesTargetCard
              current={salesTarget.current}
              target={salesTarget.target}
              period={salesTarget.period}
              onPeriodChange={salesTarget.onPeriodChange}
            />

            {/* Top Products */}
            <TopProductsList
              products={topProducts}
              onViewAll={handleViewAllProducts}
            />
          </div>
        </div>

        {/* Additional Metrics (Optional) */}
        {isAdmin && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Sellers
                  </p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                  <p className="text-sm text-green-600">+12% from last month</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Conversion Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">3.2%</p>
                  <p className="text-sm text-red-600">-0.5% from last month</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Order Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900">$89.50</p>
                  <p className="text-sm text-green-600">
                    +5.2% from last month
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Return Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">2.1%</p>
                  <p className="text-sm text-green-600">
                    -0.3% from last month
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContent>
  );
};

export default EcommerceAnalyticsDashboard;
