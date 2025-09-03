import { api } from "@/core/services/http";
import type { 
  ProductListResponse, 
  ProductListParams,
  BrandListResponse,
  CategoryListResponse,
  TagListResponse
} from "@/modules/panel/types/product.type";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

export async function apiGetProducts(
  params?: ProductListParams,
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.search) searchParams.append('search', params.search);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.order) searchParams.append('order', params.order);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.brand) searchParams.append('brand', params.brand);
  if (params?.tag) searchParams.append('tag', params.tag);
  if (params?.status) searchParams.append('status', params.status);

  const queryString = searchParams.toString();
  const url = queryString ? `${ENDPOINTS.PRODUCT.MAIN}?${queryString}` : ENDPOINTS.PRODUCT.MAIN;
  
  return api.get<ProductListResponse>(url, { signal });
}

export async function apiGetBrandsForDropdown(
  params?: { search?: string; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<BrandListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.search) searchParams.append('search', params.search);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString ? `${ENDPOINTS.BRAND.MAIN}/all?${queryString}` : `${ENDPOINTS.BRAND.MAIN}/all`;
  
  return api.get<BrandListResponse>(url, { signal });
}

export async function apiGetCategoriesForDropdown(
  params?: { search?: string; page?: number; limit?: number; parentCategory?: string },
  signal?: AbortSignal,
): Promise<CategoryListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.search) searchParams.append('search', params.search);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.parentCategory) searchParams.append('parentCategory', params.parentCategory);

  const queryString = searchParams.toString();
  const url = queryString ? `${ENDPOINTS.PRODUCT.CATEGORY}?${queryString}` : ENDPOINTS.PRODUCT.CATEGORY;
  
  return api.get<CategoryListResponse>(url, { signal });
}

export async function apiGetTagsForDropdown(
  params?: { search?: string; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<TagListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.search) searchParams.append('search', params.search);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString ? `${ENDPOINTS.PRODUCT.TAG_LIST}?${queryString}` : ENDPOINTS.PRODUCT.TAG_LIST;
  
  return api.get<TagListResponse>(url, { signal });
}
