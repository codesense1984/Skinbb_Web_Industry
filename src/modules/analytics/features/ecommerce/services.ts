import { api, API_BASE_URL } from "@/core/services/http/base.service";
import type {
  SalesAnalyticsData,
  TopBrandData,
  TopProductData,
  TopSellerData,
  AnalyticsParams,
  AnalyticsOverviewData,
  AbandonedDraftOrdersData,
  SalesInsightsData,
  BrandInsightsData,
  CustomerInsightsData,
} from "./types";

// Utility function to construct full image URLs
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL}/${imagePath}`;
};

// API Response types
type ApiResponse<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

// Sales Analytics API
export const apiGetSalesAnalytics = async (
  params: AnalyticsParams,
): Promise<ApiResponse<SalesAnalyticsData>> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return api.get<ApiResponse<SalesAnalyticsData>>(
    `/api/v1/dashboard/admin/sales-analytics?${queryParams}`,
  );
};

// Top Brands Analytics API
export const apiGetTopBrandAnalytics = async (
  params: AnalyticsParams,
): Promise<ApiResponse<TopBrandData[]>> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return api.get<ApiResponse<TopBrandData[]>>(
    `/api/v1/dashboard/admin/top-brands-analytics?${queryParams}`,
  );
};

// Top Products Analytics API
export const apiGetTopProductsAnalytics = async (
  params: AnalyticsParams,
): Promise<ApiResponse<TopProductData[]>> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return api.get<ApiResponse<TopProductData[]>>(
    `/api/v1/dashboard/admin/top-products-analytics?${queryParams}`,
  );
};

// Top Sellers Analytics API
export const apiGetTopSellersAnalytics = async (
  params: AnalyticsParams,
): Promise<ApiResponse<TopSellerData[]>> => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return api.get<ApiResponse<TopSellerData[]>>(
    `/api/v1/dashboard/admin/top-sellers-analytics?${queryParams}`,
  );
};

// Combined fetch function for all analytics
export const fetchAllAnalytics = async (params: AnalyticsParams) => {
  // Run all calls in parallel and don't fail everything if one fails
  const promises = await Promise.allSettled([
    apiGetSalesAnalytics(params),
    apiGetTopBrandAnalytics(params),
    apiGetTopProductsAnalytics(params),
    apiGetTopSellersAnalytics(params),
  ]);

  const [salesRes, brandsRes, productsRes, sellersRes] = promises;

  const result = {
    salesAnalytics: undefined as SalesAnalyticsData | undefined,
    topBrands: undefined as TopBrandData[] | undefined,
    topProducts: undefined as TopProductData[] | undefined,
    topSellers: undefined as TopSellerData[] | undefined,
  };

  if (salesRes.status === "fulfilled") {
    result.salesAnalytics = salesRes.value.data;
  }
  if (brandsRes.status === "fulfilled") {
    result.topBrands = brandsRes.value.data;
  }
  if (productsRes.status === "fulfilled") {
    result.topProducts = productsRes.value.data;
  }
  if (sellersRes.status === "fulfilled") {
    result.topSellers = sellersRes.value.data;
  }

  const allFailed = promises.every((p) => p.status === "rejected");
  if (allFailed) {
    throw new Error("Failed to load any analytics");
  }

  return result;
};

// Analytics Overview API
export const apiGetAnalyticsOverview = async (params?: {
  startDate?: string;
  endDate?: string;
  brandId?: string;
}): Promise<ApiResponse<AnalyticsOverviewData>> => {
  const queryParams = new URLSearchParams();

  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params?.brandId) {
    queryParams.append("brandId", params.brandId);
  }

  const queryString = queryParams.toString();
  const url = `/api/v1/admin-analytics/overview${queryString ? `?${queryString}` : ""}`;

  return api.get<ApiResponse<AnalyticsOverviewData>>(url);
};

// Abandoned Draft Orders API
export const apiGetAbandonedDraftOrders = async (params?: {
  startDate?: string;
  endDate?: string;
  brandId?: string;
}): Promise<ApiResponse<AbandonedDraftOrdersData>> => {
  const queryParams = new URLSearchParams();

  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params?.brandId) {
    queryParams.append("brandId", params.brandId);
  }

  const queryString = queryParams.toString();
  const url = `/api/v1/admin-analytics/abandoned-draft-orders${queryString ? `?${queryString}` : ""}`;

  return api.get<ApiResponse<AbandonedDraftOrdersData>>(url);
};

// Sales Insights API
export const apiGetSalesInsights = async (params?: {
  startDate?: string;
  endDate?: string;
  brandId?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<SalesInsightsData>> => {
  const queryParams = new URLSearchParams();

  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params?.brandId) {
    queryParams.append("brandId", params.brandId);
  }
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  const queryString = queryParams.toString();
  const url = `/api/v1/admin-analytics/sales-insights${queryString ? `?${queryString}` : ""}`;

  return api.get<ApiResponse<SalesInsightsData>>(url);
};

// Brand Insights API
export const apiGetBrandInsights = async (params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<BrandInsightsData>> => {
  const queryParams = new URLSearchParams();

  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  const queryString = queryParams.toString();
  const url = `/api/v1/admin-analytics/brand-insights${queryString ? `?${queryString}` : ""}`;

  return api.get<ApiResponse<BrandInsightsData>>(url);
};

// Customer Insights API
export const apiGetCustomerInsights = async (params?: {
  startDate?: string;
  endDate?: string;
  brandId?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<CustomerInsightsData>> => {
  const queryParams = new URLSearchParams();

  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params?.brandId) {
    queryParams.append("brandId", params.brandId);
  }
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  const queryString = queryParams.toString();
  const url = `/api/v1/admin-analytics/customer-insights${queryString ? `?${queryString}` : ""}`;

  return api.get<ApiResponse<CustomerInsightsData>>(url);
};
