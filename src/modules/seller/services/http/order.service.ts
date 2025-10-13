import { api } from "@/core/services/http";
import type { PaginationApiResponse, PaginationParams } from "@/core/types";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import type { Order, OrderDetails } from "@/modules/panel/types/order.type";

export async function apiGetSellerOrderList(
  params: PaginationParams & { companyId?: string },
  signal?: AbortSignal,
): Promise<PaginationApiResponse<{ orders: Order[] }>> {
  return api.get<PaginationApiResponse<{ orders: Order[] }>>(
    ENDPOINTS.ORDER.MAIN_ALL,
    { params, signal },
  );
}

export async function apiGetSellerOrderById<T>(id: string) {
  return api.get<T>(ENDPOINTS.ORDER.MAIN_BY_ID(id));
}

export async function apiGetSellerOrderDetails(id: string) {
  return api.get<{
    statusCode: number;
    success: boolean;
    message: string;
    data: OrderDetails;
  }>(`/api/v1/orders/seller/${id}`);
}
