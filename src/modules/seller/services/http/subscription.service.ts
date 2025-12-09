import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/seller/config/endpoint.config";
import type { AxiosError } from "axios";
import type {
  SubscriptionResponse,
  SubscriptionPlansResponse,
  InitiatePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  PaymentStatusResponse,
  CreditHistoryResponse,
} from "@/modules/seller/types/subscription.types";

/**
 * Get current subscription
 * Handles 404 responses gracefully (no subscription found)
 * Handles 403 permission errors gracefully
 */
export async function apiGetCurrentSubscription(
  signal?: AbortSignal,
): Promise<SubscriptionResponse> {
  try {
    const response = await api.get<SubscriptionResponse>(ENDPOINTS.SUBSCRIPTION.CURRENT, {
      signal,
    });
    
    // Check if response body indicates no subscription (statusCode 404 in body)
    if (response?.statusCode === 404 || response?.statusCode === 400) {
      return {
        ...response,
        data: null,
      };
    }
    
    return response;
  } catch (error: unknown) {
    // Type guard for AxiosError
    const axiosError = error as AxiosError<{ statusCode?: number; message?: string }>;
    
    // Handle HTTP 404/400 errors - return a normalized response instead of throwing
    if (axiosError?.response?.status === 404 || axiosError?.response?.status === 400) {
      // Check if error response has a body with statusCode
      const errorData = axiosError.response?.data;
      if (errorData && (errorData.statusCode === 404 || errorData.statusCode === 400)) {
        return {
          statusCode: errorData.statusCode || 404,
          data: null,
          message: errorData.message || "No active subscription found",
          success: false,
        };
      }
      
      // Return normalized 404 response
      return {
        statusCode: 404,
        data: null,
        message: "No active subscription found",
        success: false,
      };
    }

    // Handle HTTP 403 permission errors - treat as no subscription for now
    // This prevents permission errors from blocking the UI
    if (axiosError?.response?.status === 403) {
      const errorData = axiosError.response?.data;
      // Check if it's a permission error about subscription access
      const errorMessage = errorData?.message || axiosError.message || "";
      if (
        errorMessage.toLowerCase().includes("permission") ||
        errorMessage.toLowerCase().includes("access") ||
        errorMessage.toLowerCase().includes("subscription")
      ) {
        // Return normalized response - treat as no subscription
        return {
          statusCode: 404,
          data: null,
          message: "No active subscription found",
          success: false,
        };
      }
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Get available subscription plans
 */
export async function apiGetSubscriptionPlans(
  signal?: AbortSignal,
): Promise<SubscriptionPlansResponse> {
  return api.get<SubscriptionPlansResponse>(ENDPOINTS.SUBSCRIPTION.PLANS, {
    signal,
  });
}

/**
 * Initiate payment for a subscription plan
 */
export async function apiInitiatePayment(
  planId: string,
  signal?: AbortSignal,
): Promise<InitiatePaymentResponse> {
  return api.post<InitiatePaymentResponse>(
    ENDPOINTS.SUBSCRIPTION.INITIATE_PAYMENT(planId),
    undefined,
    { signal },
  );
}

/**
 * Verify payment after Razorpay callback
 */
export async function apiVerifyPayment(
  planId: string,
  paymentData: VerifyPaymentRequest,
  signal?: AbortSignal,
): Promise<VerifyPaymentResponse> {
  return api.post<VerifyPaymentResponse>(
    ENDPOINTS.SUBSCRIPTION.VERIFY_PAYMENT(planId),
    paymentData,
    { signal },
  );
}

/**
 * Get payment status
 */
export async function apiGetPaymentStatus(
  planId: string,
  signal?: AbortSignal,
): Promise<PaymentStatusResponse> {
  return api.get<PaymentStatusResponse>(
    ENDPOINTS.SUBSCRIPTION.PAYMENT_STATUS(planId),
    { signal },
  );
}

/**
 * Get credit history
 */
export async function apiGetCreditHistory(
  page: number = 1,
  limit: number = 50,
  signal?: AbortSignal,
): Promise<CreditHistoryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return api.get<CreditHistoryResponse>(
    `${ENDPOINTS.SUBSCRIPTION.CREDIT_HISTORY}?${params.toString()}`,
    { signal },
  );
}

