import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  QK,
  ensureSellerInfo,
  type AuthQueryData,
} from "../services/auth.service";
import type { SellerInfo } from "../types/seller.type";

export const useSellerAuth = () => {
  const qc = useQueryClient();

  // Get current user data
  const authData = qc.getQueryData<AuthQueryData>(QK.ME);
  const isSellerMember = authData?.user?.roleValue === "seller-member";

  // Query for seller info
  const sellerQuery = useQuery<SellerInfo>({
    queryKey: QK.SELLER_INFO,
    queryFn: async () => {
      const result = await ensureSellerInfo(qc);
      return result as SellerInfo;
    },
    enabled: isSellerMember, // Only run if user is seller-member
    staleTime: 0, // Always refetch to ensure fresh data
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  // Handle errors - but don't redirect to login since same pages can be accessed by other user types
  useEffect(() => {
    if (sellerQuery.isError) {
      console.error("Seller info fetch failed:", sellerQuery.error);
      // Log error but don't redirect - let the component handle the error state
    }
  }, [sellerQuery.isError, sellerQuery.error]);

  // If user is seller-member but seller info is not loading and not available, fetch it
  useEffect(() => {
    if (
      isSellerMember &&
      !sellerQuery.isLoading &&
      !sellerQuery.data &&
      !sellerQuery.isError
    ) {
      sellerQuery.refetch();
    }
  }, [
    isSellerMember,
    sellerQuery.isLoading,
    sellerQuery.data,
    sellerQuery.isError,
    sellerQuery.refetch,
  ]);

  // Helper functions
  const getAssignedAddresses = () => {
    return sellerQuery.data?.addresses || [];
  };

  const getCompanyId = () => {
    return sellerQuery.data?.companyId;
  };

  const getPrimaryAddress = () => {
    return (
      sellerQuery.data?.addresses.find((addr) => addr.isPrimary) ||
      sellerQuery.data?.addresses[0]
    );
  };

  return {
    sellerInfo: sellerQuery.data,
    isLoading: sellerQuery.isLoading,
    isError: sellerQuery.isError,
    error: sellerQuery.error,
    isSellerMember,
    refetch: sellerQuery.refetch,
    // Helper functions
    getAssignedAddresses,
    getCompanyId,
    getPrimaryAddress,
  };
};
