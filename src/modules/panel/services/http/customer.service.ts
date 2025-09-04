import { api } from "@/core/services/http";
import type { CustomerListResponse, CustomerListParams } from "@/modules/panel/types/customer.type";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

export async function apiGetCustomers(
  params?: CustomerListParams,
  signal?: AbortSignal,
): Promise<CustomerListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.query) searchParams.append('query', params.query);
  if (params?.sort?.order) searchParams.append('sort[order]', params.sort.order);
  if (params?.sort?.key) searchParams.append('sort[key]', params.sort.key);

  const queryString = searchParams.toString();
  const url = queryString ? `${ENDPOINTS.USER.CUSTOMERS}?${queryString}` : ENDPOINTS.USER.CUSTOMERS;
  
  return api.get<CustomerListResponse>(url, { signal });
}
