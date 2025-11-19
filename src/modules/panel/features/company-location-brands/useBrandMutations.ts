import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  apiCreateCompanyLocationBrandJson,
  apiUpdateCompanyLocationBrand,
} from "@/modules/panel/services/http/company.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ENDPOINTS } from "../../config/endpoint.config";
import type { BrandFormData } from "./brand.schema";
import {
  BRAND_ERROR_MESSAGES,
  BRAND_MESSAGES,
  BRAND_QUERY_KEYS,
  createBrandFormData,
} from "./brand.utils";

/**
 * Custom hook for brand creation mutation
 */
export const useBrandCreateMutation = () => {
  const { companyId, locationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BrandFormData) => {
      if (!companyId || !locationId) {
        throw new Error(BRAND_ERROR_MESSAGES.MISSING_IDS);
      }

      const formData = createBrandFormData(data);
      return apiCreateCompanyLocationBrandJson(companyId, locationId, formData);
    },
    onSuccess: () => {
      toast.success(BRAND_MESSAGES.CREATE_SUCCESS);

      // Invalidate and refetch the brands list
      queryClient.invalidateQueries({
        queryKey: [
          ENDPOINTS.COMPANY_LOCATION_BRANDS.LIST(companyId!, locationId!),
        ],
      });

      // Navigate back to brands list
      navigate(
        PANEL_ROUTES.BRAND.LIST +
          `?companyId=${companyId}&locationId=${locationId}`,
      );
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(error?.message ?? BRAND_MESSAGES.CREATE_ERROR);
    },
  });
};

/**
 * Custom hook for brand update mutation
 */
export const useBrandUpdateMutation = () => {
  const { companyId, locationId, brandId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BrandFormData) => {
      if (!companyId || !locationId || !brandId) {
        throw new Error(BRAND_ERROR_MESSAGES.MISSING_BRAND_ID);
      }
      const formData = createBrandFormData(data);
      return apiUpdateCompanyLocationBrand(
        companyId,
        locationId,
        brandId,
        formData,
      );
    },
    onSuccess: () => {
      toast.success(BRAND_MESSAGES.UPDATE_SUCCESS);

      // Invalidate and refetch the brands list
      queryClient.invalidateQueries({
        queryKey: [
          ENDPOINTS.COMPANY_LOCATION_BRANDS.LIST(companyId!, locationId!),
        ],
      });
      // Navigate back to brands list
      navigate(
        PANEL_ROUTES.BRAND.LIST +
          `?companyId=${companyId}&locationId=${locationId}`,
      );
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(error?.message ?? BRAND_MESSAGES.UPDATE_ERROR);
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
