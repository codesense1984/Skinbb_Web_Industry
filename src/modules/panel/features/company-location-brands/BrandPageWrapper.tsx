import { FullLoader } from "@/core/components/ui/loader";
import { PageContent } from "@/core/components/ui/structure";
import { MODE } from "@/core/types";
import {
  apiGetCompanyLocationBrandById,
  apiUpdateBrandStatus,
  type BrandStatusUpdateRequest,
  apiGetCompanyDetailById,
} from "@/modules/panel/services/http/company.service";
import { apiGetCompanyLocationById } from "@/modules/panel/services/http/company-location.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import BrandForm, { getDefaultValues } from "./brand-form";
import type { BrandFormData } from "./brand.schema";
import { BRAND_MESSAGES } from "./brand.utils";
import { useBrandData } from "./useBrandMutations";
import { useState } from "react";
import { queryClient } from "@/core/utils";
import type { AxiosError } from "axios";
import { normalizeAxiosError } from "@/core/services/http";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { Button } from "@/core/components/ui/button";
import { BrandApprovalDialog } from "../company/brands/components/BrandApprovalDialog";
import { ENDPOINTS } from "../../config/endpoint.config";
import { WithAccess } from "@/modules/auth/components/guard";
import { ROLE } from "@/modules/auth/types/permission.type.";
import { STATUS_MAP } from "@/core/config/status";
import { StatusBadge } from "@/core/components/ui/badge";

interface BrandPageWrapperProps {
  mode: MODE;
  title: string;
  description: string;
  onSubmit?: (data: BrandFormData) => void;
  submitting?: boolean;
  brandId?: string;
}

/**
 * Reusable wrapper component for brand pages (create/edit)
 * Handles data fetching for edit mode and provides consistent page structure
 */
export const BrandPageWrapper = ({
  mode,
  title,
  description,
  onSubmit,
  submitting = false,
  brandId,
}: BrandPageWrapperProps) => {
  const { companyId, locationId, queryKey, enabled } = useBrandData(
    brandId || "",
  );

  const { userId } = useAuth();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  // Fetch company data
  const {
    data: companyData,
    isLoading: isLoadingCompany,
  } = useQuery({
    queryKey: [ENDPOINTS.COMPANY.DETAIL(companyId!)],
    queryFn: () => apiGetCompanyDetailById(companyId!, userId!),
    enabled: !!companyId && !!userId,
  });

  // Fetch location data
  const {
    data: locationData,
    isLoading: isLoadingLocation,
  } = useQuery({
    queryKey: [ENDPOINTS.COMPANY.LOCATION_DETAILS(companyId!, locationId!)],
    queryFn: () => apiGetCompanyLocationById(companyId!, locationId!),
    enabled: !!companyId && !!locationId,
  });

  // Fetch brand data for edit mode
  const {
    data: brandData,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey,
    queryFn: () =>
      apiGetCompanyLocationBrandById(companyId!, locationId!, brandId!),
    enabled: enabled && mode !== MODE.ADD,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: BrandStatusUpdateRequest) => {
      return apiUpdateBrandStatus(userId!, brandId!, data);
    },
    onSuccess: (response) => {
      toast.success(response.message || "Brand status updated successfully!");
      queryClient.invalidateQueries({
        queryKey: [
          ENDPOINTS.COMPANY_LOCATION_BRANDS.LIST(companyId!, locationId!),
        ],
      });
      setIsApprovalDialogOpen(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        normalizeAxiosError(error)?.message ||
          "Failed to update brand status. Please try again.",
      );
    },
  });

  const handleApproval = async (data: BrandStatusUpdateRequest) => {
    if (!userId) {
      throw new Error("Admin ID not found");
    }
    await updateStatusMutation.mutateAsync(data);
  };

  if (isLoading) {
    return <FullLoader />;
  }

  if (fetchError) {
    toast.error(fetchError?.message || BRAND_MESSAGES.LOAD_ERROR);
    return null;
  }

  const defaultValues =
    mode !== MODE.ADD 
      ? getDefaultValues(brandData?.data, companyId, locationId) 
      : getDefaultValues(undefined, companyId, locationId);

  return (
    <PageContent
      header={{
        title,
        description,
        actions: (
          <div className="flex flex-wrap gap-3">
            {(mode === MODE.VIEW || mode === MODE.EDIT) && (
              <StatusBadge
                status={brandData?.data?.status || ""}
                module="brand"
                variant="badge"
              >
                {brandData?.data?.status}
              </StatusBadge>
            )}
            {mode === MODE.VIEW &&
              [
                STATUS_MAP.brand.pending.value,
                STATUS_MAP.brand.rejected.value,
              ].includes(brandData?.data?.status || "") && (
                <WithAccess roles={[ROLE.ADMIN]}>
                  <Button
                    onClick={() => setIsApprovalDialogOpen(true)}
                    variant="outlined"
                  >
                    Manage Approval
                  </Button>
                </WithAccess>
              )}
          </div>
        ),
      }}
    >
      <BrandForm
        mode={mode}
        defaultValues={defaultValues}
        onSubmit={onSubmit || (() => {})}
        submitting={submitting}
        companyOptions={companyData?.data ? [{ label: companyData.data.companyName, value: companyId! }] : []}
        locationOptions={locationData?.data ? [{ label: `${locationData.data.city}, ${locationData.data.state}`, value: locationId! }] : []}
      />
      <BrandApprovalDialog
        isOpen={isApprovalDialogOpen}
        onClose={() => setIsApprovalDialogOpen(false)}
        onApprove={handleApproval}
        brandName={brandData?.data.name ?? ""}
        isLoading={updateStatusMutation.isPending}
      />
    </PageContent>
  );
};
