export type Period = "thisMonth" | "thisWeek" | "thisYear";

export type StatisticCategory =
  | "totalSales"
  | "orders"
  | "cancellations"
  | "avgOrderValue";

export type SalesAnalyticsData = {
  totalSales: number;
  orders: number;
  avgOrderValue: number;
  cancellations: number;
};

export type TopBrandData = {
  brandName: string;
  brandImage: string;
  quantityOrdered: number;
};

export type TopProductData = {
  productName: string;
  productImage: string;
  totalOrders: number;
};

export type TopSellerData = {
  sellerName: string;
  sellerImage: string;
  totalSales: number;
};

export type CombinedAnalytics = {
  salesAnalytics?: SalesAnalyticsData;
  topBrands?: TopBrandData[];
  topProducts?: TopProductData[];
  topSellers?: TopSellerData[];
};

export type AnalyticsParams = {
  startDate: string;
  endDate: string;
  brandId?: string;
};

export type InventoryMetrics = {
  totalStock: number;
  lowStockProducts: number;
  outOfStock: number;
};

export type ActiveCampaign = {
  _id: string;
  name: string;
  type?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
};

export type ActiveCampaigns = {
  count: number;
  campaigns: ActiveCampaign[];
};

export type TopUsedCoupon = {
  _id: string;
  couponCode: string;
  couponTitle: string;
  usageCount: number;
  discountType: string;
  discountValue: number;
};

export type CouponUsageStats = {
  totalCoupons: number;
  usedCoupons: number;
  usageRate: number;
  topUsedCoupons: TopUsedCoupon[];
};

export type OngoingPromotions = {
  ongoing: number;
  scheduled: number;
  expired: number;
  total: number;
};

export type SurveyResponse = {
  surveyId?: string;
  surveyName?: string;
  [key: string]: any;
};

export type SurveyResponses = {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  completionRate: number;
  surveys: SurveyResponse[];
};

export type RewardRedemptions = {
  totalRedeemed: number;
  redemptionCount: number;
  uniqueUsers: number;
  period: string;
};

export type TopRewardEarner = {
  userId?: string;
  userName: string;
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  badges: number;
};

export type MarketingEngagement = {
  activeCampaigns: ActiveCampaigns;
  couponUsageRate: number;
  couponUsageStats: CouponUsageStats;
  ongoingPromotions: OngoingPromotions;
  surveyResponses: SurveyResponses;
  rewardRedemptions: RewardRedemptions;
  topRewardEarners: TopRewardEarner[];
};

export type AnalyticsOverviewData = {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  activeCustomers: number;
  newCustomers: number;
  brandPartnersLive: number;
  conversionRate: number;
  averageProductRating: number;
  marketingEngagement?: MarketingEngagement;
};

export type AbandonedDraftOrdersData = {
  abandonedOrdersCount: number;
  totalAbandonedValue: number;
  averageAbandonedValue: number;
};

export type TopProduct = {
  _id: string;
  productName: string;
  totalRevenue: number;
  totalQuantity: number;
  averagePrice: number;
  thumbnail: string;
};

export type TopCategory = {
  categoryName: string;
  revenue: number;
  orderCount: number;
  categoryId: string;
  productCount: number;
};

export type LowInventoryAlert = {
  sku?: string;
  stockQuantity: number;
  productName: string;
};

export type NewProductLaunch = {
  sku: string;
  thumbnail: string;
  price: number;
  createdAt: string;
  productId: string;
  productName: string;
  brandName: string;
};

export type InventoryMetrics = {
  totalStock: number;
  lowStockProducts: number;
  outOfStock: number;
};

export type RevenueTrend = {
  date: string;
  revenue: number;
  orders: number;
};

export type SalesInsightsData = {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  lowInventoryAlerts: LowInventoryAlert[];
  newProductLaunches: NewProductLaunch[];
  inventoryMetrics: InventoryMetrics;
  revenueTrend: RevenueTrend[];
  conversionRate: number;
  refundRate: number;
  totalRecords: number;
  totalPages: number;
};

export type BrandInsight = {
  brandId: string;
  brandName: string;
  totalRevenue: number;
  totalOrders: number;
  productCount: number;
};

export type BrandInsightsData = {
  brands: BrandInsight[];
  totalActiveBrands: number;
  totalRecords: number;
  totalPages: number;
};

export type TopCustomer = {
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  totalOrders: number;
  totalSpent: number;
};

export type CustomerInsightsData = {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  topCustomers: TopCustomer[];
  totalRecords: number;
  totalPages: number;
};
