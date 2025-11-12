import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { QK, type AuthQueryData, logout } from "../services/auth.service";
import { getSellerInfo } from "../services/http/auth.service";
import type { SellerInfo } from "../types/seller.type";
import { AUTH_ROUTES } from "../routes/constants";

export const useSellerAuth = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Get current user data
  const authData = qc.getQueryData<AuthQueryData>(QK.ME);
  const isSellerMember = ["seller-member", "seller"].includes(
    authData?.user?.roleValue || "",
  );

  // Query for seller info using useQuery
  const sellerQuery = useQuery<SellerInfo>({
    queryKey: [...QK.SELLER_INFO, authData?.user?._id],
    queryFn: async () => {
      if (!authData?.user?._id) {
        throw new Error("User ID not found in auth data");
      }

      const response = await getSellerInfo(authData.user._id);
      return response.data;
    },
    enabled: isSellerMember && !!authData?.user?._id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  // Update ME query data when seller info is successfully fetched
  useEffect(() => {
    if (sellerQuery.data && authData) {
      qc.setQueryData(QK.ME, {
        ...authData,
        sellerInfo: sellerQuery.data,
      });
    }
  }, [sellerQuery.data, authData, qc]);

  // Handle errors - redirect to logout if API fails
  useEffect(() => {
    if (sellerQuery.isError) {
      console.error("Seller info fetch failed:", sellerQuery.error);
      // Clear auth and redirect to login
      logout(qc).then(() => {
        navigate(AUTH_ROUTES.SIGN_IN, { replace: true });
      });
    }
  }, [sellerQuery.isError, sellerQuery.error, qc, navigate]);

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
