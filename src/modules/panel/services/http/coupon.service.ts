import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import type { ApiResponse } from "@/core/types";

export interface Coupon {
  _id: string;
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed_amount" | "free_product";
  discountValue: number;
  type: "product" | "cart" | "bogo";
  isActive: boolean;
  status: "active" | "expired" | "inactive";
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  // New fields
  selectedProducts?: string[];
  freeProducts?: string[];
  enableUsageLimit?: boolean;
  enableMinimumSpend?: boolean;
  enableMinimumQuantity?: boolean;
  enableMaxDiscountValue?: boolean;
  minimumSpend?: number;
  minimumQuantity?: number;
  maxDiscountValue?: number;
}

export interface CouponListResponse {
  coupons: Coupon[];
  totalRecords: number;
  totalPages: number;
}

export interface CreateCouponRequest {
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed_amount" | "free_product";
  discountValue: number;
  type: "product" | "cart" | "bogo";
  isActive: boolean;
  usageLimit: number;
  validFrom: string;
  expiresAt: string;
  // New fields
  selectedProducts?: string[];
  freeProducts?: string[];
  enableUsageLimit?: boolean;
  enableMinimumSpend?: boolean;
  enableMinimumQuantity?: boolean;
  enableMaxDiscountValue?: boolean;
  minimumSpend?: number;
  minimumQuantity?: number;
  maxDiscountValue?: number;
  applyTo?: {
    products: Array<{
      id: string;
      variantIds: string[];
    }>;
    freeProducts?: Array<{
      id: string;
      variantIds: string[];
    }>;
  };
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {
  _id: string;
}

// Get all coupons with pagination and filters
export async function apiGetCoupons(params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
  search?: string;
}) {
  return api.get<ApiResponse<CouponListResponse>>(ENDPOINTS.COUPON.LIST, {
    params: params || {},
  });
}

// Get coupon by ID
export async function apiGetCouponById(id: string) {
  return api.get<ApiResponse<Coupon>>(ENDPOINTS.COUPON.GET_BY_ID(id));
}

// Create new coupon
export async function apiCreateCoupon(data: CreateCouponRequest) {
  return api.post<ApiResponse<Coupon>>(ENDPOINTS.COUPON.CREATE, data);
}

// Update coupon
export async function apiUpdateCoupon(id: string, data: UpdateCouponRequest) {
  return api.put<ApiResponse<Coupon>>(ENDPOINTS.COUPON.UPDATE(id), data);
}

// Delete coupon
export async function apiDeleteCoupon(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(
    ENDPOINTS.COUPON.DELETE(id),
  );
}

// Toggle coupon status
export async function apiToggleCouponStatus(id: string) {
  return api.put<ApiResponse<Coupon>>(
    `${ENDPOINTS.COUPON.UPDATE(id)}/toggle-status`,
    { id },
  );
}
