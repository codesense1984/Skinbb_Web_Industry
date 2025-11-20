import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import { PageContent } from "@/core/components/ui/structure";
import { STATUS_MAP } from "@/core/config/status";
import { normalizeAxiosError } from "@/core/services/http";
import { MODE, type ApiResponse, type Option } from "@/core/types/base.type";
import { queryClient } from "@/core/utils";
import { handleFormErrors } from "@/core/utils/react-hook-form.utils";
import { WithAccess } from "@/modules/auth/components/guard";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ROLE } from "@/modules/auth/types/permission.type.";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

import { FullLoader } from "@/core/components/ui/loader";
import { BrandApprovalDialog } from "@/modules/panel/features/company/brands/components/BrandApprovalDialog";
import { apiGetBrandById } from "@/modules/panel/services/http/brand.service";
import { apiUpdateBrandStatus } from "@/modules/panel/services/http/company.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm, type Control, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createBrandZodSchema, type BrandFormData } from "./brand.schema";
import { extractBrandIds, transformBrandFormDataToBrand } from "./brand.utils";
import { AuthorizationLetterSection } from "./components/AuthorizationLetterSection";
import { BrandInformationSection } from "./components/BrandInformationSection";
import { BrandLogoSection } from "./components/BrandLogoSection";
import { CompanyLocationSection } from "./components/CompanyLocationSection";
import { SellingPlatformsSection } from "./components/SellingPlatformsSection";
import { SocialMediaSection } from "./components/SocialMediaSection";
import { useBrandFormData } from "./hooks/useBrandFormData";
import { useBrandFormTransform } from "./hooks/useBrandFormTransform";
import type { BrandApiResponse, BrandFormProps } from "./types";

const PRODUCT_CATEGORY_OPTIONS = [
  { value: "colour-cosmetics", label: "Colour Cosmetics" },
  { value: "personal-care-products", label: "Personal Care Products" },
  {
    value: "nutraceuticals-and-wellness",
    label: "Nutraceuticals and Wellness",
  },
  { value: "devices", label: "Devices" },
] as Option[];

const BrandForm: React.FC<BrandFormProps> = ({
  mode,
  title,
  description,
  companyId: propCompanyId,
  locationId: propLocationId,
  brandId,
  onSubmit,
  submitting = false,
}) => {
  const { userId } = useAuth();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = React.useState(false);

  const zodSchema = useMemo(
    () =>
      createBrandZodSchema({
        isEdit: mode === MODE.EDIT,
      }),
    [propCompanyId, propLocationId, mode],
  );

  const { initialDefaultValues } = useBrandFormData({
    companyId: propCompanyId,
    locationId: propLocationId,
  });

  // Infer type from zod schema to match resolver output
  type ZodBrandFormData = z.infer<typeof zodSchema>;

  const form = useForm<ZodBrandFormData>({
    resolver: zodResolver(zodSchema),
    defaultValues: initialDefaultValues as ZodBrandFormData,
  });

  const { control, setValue, handleSubmit, reset } = form;

  const isCompanyLocationContext = !!(propCompanyId && propLocationId);

  // Fetch brand data for edit and view modes
  const {
    data: brandData,
    isLoading: isLoadingBrand,
    error: brandError,
    refetch,
  } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: async () => {
      return await apiGetBrandById<ApiResponse<BrandApiResponse>>(brandId!);
    },
    enabled: !!brandId && (mode === MODE.EDIT || mode === MODE.VIEW),
  });

  const { transformedData } = useBrandFormTransform({
    brandData,
    companyId: propCompanyId,
    locationId: propLocationId,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: string; statusChangeReason?: string }) => {
      return apiUpdateBrandStatus(userId!, brandId!, data);
    },
    onSuccess: (response: { message?: string }) => {
      toast.success(response?.message || "Brand status updated successfully!");
      queryClient.invalidateQueries({
        queryKey: isCompanyLocationContext
          ? [
              ENDPOINTS.COMPANY_LOCATION_BRANDS.LIST(
                propCompanyId!,
                propLocationId!,
              ),
            ]
          : [ENDPOINTS.BRAND.MAIN],
      });
      refetch();
      setIsApprovalDialogOpen(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        normalizeAxiosError(error)?.message ||
          "Failed to update brand status. Please try again.",
      );
    },
  });

  const handleApproval = useCallback(
    async (data: { status: string; statusChangeReason?: string }) => {
      if (!userId) {
        throw new Error("Admin ID not found");
      }
      await updateStatusMutation.mutateAsync(data);
    },
    [userId, updateStatusMutation],
  );

  // Populate form with existing data when in edit or view mode
  useEffect(() => {
    if (!transformedData || (mode !== MODE.EDIT && mode !== MODE.VIEW)) {
      return;
    }
    reset(transformedData as ZodBrandFormData);
  }, [transformedData, mode, reset]);

  const handleClearLogo = useCallback(() => {
    setValue("brand_logo_files", []);
    setValue("brand_logo", "");
  }, [setValue]);

  const onSubmitForm = useCallback(
    async (data: ZodBrandFormData) => {
      if (!onSubmit) {
        return;
      }

      // Transform to BrandFormData format for transformation
      const formData = data as unknown as BrandFormData;
      const ids = extractBrandIds(formData);
      const convertedData = transformBrandFormDataToBrand(formData);

      // Call onSubmit with transformed data in BrandSubmitHandler format
      onSubmit({
        ...ids,
        data: convertedData,
      });
    },
    [onSubmit],
  );

  const onError = useCallback((errors: FieldErrors<ZodBrandFormData>) => {
    handleFormErrors(errors as FieldErrors<BrandFormData>);
  }, []);

  const currentBrandData = useMemo(() => {
    if (!brandData) return null;
    if ("data" in brandData && typeof brandData.data === "object") {
      return brandData.data;
    }
    return brandData;
  }, [brandData]);

  const brandStatus = useMemo(() => {
    if (!currentBrandData) return "inactive";
    const brand = currentBrandData as BrandApiResponse;
    return brand.status || (brand.isActive ? "active" : "inactive");
  }, [currentBrandData]);

  const isLoading =
    isLoadingBrand && (mode === MODE.EDIT || mode === MODE.VIEW);
  const hasError = brandError && (mode === MODE.EDIT || mode === MODE.VIEW);

  if (hasError) {
    return (
      <PageContent
        header={{
          title: "Error",
          description: "Failed to load brand data",
        }}
      >
        <div className="w-full">
          <div className="bg-background rounded-xl border p-8 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="mb-4 text-red-600">Error loading brand data</p>
                <p className="text-sm text-gray-600">Brand ID: {brandId}</p>
                <p className="text-sm text-gray-600">
                  Error: {brandError?.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  return (
    <Form {...form}>
      {isLoading && <FullLoader />}
      <PageContent
        header={{
          title,
          description,
          actions: (
            <div className="flex flex-wrap gap-3">
              {mode === MODE.VIEW &&
                [
                  STATUS_MAP.brand.pending.value,
                  STATUS_MAP.brand.rejected.value,
                ].includes(brandStatus) && (
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
        <div className="w-full">
          <form
            onSubmit={handleSubmit(onSubmitForm, onError)}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Card - Brand Details */}
              <div className="space-y-6 rounded-xl border bg-white p-8 shadow-sm">
                <BrandLogoSection
                  control={control as Control<BrandFormData>}
                  mode={mode}
                  onClearLogo={handleClearLogo}
                />

                <CompanyLocationSection
                  control={control as Control<BrandFormData>}
                  mode={mode}
                  companyId={propCompanyId}
                  locationId={propLocationId}
                />

                <BrandInformationSection
                  control={control as Control<BrandFormData>}
                  mode={mode}
                  productCategoryOptions={PRODUCT_CATEGORY_OPTIONS}
                />
              </div>

              {/* Right Card - URLs, Uploads, etc. */}
              <div className="space-y-6 rounded-xl border bg-white p-8 shadow-sm">
                <SocialMediaSection
                  control={control as Control<BrandFormData>}
                  mode={mode}
                />

                <SellingPlatformsSection
                  control={control as Control<BrandFormData>}
                  mode={mode}
                />

                <AuthorizationLetterSection
                  control={control as Control<BrandFormData>}
                  mode={mode}
                />
              </div>
            </div>

            {/* Form Actions - Only show for ADD and EDIT modes */}
            {mode !== MODE.VIEW && (
              <div className="flex justify-end gap-4 border-t border-gray-200 pt-8">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => reset()}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="px-6 py-2"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : mode === MODE.EDIT
                      ? "Update Brand"
                      : "Create Brand"}
                </Button>
              </div>
            )}
          </form>
        </div>

        <BrandApprovalDialog
          isOpen={isApprovalDialogOpen}
          onClose={() => setIsApprovalDialogOpen(false)}
          onApprove={handleApproval}
          brandName={(currentBrandData as BrandApiResponse)?.name ?? ""}
          isLoading={updateStatusMutation.isPending}
        />
      </PageContent>
    </Form>
  );
};

export default BrandForm;
