import { FullLoader } from "@/core/components/ui/loader";
import { PageContent } from "@/core/components/ui/structure";
import { MODE } from "@/core/types";
import {
  apiGetCompanyLocationBrandById,
  apiUpdateBrandStatus,
  type BrandStatusUpdateRequest,
} from "@/modules/panel/services/http/company.service";
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
    mode !== MODE.ADD ? getDefaultValues(brandData?.data) : undefined;

  return (
    <PageContent
      header={{
        title,
        description,
        actions: mode === MODE.VIEW && (
          <Button
            onClick={() => setIsApprovalDialogOpen(true)}
            variant="outlined"
          >
            Manage Approval
          </Button>
        ),
      }}
    >
      <BrandForm
        mode={mode}
        defaultValues={defaultValues}
        onSubmit={onSubmit || (() => {})}
        submitting={submitting}
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
