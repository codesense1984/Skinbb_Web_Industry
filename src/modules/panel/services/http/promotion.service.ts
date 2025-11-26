import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import type {
  Promotion,
  PromotionListParams,
  PromotionListResponse,
  PromotionResponse,
  PromotionStatsResponse,
  PromotionCreateRequest,
  PromotionUpdateRequest,
  ActivePromotionParams,
  CuratedStoresProductsParams,
  CuratedStoresProductsResponse,
} from "@/modules/panel/types/promotion.type";
import { createFormData } from "@/core/utils/formdata.utils";

/**
 * Get all promotions with filters and pagination
 */
export async function apiGetPromotions(
  params?: PromotionListParams,
  signal?: AbortSignal,
): Promise<PromotionListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.search) searchParams.append("search", params.search);
  if (params?.placement) searchParams.append("placement", params.placement);
  if (params?.isActive !== undefined)
    searchParams.append("isActive", String(params.isActive));
  if (params?.promotionType)
    searchParams.append("promotionType", params.promotionType);
  if (params?.startDate) searchParams.append("startDate", params.startDate);
  if (params?.endDate) searchParams.append("endDate", params.endDate);
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);
  if (params?.productId) searchParams.append("productId", params.productId);
  if (params?.brandId) searchParams.append("brandId", params.brandId);
  if (params?.categoryId)
    searchParams.append("categoryId", params.categoryId);
  if (params?.tagId) searchParams.append("tagId", params.tagId);

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.PROMOTION.LIST}?${queryString}`
    : ENDPOINTS.PROMOTION.LIST;

  return api.get<PromotionListResponse>(url, { signal });
}

/**
 * Get promotion by ID
 */
export async function apiGetPromotionById(
  id: string,
  signal?: AbortSignal,
): Promise<PromotionResponse> {
  return api.get<PromotionResponse>(ENDPOINTS.PROMOTION.GET_BY_ID(id), {
    signal,
  });
}

/**
 * Create a new promotion
 */
export async function apiCreatePromotion(
  adminId: string,
  data: PromotionCreateRequest,
): Promise<PromotionResponse> {
  const formData = new FormData();

  // Handle image - can be File or Media ID string
  // File input component stores files in image_files array, check that first
  let imageValue: File | string | undefined = undefined;
  
  // Check image_files first (file input component stores here)
  if ((data as any).image_files && Array.isArray((data as any).image_files) && (data as any).image_files.length > 0) {
    const file = (data as any).image_files[0];
    if (file instanceof File) {
      imageValue = file;
    }
  }
  
  // Fallback to image field if image_files not found
  if (!imageValue && data.image) {
    if (data.image instanceof File) {
      imageValue = data.image;
    } else if (typeof data.image === "string") {
      // Only accept string if it looks like a valid ObjectId (24 hex characters)
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (objectIdPattern.test(data.image)) {
        imageValue = data.image;
      }
      // If it's a file path string (like "C:\fakepath\..."), ignore it
    }
  }
  
  if (imageValue) {
    formData.append("image", imageValue);
  }

  // Append other fields
  formData.append("title", data.title);
  if (data.subtitle) formData.append("subtitle", data.subtitle);
  if (data.redirectUrl) formData.append("redirectUrl", data.redirectUrl);
  if (data.linkType) formData.append("linkType", data.linkType);
  if (data.promotionType)
    formData.append("promotionType", data.promotionType);
  if (data.placement) formData.append("placement", data.placement);
  if (data.priority !== undefined)
    formData.append("priority", String(data.priority));
  if (data.startAt) formData.append("startAt", data.startAt);
  if (data.endAt) formData.append("endAt", data.endAt);
  if (data.isActive !== undefined)
    formData.append("isActive", String(data.isActive));
  if (data.allowOverlap !== undefined)
    formData.append("allowOverlap", String(data.allowOverlap));

  // Handle array fields
  if (data.brandIds && data.brandIds.length > 0) {
    data.brandIds.forEach((id) => formData.append("brandIds", id));
  }
  if (data.productIds && data.productIds.length > 0) {
    data.productIds.forEach((id) => formData.append("productIds", id));
  }
  if (data.categoryIds && data.categoryIds.length > 0) {
    data.categoryIds.forEach((id) => formData.append("categoryIds", id));
  }
  if (data.tagIds && data.tagIds.length > 0) {
    data.tagIds.forEach((id) => formData.append("tagIds", id));
  }

  return api.post<PromotionResponse>(
    ENDPOINTS.PROMOTION.CREATE(adminId),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
}

/**
 * Update a promotion
 */
export async function apiUpdatePromotion(
  id: string,
  data: PromotionUpdateRequest,
): Promise<PromotionResponse> {
  const formData = new FormData();

  // Handle image - can be File or Media ID string
  // File input component stores files in image_files array, check that first
  let imageValue: File | string | undefined = undefined;
  
  // Check image_files first (file input component stores here)
  if ((data as any).image_files && Array.isArray((data as any).image_files) && (data as any).image_files.length > 0) {
    const file = (data as any).image_files[0];
    if (file instanceof File) {
      imageValue = file;
    }
  }
  
  // Fallback to image field if image_files not found
  if (!imageValue && data.image) {
    if (data.image instanceof File) {
      imageValue = data.image;
    } else if (typeof data.image === "string") {
      // Only accept string if it looks like a valid ObjectId (24 hex characters)
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (objectIdPattern.test(data.image)) {
        imageValue = data.image;
      }
      // If it's a file path string (like "C:\fakepath\..."), ignore it
    }
  }
  
  if (imageValue) {
    formData.append("image", imageValue);
  }

  // Append other fields (only if provided)
  if (data.title) formData.append("title", data.title);
  if (data.subtitle !== undefined) formData.append("subtitle", data.subtitle);
  if (data.redirectUrl !== undefined)
    formData.append("redirectUrl", data.redirectUrl);
  if (data.linkType) formData.append("linkType", data.linkType);
  if (data.promotionType)
    formData.append("promotionType", data.promotionType);
  if (data.placement) formData.append("placement", data.placement);
  if (data.priority !== undefined)
    formData.append("priority", String(data.priority));
  if (data.startAt) formData.append("startAt", data.startAt);
  if (data.endAt) formData.append("endAt", data.endAt);
  if (data.isActive !== undefined)
    formData.append("isActive", String(data.isActive));
  if (data.allowOverlap !== undefined)
    formData.append("allowOverlap", String(data.allowOverlap));

  // Handle array fields
  if (data.brandIds) {
    // Clear existing by sending empty array or new values
    data.brandIds.forEach((id) => formData.append("brandIds", id));
  }
  if (data.productIds) {
    data.productIds.forEach((id) => formData.append("productIds", id));
  }
  if (data.categoryIds) {
    data.categoryIds.forEach((id) => formData.append("categoryIds", id));
  }
  if (data.tagIds) {
    data.tagIds.forEach((id) => formData.append("tagIds", id));
  }

  return api.put<PromotionResponse>(ENDPOINTS.PROMOTION.UPDATE(id), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * Toggle promotion status (active/inactive)
 */
export async function apiTogglePromotionStatus(
  id: string,
): Promise<PromotionResponse> {
  return api.patch<PromotionResponse>(ENDPOINTS.PROMOTION.TOGGLE_STATUS(id));
}

/**
 * Delete a promotion
 */
export async function apiDeletePromotion(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return api.delete<{ success: boolean; message: string }>(
    ENDPOINTS.PROMOTION.DELETE(id),
  );
}

/**
 * Get promotion statistics
 */
export async function apiGetPromotionStats(
  signal?: AbortSignal,
): Promise<PromotionStatsResponse> {
  return api.get<PromotionStatsResponse>(ENDPOINTS.PROMOTION.STATS, {
    signal,
  });
}

/**
 * Get active promotions (public endpoint)
 */
export async function apiGetActivePromotions(
  params: ActivePromotionParams,
  signal?: AbortSignal,
): Promise<{ success: boolean; data: Promotion[] }> {
  const searchParams = new URLSearchParams();
  searchParams.append("placement", params.placement);
  if (params.productId) searchParams.append("productId", params.productId);
  if (params.brandId) searchParams.append("brandId", params.brandId);
  if (params.categoryId) searchParams.append("categoryId", params.categoryId);
  if (params.tagId) searchParams.append("tagId", params.tagId);
  if (params.limit) searchParams.append("limit", String(params.limit));

  const url = `${ENDPOINTS.PROMOTION.ACTIVE}?${searchParams.toString()}`;
  return api.get<{ success: boolean; data: Promotion[] }>(url, { signal });
}

/**
 * Get curated stores products
 */
export async function apiGetCuratedStoresProducts(
  promotionId: string,
  params?: CuratedStoresProductsParams,
  signal?: AbortSignal,
): Promise<CuratedStoresProductsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.PROMOTION.CURATED_STORES_PRODUCTS(promotionId)}?${queryString}`
    : ENDPOINTS.PROMOTION.CURATED_STORES_PRODUCTS(promotionId);

  return api.get<CuratedStoresProductsResponse>(url, { signal });
}

