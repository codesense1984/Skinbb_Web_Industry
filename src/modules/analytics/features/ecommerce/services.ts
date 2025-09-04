import { api, API_BASE_URL } from "@/core/services/http/base.service";
import type {
  SalesAnalyticsData,
  TopBrandData,
  TopProductData,
  TopSellerData,
  AnalyticsParams,
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
