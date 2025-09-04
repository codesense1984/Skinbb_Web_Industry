import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { QK } from "../services/auth.service";
import type { SellerInfo } from "../types/seller.type";

export const useSellerInfo = () => {
  const query = useQuery<SellerInfo>({
    queryKey: QK.SELLER_INFO,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  // Handle errors - log but don't redirect since same pages can be accessed by other user types
  useEffect(() => {
    if (query.isError) {
      console.error("Seller info fetch failed:", query.error);
      // Log error but don't redirect - let the component handle the error state
    }
  }, [query.isError, query.error]);

  return {
    sellerInfo: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};
