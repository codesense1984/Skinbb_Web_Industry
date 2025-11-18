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

export interface OrderStatusTimelineItem {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface OrderStatusResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    orderId: string;
    orderNumber: string;
    currentStatus: string;
    statusDescription: string;
    nextStep: string;
    returnStatus: string;
    cancellationReason?: string | null;
    timeline: OrderStatusTimelineItem[];
    orderDetails: {
      totalAmount: number;
      totalItems: number;
      paymentMode: string;
      createdAt: string;
      updatedAt: string;
    };
    payment: {
      status: string;
      amount: number;
      paymentMethod: string;
      transactionId: string;
    };
    shipment: {
      status: string;
      trackingNumber: string;
      carrier: string;
      estimatedDelivery: string;
    };
    returnDetails?: {
      status: string;
      reason: string;
      notes: string;
      requestedAt: string;
      approvedAt?: string;
      completedAt?: string;
    };
  };
}

export async function apiGetOrderStatus(orderId: string): Promise<OrderStatusResponse> {
  return api.get<OrderStatusResponse>(`/api/v1/orders/status/${orderId}`);
}

export interface CancelOrderRequest {
  reason: string;
}

export interface CancelOrderResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    orderId: string;
    orderNumber: string;
    status: string;
    message: string;
  };
}

export async function apiCancelOrderByAdmin(
  orderId: string,
  data: CancelOrderRequest,
): Promise<CancelOrderResponse> {
  return api.put<CancelOrderResponse>(
    `/api/v1/orders/admin/cancel/${orderId}`,
    data,
  );
}

export interface RefundOrderRequest {
  amount?: number;
  reason: string;
  notes?: {
    [key: string]: string;
  };
  receipt?: string;
}

export interface RefundOrderResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    id: string;
    status: string;
    amount: number;
  };
}

export async function apiRefundOrderByAdmin(
  orderIdOrNumber: string,
  data: RefundOrderRequest,
): Promise<RefundOrderResponse> {
  return api.post<RefundOrderResponse>(
    `/api/v1/orders/admin/${orderIdOrNumber}/refund`,
    data,
  );
}