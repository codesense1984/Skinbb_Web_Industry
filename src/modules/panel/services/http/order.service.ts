import { api } from "@/core/services/http";
import type { PaginationApiResponse, PaginationParams } from "@/core/types";
import { ENDPOINTS } from "../../config/endpoint.config";
import type { Order, OrderDetails } from "../../types/order.type";

export async function apiGetOrderList(
  params: PaginationParams,
  signal?: AbortSignal,
): Promise<PaginationApiResponse<{ orders: Order[] }>> {
  return api.get<PaginationApiResponse<{ orders: Order[] }>>(
    ENDPOINTS.ORDER.MAIN_ALL,
    { params, signal },
  );
}

export async function apiGetOrderById<T>(id: string) {
  return api.get<T>(ENDPOINTS.ORDER.MAIN_BY_ID(id));
}

export async function apiGetOrderDetails(id: string) {
  return api.get<{
    statusCode: number;
    success: boolean;
    message: string;
    data: OrderDetails;
  }>(`/api/v1/orders/admin/${id}`);
}