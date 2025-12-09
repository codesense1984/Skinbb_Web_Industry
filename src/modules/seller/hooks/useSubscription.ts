import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetCurrentSubscription } from "../services/http/subscription.service";
import { ENDPOINTS } from "../config/endpoint.config";
import type { Subscription } from "../types/subscription.types";

export function useSubscription() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [ENDPOINTS.SUBSCRIPTION.CURRENT],
    queryFn: ({ signal }) => apiGetCurrentSubscription(signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404/400/403 (no subscription or permission error) - the service handles it gracefully
      if (
        error?.response?.status === 404 ||
        error?.response?.status === 400 ||
        error?.response?.status === 403
      ) {
        return false;
      }
      return failureCount < 1;
    },
    // Suppress error toasts for permission/404 errors (they're handled gracefully)
    meta: {
      errorMessage: false, // Don't show error toast for this query
    },
  });

  // Check if response indicates no subscription (statusCode 404 in body, HTTP 404/400/403, or permission error)
  const errorMessage = error ? (error as Error).message : "";
  const isPermissionError = 
    errorMessage.toLowerCase().includes("permission") ||
    errorMessage.toLowerCase().includes("do not have permission") ||
    (error as any)?.response?.status === 403;

  const isNoSubscription = 
    data?.statusCode === 404 ||
    data?.statusCode === 400 ||
    !data?.data ||
    isPermissionError ||
    (error && (
      (error as any)?.response?.status === 404 ||
      (error as any)?.response?.status === 400 ||
      (error as any)?.response?.status === 403
    ));

  const subscription: Subscription | null = isNoSubscription ? null : (data?.data || null);
  
  // Only show error if it's not a "no subscription" or permission error case
  const displayError = isNoSubscription 
    ? null 
    : (error && !isPermissionError ? (error as Error).message : null);

  const refresh = async () => {
    await refetch();
  };

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [ENDPOINTS.SUBSCRIPTION.CURRENT],
    });
  };

  return {
    subscription,
    loading: isLoading,
    error: displayError,
    refresh,
    invalidate,
    hasSubscription: !!subscription,
    creditsRemaining: subscription?.totalCreditsRemaining || 0,
    isActive: subscription?.status === "active",
  };
}

