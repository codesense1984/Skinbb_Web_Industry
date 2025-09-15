import { useParams, useNavigate } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/solid";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import BrandForm from "../shared/brand-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { normalizeAxiosError } from "@/core/services/http";
import {
  apiGetCompanyLocationBrandById,
  apiUpdateBrandStatus,
  type BrandStatusUpdateRequest,
} from "@/modules/panel/services/http/company.service";
import { BrandApprovalDialog } from "../../company/brands/components/BrandApprovalDialog";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { AxiosError } from "axios";

const CompanyLocationBrandView = () => {
  const { companyId, locationId, brandId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  // Fetch brand data
  const { data: brandData } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: () => apiGetCompanyLocationBrandById(companyId!, locationId!, brandId!),
    enabled: !!brandId && !!companyId && !!locationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update brand status mutation (for approval)
  const updateStatusMutation = useMutation({
    mutationFn: (data: BrandStatusUpdateRequest) => {
      if (!user?._id) {
        throw new Error("Admin ID not found");
      }
      return apiUpdateBrandStatus(user._id, brandId!, data);
    },
    onSuccess: (response) => {
      toast.success(response.message || "Brand status updated successfully!");
      // Invalidate brand queries
      queryClient.invalidateQueries({
        queryKey: ["brand", brandId],
      });
      queryClient.invalidateQueries({
        queryKey: ["brands"],
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
    await updateStatusMutation.mutateAsync(data);
  };

  const brand = brandData?.data || brandData;

  // Debug logging
  console.log("Brand data:", brand);
  console.log("Brand status:", (brand as unknown as Record<string, unknown>)?.status);
  console.log("Brand brandStatus:", (brand as unknown as Record<string, unknown>)?.brandStatus);

  return (
    <PageContent
      header={{
        title: "Brand Details",
        description: "View brand information and details",
        actions: (
          <div className="flex gap-2">
            <Button
              onClick={() =>
                navigate(
                  PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId!, locationId!),
                )
              }
              variant="outlined"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Brands
            </Button>
            <Button
              onClick={() => setIsApprovalDialogOpen(true)}
              variant="outlined"
              color="secondary"
            >
              Manage Approval
            </Button>
            <Button
              onClick={() =>
                navigate(
                  PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(
                    companyId!,
                    locationId!,
                    brandId!,
                  ),
                )
              }
              variant="contained"
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit Brand
            </Button>
          </div>
        ),
      }}
    >
      <BrandForm />

      <BrandApprovalDialog
        isOpen={isApprovalDialogOpen}
        onClose={() => setIsApprovalDialogOpen(false)}
        onApprove={handleApproval}
        brandName={(brand as unknown as Record<string, unknown>)?.name as string}
        isLoading={updateStatusMutation.isPending}
      />
    </PageContent>
  );
};

export default CompanyLocationBrandView;
