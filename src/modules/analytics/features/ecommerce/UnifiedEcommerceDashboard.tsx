import React, { useState, useEffect } from "react";
import { PageContent } from "@/core/components/ui/structure";
import { MetricsCard } from "@/core/components/ui/metrics-card";
import { SimpleLineChart } from "@/core/components/charts/SimpleLineChart";
import { SalesTargetCard } from "@/core/components/ui/sales-target-card";
import { TopProductsList } from "@/core/components/ui/top-products-list";
import { TimePeriodSelector, type TimePeriod } from "@/core/components/ui/time-period-selector";
import Overview from "./components/Overview";
import TopBrand from "./components/TopBrand";
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";

// Mock data generator for real-time updates
const generateMockData = (timePeriod: TimePeriod) => {
  const data = [];
  const now = new Date();
  
  let days = 12;
  let dateFormat: Intl.DateTimeFormatOptions;
  
  switch (timePeriod) {
    case "daily":
      days = 7;
      dateFormat = { month: 'short', day: 'numeric' };
      break;
    case "weekly":
      days = 4;
      dateFormat = { month: 'short', day: 'numeric' };
      break;
    case "monthly":
      days = 12;
      dateFormat = { month: 'short', day: 'numeric' };
      break;
    case "yearly":
      days = 12;
      dateFormat = { month: 'short' };
      break;
    default:
      days = 12;
      dateFormat = { month: 'short', day: 'numeric' };
  }
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    if (timePeriod === "daily") {
      date.setDate(date.getDate() - i);
    } else if (timePeriod === "weekly") {
      date.setDate(date.getDate() - (i * 7));
    } else if (timePeriod === "monthly") {
      date.setMonth(date.getMonth() - i);
    } else if (timePeriod === "yearly") {
      date.setFullYear(date.getFullYear() - i);
    }
    
    // Generate realistic ecommerce data with different patterns based on time period
    let baseValue = 200000;
    let trend = 1;
    
    if (timePeriod === "daily") {
      baseValue = 50000 + Math.random() * 100000;
      trend = Math.sin(i / days * Math.PI) * 0.3 + 0.7;
    } else if (timePeriod === "weekly") {
      baseValue = 150000 + Math.random() * 200000;
      trend = Math.sin(i / days * Math.PI) * 0.4 + 0.6;
    } else if (timePeriod === "monthly") {
      baseValue = 200000 + Math.random() * 400000;
      trend = Math.sin(i / days * Math.PI) * 0.3 + 0.7;
    } else if (timePeriod === "yearly") {
      baseValue = 1000000 + Math.random() * 2000000;
      trend = Math.sin(i / days * Math.PI) * 0.2 + 0.8;
    }
    
    const noise = (Math.random() - 0.5) * 0.2;
    const value = Math.round(baseValue * trend * (1 + noise));
    
    data.push({
      date: date.toLocaleDateString('en-US', dateFormat),
      value: value,
      label: 'Impressions'
    });
  }
  
  return data;
};

const generateTopProducts = () => [
  {
    id: "1",
    name: "Maneki Neko Poster",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center",
    sold: 1249,
    change: 15.2,
    isPositive: true
  },
  {
    id: "2", 
    name: "Echoes Necklace",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop&crop=center",
    sold: 1145,
    change: 13.9,
    isPositive: true
  },
  {
    id: "3",
    name: "Spiky Ring", 
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&h=100&fit=crop&crop=center",
    sold: 1073,
    change: 9.5,
    isPositive: true
  },
  {
    id: "4",
    name: "Pastel Petals Poster",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop&crop=center", 
    sold: 1022,
    change: 2.3,
    isPositive: true
  },
  {
    id: "5",
    name: "Il Limone",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100&h=100&fit=crop&crop=center",
    sold: 992,
    change: -0.7,
    isPositive: false
  }
];

// Mock data for seller dashboard - adjust based on time period
const generateSellerData = (timePeriod: TimePeriod) => {
  const baseData = {
    daily: { totalSales: 2500, orders: 8, avgOrderValue: 312, cancellations: 1 },
    weekly: { totalSales: 17500, orders: 25, avgOrderValue: 700, cancellations: 2 },
    monthly: { totalSales: 81790, orders: 73, avgOrderValue: 1120, cancellations: 2 },
    yearly: { totalSales: 980000, orders: 876, avgOrderValue: 1118, cancellations: 24 }
  };
  
  return baseData[timePeriod] || baseData.monthly;
};

const generateTopBrands = () => [
  {
    brandName: "Minimalist",
    brandImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center",
    quantityOrdered: 27
  },
  {
    brandName: "Glowmax",
    brandImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop&crop=center",
    quantityOrdered: 25
  },
  {
    brandName: "Cetaphil",
    brandImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&h=100&fit=crop&crop=center",
    quantityOrdered: 19
  }
];

interface UnifiedEcommerceDashboardProps {
  isAdmin?: boolean;
}

const UnifiedEcommerceDashboard: React.FC<UnifiedEcommerceDashboardProps> = ({
  isAdmin = false
}) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly");
  const [chartData, setChartData] = useState(generateMockData("monthly"));

  // Generate metrics based on current data and time period
  const getAdminMetrics = (period: TimePeriod) => {
    const baseData = {
      daily: { 
        totalProfit: 2500.50, 
        totalOrders: 45, 
        impressions: 150000,
        profitChange: { value: "+5.2% from yesterday", isPositive: true },
        ordersChange: { value: "+2.1% from yesterday", isPositive: true },
        impressionsChange: { value: "+1.8% from yesterday", isPositive: true }
      },
      weekly: { 
        totalProfit: 17500.75, 
        totalOrders: 320, 
        impressions: 750000,
        profitChange: { value: "+3.8% from last week", isPositive: true },
        ordersChange: { value: "-1.2% from last week", isPositive: false },
        impressionsChange: { value: "+4.2% from last week", isPositive: true }
      },
      monthly: { 
        totalProfit: 82373.21, 
        totalOrders: 7234, 
        impressions: 3100000,
        profitChange: { value: "+3.4% from last month", isPositive: true },
        ordersChange: { value: "-2.8% from last month", isPositive: false },
        impressionsChange: { value: "+4.6% from last month", isPositive: true }
      },
      yearly: { 
        totalProfit: 980000.00, 
        totalOrders: 87600, 
        impressions: 37200000,
        profitChange: { value: "+12.5% from last year", isPositive: true },
        ordersChange: { value: "+8.3% from last year", isPositive: true },
        impressionsChange: { value: "+15.2% from last year", isPositive: true }
      }
    };
    
    return baseData[period] || baseData.monthly;
  };

  const adminMetrics = getAdminMetrics(timePeriod);
  const { totalProfit, totalOrders, impressions, profitChange, ordersChange, impressionsChange } = adminMetrics;

  // Sales target data - adjust based on time period
  const getSalesTargetData = (period: TimePeriod) => {
    switch (period) {
      case "daily":
        return { current: 45, target: 60 };
      case "weekly":
        return { current: 320, target: 420 };
      case "monthly":
        return { current: 1300, target: 1800 };
      case "yearly":
        return { current: 15600, target: 21600 };
      default:
        return { current: 1300, target: 1800 };
    }
  };

  const salesTarget = getSalesTargetData(timePeriod);

  // Top products data
  const topProducts = generateTopProducts();
  
  // Seller-specific data - update based on time period
  const sellerData = generateSellerData(timePeriod);
  const topBrands = generateTopBrands();

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prevData => {
        const newData = [...prevData];
        // Update the last data point with some variation
        const lastIndex = newData.length - 1;
        if (lastIndex >= 0) {
          const variation = (Math.random() - 0.5) * 0.1;
          newData[lastIndex] = {
            ...newData[lastIndex],
            value: Math.round(newData[lastIndex].value * (1 + variation))
          };
        }
        return newData;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Update chart data when time period changes
  useEffect(() => {
    const newData = generateMockData(timePeriod);
    console.log("Generated chart data for", timePeriod, ":", newData);
    setChartData(newData);
  }, [timePeriod]);

  const handleViewAllProducts = () => {
    // Navigate to products page
    console.log("Navigate to all products");
  };

  if (isAdmin) {
    // Admin dashboard - comprehensive analytics
    return (
      <PageContent
        header={{
          title: "Ecommerce Analytics",
          description: "Comprehensive ecommerce analytics and insights for all sellers",
          hasBack: false,
        }}
      >
        <div className="space-y-6">
          {/* Overview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
              <TimePeriodSelector
                value={timePeriod}
                onChange={setTimePeriod}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricsCard
                title="Total profit"
                value={`$${totalProfit.toLocaleString()}`}
                change={profitChange}
                icon={
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                }
              />
              <MetricsCard
                title="Total order"
                value={totalOrders.toLocaleString()}
                change={ordersChange}
                icon={
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingBagIcon className="w-6 h-6 text-green-600" />
                  </div>
                }
              />
              <MetricsCard
                title="Impression"
                value={`${(impressions / 1000000).toFixed(1)}M`}
                change={impressionsChange}
                icon={
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <EyeIcon className="w-6 h-6 text-purple-600" />
                  </div>
                }
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Impressions Over Time</h3>
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
              {/* Sales Target - Remove individual time period selector */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sales target</h3>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {salesTarget.current >= 1000 ? `${(salesTarget.current / 1000).toFixed(1)}K` : salesTarget.current} / {salesTarget.target >= 1000 ? `${(salesTarget.target / 1000).toFixed(1)}K` : salesTarget.target} Units
                    </div>
                    <p className="text-sm text-gray-500">Made this {timePeriod}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="relative inline-flex items-center justify-center w-20 h-20">
                      <svg
                        width={80}
                        height={80}
                        className="transform -rotate-90"
                      >
                        <circle
                          cx={40}
                          cy={40}
                          r={32}
                          stroke="currentColor"
                          strokeWidth={6}
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx={40}
                          cy={40}
                          r={32}
                          stroke="currentColor"
                          strokeWidth={6}
                          fill="transparent"
                          strokeDasharray={201.06}
                          strokeDashoffset={201.06 - (Math.round((salesTarget.current / salesTarget.target) * 100) / 100) * 201.06}
                          className="text-blue-600 transition-all duration-300 ease-in-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{Math.round((salesTarget.current / salesTarget.target) * 100)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <TopProductsList
                products={topProducts}
                onViewAll={handleViewAllProducts}
              />
            </div>
          </div>

          {/* Additional Metrics for Admin */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sellers</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                  <p className="text-sm text-green-600">+12% from last month</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">3.2%</p>
                  <p className="text-sm text-red-600">-0.5% from last month</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">$89.50</p>
                  <p className="text-sm text-green-600">+5.2% from last month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Return Rate</p>
                  <p className="text-2xl font-bold text-gray-900">2.1%</p>
                  <p className="text-sm text-green-600">-0.3% from last month</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    );
  } else {
    // Seller dashboard - simplified view with Top Brands and chart
    return (
      <PageContent
        header={{
          title: "Ecommerce Analytics",
          description: "Track your sales performance and key metrics.",
          hasBack: false,
        }}
      >
        <div className="space-y-6">
          {/* Overview Section for Seller */}
          <Overview data={sellerData} />
          
          {/* Chart Section for Seller */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Sales Performance</h2>
              <TimePeriodSelector
                value={timePeriod}
                onChange={setTimePeriod}
              />
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Over Time</h3>
              <SimpleLineChart
                data={chartData}
                height={400}
                color="#10b981"
                className="w-full"
              />
            </div>
          </div>
          
          {/* Top Brands Section */}
          <TopBrand data={topBrands} />
        </div>
      </PageContent>
    );
  }
};

export default UnifiedEcommerceDashboard;
