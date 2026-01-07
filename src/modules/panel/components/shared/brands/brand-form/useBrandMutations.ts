import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  apiCreateCompanyLocationBrandJson,
  apiUpdateCompanyLocationBrand,
} from "@/modules/panel/services/http/company.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  BRAND_ERROR_MESSAGES,
  BRAND_MESSAGES,
  BRAND_QUERY_KEYS,
  createBrandFormData,
} from "./brand.utils";
import type { BrandSubmitRequest } from "./types";

/**
 * Custom hook for brand creation mutation
 */
export const useBrandCreateMutation = (navigateTo?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, locationId, data }: BrandSubmitRequest) => {
      const formData = createBrandFormData(
        data as unknown as Record<string, unknown>,
      );
      return apiCreateCompanyLocationBrandJson(companyId, locationId, formData);
    },
    onSuccess: (_, variables) => {
      const { companyId, locationId } = variables;
      toast.success(BRAND_MESSAGES.CREATE_SUCCESS);

      // Invalidate and refetch the brands list
      queryClient.invalidateQueries({
        queryKey: [
          ENDPOINTS.COMPANY_LOCATION_BRANDS.LIST(companyId, locationId),
        ],
      });

      if (navigateTo) {
        navigate(navigateTo);
      } else {
        navigate(
          PANEL_ROUTES.BRAND.LIST +
            `?companyId=${companyId}&locationId=${locationId}&?order=desc&sortBy=createdAt`,
          {
            replace: true,
          },
        );
      }
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error?.response?.data?.message ?? BRAND_MESSAGES.CREATE_ERROR,
      );
    },
  });
};

/**
 * Custom hook for brand update mutation
 */
export const useBrandUpdateMutation = (navigateTo?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      locationId,
      brandId,
      data,
    }: BrandSubmitRequest) => {
      if (!companyId || !locationId || !brandId) {
        throw new Error(BRAND_ERROR_MESSAGES.MISSING_BRAND_ID);
      }
      const formData = createBrandFormData(
        data as unknown as Record<string, unknown>,
      );
      return apiUpdateCompanyLocationBrand(
        companyId,
        locationId,
        brandId,
        formData,
      );
    },
    onSuccess: (_, variables) => {
      const { companyId, locationId } = variables;
      toast.success(BRAND_MESSAGES.UPDATE_SUCCESS);

      // Invalidate and refetch the brands list
      queryClient.invalidateQueries({
        queryKey: [
          ENDPOINTS.COMPANY_LOCATION_BRANDS.LIST(companyId, locationId),
        ],
      });

      // Navigate back to brands list
      if (navigateTo) {
        navigate(navigateTo);
      } else {
        navigate(
          PANEL_ROUTES.BRAND.LIST +
            `?companyId=${companyId}&locationId=${locationId}`,
          {
            replace: true,
          },
        );
      }
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error?.response?.data?.message ?? BRAND_MESSAGES.UPDATE_ERROR,
      );
    },
  });
};

/**
 * Custom hook for brand data fetching
 */
export const useBrandData = (brandId: string) => {
  const { companyId, locationId } = useParams();

  return {
    companyId,
    locationId,
    brandId,
    queryKey: BRAND_QUERY_KEYS.BRAND_DETAIL(companyId!, locationId!, brandId),
    enabled: !!(brandId && companyId && locationId),
  };
};
