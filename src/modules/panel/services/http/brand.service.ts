import { api } from "@/core/services/http";
import type {
  BrandListResponse,
  BrandListParams,
} from "@/modules/panel/types/brand.type";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { createFormData } from "@/core/utils/formdata.utils";

export async function apiGetBrands(
  params?: BrandListParams,
  signal?: AbortSignal,
): Promise<BrandListResponse> {
  // const searchParams = new URLSearchParams();

  // if (params?.page) searchParams.append("page", params.page.toString());
  // if (params?.limit) searchParams.append("limit", params.limit.toString());
  // if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  // if (params?.order) searchParams.append("order", params.order);
  // if (params?.search) searchParams.append("search", params.search);
  // if (params?.companyId) searchParams.append("companyId", params.companyId);
  // if (params?.locationId) searchParams.append("locationId", params.locationId);

  // const queryString = searchParams.toString();
  // const url = false
  //   ? `${ENDPOINTS.BRAND.MAIN_ALL}?${queryString}`
  //   : ENDPOINTS.BRAND.MAIN_ALL;

  return api.get<BrandListResponse>(ENDPOINTS.BRAND.MAIN_ALL, {
    signal,
    params: params,
  });
}

// Get brand by ID
export async function apiGetBrandById<T>(id: string) {
  return api.get<T>(ENDPOINTS.BRAND.MAIN_BY_ID(id));
}

// Create brand
export async function apiCreateBrand<T>(data: FormData) {
  return api.post<T>(ENDPOINTS.BRAND.MAIN, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// Update brand by ID
export async function apiUpdateBrandById<T>(
  id: string,
  data: Record<string, unknown>,
) {
  const formData = createFormData(data, [
    "brand_logo_files",
    "brand_authorization_letter_files",
    "sellingOn",
  ]);
  return api.put<T>(ENDPOINTS.BRAND.MAIN_BY_ID(id), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// Delete brand by ID
export async function apiDeleteBrandById<T>(id: string) {
  return api.delete<T>(ENDPOINTS.BRAND.MAIN_BY_ID(id));
}
