import { useQuery } from "@tanstack/react-query";
import { apiGetCreditHistory } from "../services/http/subscription.service";
import { ENDPOINTS } from "../config/endpoint.config";

export function useCreditHistory(page: number = 1, limit: number = 50) {
  const { data, isLoading, error } = useQuery({
    queryKey: [ENDPOINTS.SUBSCRIPTION.CREDIT_HISTORY, page, limit],
    queryFn: ({ signal }) => apiGetCreditHistory(page, limit, signal),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    history: data?.data || null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}

