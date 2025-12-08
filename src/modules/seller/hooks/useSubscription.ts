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
      // Don't retry on 404 (no subscription) - the service handles it gracefully
      if (error?.response?.status === 404 || error?.response?.status === 400) {
        return false;
      }
      return failureCount < 1;
    },
  });

  // Check if response indicates no subscription (statusCode 404 in body or HTTP 404)
  const isNoSubscription = 
    data?.statusCode === 404 ||
    data?.statusCode === 400 ||
    !data?.data ||
    (error && (
      (error as any)?.response?.status === 404 ||
      (error as any)?.response?.status === 400
    ));

  const subscription: Subscription | null = isNoSubscription ? null : (data?.data || null);
  
  // Only show error if it's not a "no subscription" case
  const displayError = isNoSubscription 
    ? null 
    : (error ? (error as Error).message : null);

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

