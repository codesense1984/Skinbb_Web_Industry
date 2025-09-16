import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { normalizeAxiosError } from "@/core/services/http";
import { MODE } from "@/core/types";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  apiUpdateBrandStatus,
  type BrandStatusUpdateRequest,
} from "@/modules/panel/services/http/company.service";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/solid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { BrandApprovalDialog } from "../../company/brands/components/BrandApprovalDialog";
import { BrandPageWrapper } from "../BrandPageWrapper";

const CompanyLocationBrandView = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

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

  return (
    // <PageContent
    //   header={{
    //     title: "Brand Details",
    //     description: "View brand information and details",
    //     actions: (
    //       <div className="flex gap-2">
    //         <Button
    //           onClick={() =>
    //             navigate(
    //               PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId!, locationId!),
    //             )
    //           }
    //           variant="outlined"
    //         >
    //           <ArrowLeftIcon className="mr-2 h-4 w-4" />
    //           Back to Brands
    //         </Button>
    //         <Button
    //           onClick={() => setIsApprovalDialogOpen(true)}
    //           variant="outlined"
    //           color="secondary"
    //         >
    //           Manage Approval
    //         </Button>
    //         <Button
    //           onClick={() =>
    //             navigate(
    //               PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(
    //                 companyId!,
    //                 locationId!,
    //                 brandId!,
    //               ),
    //             )
    //           }
    //           variant="contained"
    //         >
    //           <PencilIcon className="mr-2 h-4 w-4" />
    //           Edit Brand
    //         </Button>
    //       </div>
    //     ),
    //   }}
    // >
    <BrandPageWrapper
      mode={MODE.VIEW}
      title="View Brand"
      description="View brand information and details"
      brandId={brandId}
    />

    // </PageContent>
  );
};

export default CompanyLocationBrandView;
