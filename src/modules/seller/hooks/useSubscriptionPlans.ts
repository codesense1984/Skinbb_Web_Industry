import { useQuery } from "@tanstack/react-query";
import { apiGetSubscriptionPlans } from "../services/http/subscription.service";
import { ENDPOINTS } from "../config/endpoint.config";

export function useSubscriptionPlans() {
  const { data, isLoading, error } = useQuery({
    queryKey: [ENDPOINTS.SUBSCRIPTION.PLANS],
    queryFn: ({ signal }) => apiGetSubscriptionPlans(signal),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    plans: data?.data || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}

