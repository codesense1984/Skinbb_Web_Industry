import { PageContent } from "@/core/components/ui/structure.tsx";
import { Button } from "@/core/components/ui/button";
import { MODE } from "@/core/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  apiGetCompanyDetailById,
  apiUpdateOnboardById,
  apiUpdateCompanyStatus,
  type CompanyStatusUpdateRequest,
} from "../../../../services/http/company.service";
import {
  companyEditZodSchema,
  type CompanyEditFormType,
} from "../../schema/companyEdit.schema";
import {
  transformApiResponseToCompanyEditFormData,
  transformCompanyEditFormDataToApiRequest,
} from "../../utils/companyEdit.utils";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import CompanyEditDetails from "../edit/CompanyEditDetails";
import { CompanyEditAddressDetails } from "../edit/CompanyEditAddressDetails";
import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
import { CompanyApprovalDialog } from "../approval/CompanyApprovalDialog";
import type { AxiosError } from "axios";
import { StatusBadge } from "@/core/components/ui/badge";

interface CompanyFormProps {
  mode: MODE;
  showApprovalButton?: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  mode,
  showApprovalButton = false,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  const methods = useForm<CompanyEditFormType>({
    defaultValues: transformApiResponseToCompanyEditFormData(),
    resolver: zodResolver(companyEditZodSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { handleSubmit, reset } = methods;

  // Fetch company data
  const {
    data: companyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [PANEL_ROUTES.COMPANY.DETAIL(id)],
    queryFn: () => apiGetCompanyDetailById(id!),
    enabled: !!id,
  });

  // Update form data when company data is fetched
  useEffect(() => {
    if (companyData?.data && companyData.success) {
      const formData = transformApiResponseToCompanyEditFormData(
        companyData.data,
      );
      reset(formData);
    }
  }, [companyData, reset]);

  // Update company mutation (for edit mode)
  const updateMutation = useMutation({
    mutationFn: (data: CompanyEditFormType) => {
      const apiData = transformCompanyEditFormDataToApiRequest(data);
      return apiUpdateOnboardById<{ success: boolean; message: string }, any>(
        id!,
        apiData,
      );
    },
    onSuccess: (response) => {
      toast.success(response.message || "Company updated successfully!");
      // Invalidate company list and company details queries
      queryClient.invalidateQueries({ queryKey: [PANEL_ROUTES.COMPANY.LIST] });
      queryClient.invalidateQueries({
        queryKey: [PANEL_ROUTES.COMPANY.DETAIL(id)],
      });
      navigate(PANEL_ROUTES.COMPANY.LIST);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Company update error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update company. Please try again.",
      );
    },
  });

  // Update company status mutation (for approval)
  const updateStatusMutation = useMutation({
    mutationFn: (data: CompanyStatusUpdateRequest) => {
      return apiUpdateCompanyStatus(id!, data);
    },
    onSuccess: (response) => {
      toast.success(response.message || "Company status updated successfully!");
      // Invalidate company list and company details queries
      queryClient.invalidateQueries({ queryKey: [PANEL_ROUTES.COMPANY.LIST] });
      queryClient.invalidateQueries({
        queryKey: [PANEL_ROUTES.COMPANY.DETAIL(id)],
      });
      setIsApprovalDialogOpen(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Company status update error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update company status. Please try again.",
      );
    },
  });

  const onSubmit = handleSubmit(
    (data) => {
      if (mode === MODE.EDIT) {
        updateMutation.mutate(data);
      }
    },
    (errors) => {
      console.error("Form validation errors:", errors);
      toast.error("Please fix the form errors before submitting");
    },
  );

  const handleBack = () => {
    navigate(PANEL_ROUTES.COMPANY.LIST);
  };

  const handleApproval = async (data: CompanyStatusUpdateRequest) => {
    await updateStatusMutation.mutateAsync(data);
  };

  const handleEdit = () => {
    navigate(`${PANEL_ROUTES.COMPANY.EDIT(id)}`);
  };

  if (isLoading) {
    return (
      <PageContent
        header={{ title: mode === MODE.EDIT ? "Edit Company" : "View Company" }}
      >
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="border-muted-foreground mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
            <p className="text-muted-foreground">Loading company details...</p>
          </div>
        </div>
      </PageContent>
    );
  }

  if (error) {
    return (
      <PageContent
        header={{ title: mode === MODE.EDIT ? "Edit Company" : "View Company" }}
      >
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="mb-4 text-red-600">Failed to load company details</p>
            <Button onClick={handleBack} variant="outlined">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Companies
            </Button>
          </div>
        </div>
      </PageContent>
    );
  }

  const pageTitle = mode === MODE.EDIT ? "Edit Company" : "View Company";
  const pageDescription =
    mode === MODE.EDIT
      ? "Update your company details and information"
      : "Review company details and manage approval status";

  return (
    <PageContent
      header={{
        title: pageTitle,
        description: pageDescription,
        actions: (
          <div className="flex gap-3">
            {companyData?.data?.status && (
              <StatusBadge
                module={"company"}
                variant="default"
                status={companyData?.data?.status}
              />
            )}
            {showApprovalButton && (
              <Button
                onClick={() => setIsApprovalDialogOpen(true)}
                variant="outlined"
                color="secondary"
              >
                Manage Approval
              </Button>
            )}
            {mode === MODE.VIEW && (
              <Button onClick={handleEdit} variant="outlined" color="secondary">
                Edit Company
              </Button>
            )}
          </div>
        ),
      }}
    >
      <FormProvider {...methods}>
        {mode === MODE.EDIT ? (
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Company Details Section */}
            <Card>
              <CardHeader className="border-b">Company Details</CardHeader>
              <CardContent className="pt-3">
                <CompanyEditDetails mode={mode} />
              </CardContent>
            </Card>

            {/* Address Details Section */}
            <Card>
              <CardHeader className="border-b">Address Information</CardHeader>
              <CardContent className="pt-3">
                <CompanyEditAddressDetails mode={mode} />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={updateMutation.isPending}
                className="min-w-32"
              >
                {updateMutation.isPending ? "Updating..." : "Update Company"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            {/* Company Details Section */}
            <Card>
              <CardHeader className="border-b">Company Details</CardHeader>
              <CardContent className="pt-3">
                <CompanyEditDetails mode={mode} />
              </CardContent>
            </Card>

            {/* Address Details Section */}
            <Card>
              <CardHeader className="border-b">Address Information</CardHeader>
              <CardContent className="pt-3">
                <CompanyEditAddressDetails mode={mode} />
              </CardContent>
            </Card>
          </div>
        )}
      </FormProvider>

      {/* Approval Dialog - only show in view mode with approval button */}
      {showApprovalButton && (
        <CompanyApprovalDialog
          isOpen={isApprovalDialogOpen}
          onClose={() => setIsApprovalDialogOpen(false)}
          onApprove={handleApproval}
          companyName={companyData?.data?.companyName}
          isLoading={updateStatusMutation.isPending}
        />
      )}
    </PageContent>
  );
};

export default CompanyForm;
