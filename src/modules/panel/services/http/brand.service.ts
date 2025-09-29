import { api } from "@/core/services/http";
import type {
  BrandListResponse,
  BrandListParams,
} from "@/modules/panel/types/brand.type";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

export async function apiGetBrands(
  params?: BrandListParams,
  signal?: AbortSignal,
): Promise<BrandListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.order) searchParams.append("order", params.order);
  if (params?.search) searchParams.append("search", params.search);
  if (params?.companyId) searchParams.append("companyId", params.companyId);
  if (params?.locationId) searchParams.append("locationId", params.locationId);

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.BRAND.MAIN_ALL}?${queryString}`
    : ENDPOINTS.BRAND.MAIN_ALL;

  return api.get<BrandListResponse>(url, { signal });
}
