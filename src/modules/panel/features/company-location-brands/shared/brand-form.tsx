import React, { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/core/components/ui/button";
import { FormFieldsRenderer } from "@/core/components/ui/form-input";
import {
  apiGetCompanyLocationBrandById,
  apiCreateCompanyLocationBrand,
  apiUpdateCompanyLocationBrand,
} from "@/modules/panel/services/http/company.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { CompanyLocationBrand } from "@/modules/panel/types/brand.type";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { brandFormSchema, brandSchema, type BrandFormData } from "../schema/brand.schema";
import { MODE } from "@/core/types";

// Type definitions for API responses
interface BrandApiResponse {
  data: {
    data?: CompanyLocationBrand | { data: CompanyLocationBrand };
  };
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Default values function with parameters
const getDefaultValues = (brandData?: CompanyLocationBrand | null): BrandFormData => {
  return {
    name: brandData?.name || "",
    aboutTheBrand: brandData?.aboutTheBrand || "",
    websiteUrl: brandData?.websiteUrl || "",
    totalSKU: brandData?.totalSKU ? String(brandData.totalSKU) : "0",
    averageSellingPrice: brandData?.averageSellingPrice ? String(brandData.averageSellingPrice) : "0",
    marketingBudget: brandData?.marketingBudget ? String(brandData.marketingBudget) : "0",
    instagramUrl: brandData?.instagramUrl || "",
    facebookUrl: brandData?.facebookUrl || "",
    youtubeUrl: brandData?.youtubeUrl || "",
    productCategory: brandData?.productCategory || [],
    sellingOn: brandData?.sellingOn || [],
    isActive: brandData?.isActive ?? true,
  };
};

const BrandForm = () => {
  const { companyId, locationId, brandId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mode = location.pathname.includes("/edit")
    ? MODE.EDIT
    : location.pathname.includes("/view")
      ? MODE.VIEW
      : MODE.ADD;

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: getDefaultValues(),
  });

  const {
    handleSubmit,
    control,
  } = form;

  // Field array for selling platforms
  const { fields: sellingPlatformFields, append: addSellingPlatform, remove: removeSellingPlatform } = useFieldArray({
    control,
    name: "sellingOn",
  });

  // Fetch brand data for edit/view mode using useQuery
  const {
    data: brandData,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["company-location-brand", companyId, locationId, brandId],
    queryFn: () =>
      apiGetCompanyLocationBrandById(companyId!, locationId!, brandId!),
    enabled: !!(
      brandId &&
      (mode === MODE.EDIT || mode === MODE.VIEW) &&
      companyId &&
      locationId
    ),
    // staleTime: 1 * 60 * 1000, // 5 minutes
    // retry: 1,
  });

  // Extract brand data from the nested response structure
  const brand: CompanyLocationBrand | null = React.useMemo(() => {
    if (!brandData?.data) return null;

    const response = brandData as BrandApiResponse;
    
    // Check if data has nested data structure
    if (response.data?.data && typeof response.data.data === "object") {
      const nestedData = response.data.data as { data?: CompanyLocationBrand };
      if (nestedData.data) {
        return nestedData.data;
      }
    }
    
    // Check if data is directly the brand object
    if (response.data?.data && "name" in response.data.data) {
      return response.data.data as CompanyLocationBrand;
    }

    return null;
  }, [brandData]);

  // Populate form when brand data is loaded
  useEffect(() => {
    if (brand && (mode === MODE.EDIT || mode === MODE.VIEW)) {
      // Reset form with API data using the default values function
      form.reset(getDefaultValues(brand));
    }
  }, [brand, mode, form]);

  // Create mutation for brand operations
  const brandMutation = useMutation({
    mutationFn: async (data: BrandFormData) => {
      if (!companyId || !locationId)
        throw new Error("Missing company or location ID");

      const formData = new FormData();

      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === "object") {
              formData.append(`${key}[${index}][platform]`, item.platform);
              formData.append(`${key}[${index}][url]`, item.url);
            } else {
              formData.append(`${key}[]`, item);
            }
          });
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      if (mode === MODE.EDIT && brandId) {
        return apiUpdateCompanyLocationBrand(
          companyId,
          locationId,
          brandId,
          formData,
        );
      } else {
        return apiCreateCompanyLocationBrand(companyId, locationId, formData);
      }
    },
    onSuccess: () => {
      const successMessage =
        mode === MODE.EDIT
          ? "Brand updated successfully!"
          : "Brand created successfully!";
      toast.success(successMessage);

      // Reset form to default values
      form.reset(getDefaultValues());

      // Invalidate and refetch the brands list
      queryClient.invalidateQueries({
        queryKey: ["company-location-brands", companyId, locationId],
      });

      // Navigate back to brands list
      navigate(PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId!, locationId!));
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(error?.message ?? "Failed to save brand");
      
    },
  });

  const onSubmit = (data: BrandFormData) => {
    brandMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate(PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId!, locationId!));
  };

  // Get available platform options (exclude already selected ones, except "Other")
  const getAvailablePlatformOptions = (currentIndex: number) => {
    const selectedPlatforms = sellingPlatformFields
      .map((platform, index) =>
        index !== currentIndex ? platform?.platform : null,
      )
      .filter(Boolean);

    const allOptions = [
      { label: "Amazon", value: "amazon" },
      { label: "Flipkart", value: "flipkart" },
      { label: "Myntra", value: "myntra" },
      { label: "Nykaa", value: "nykaa" },
      { label: "Purplle", value: "purplle" },
      { label: "Other", value: "other" },
    ];

    return allOptions.filter((option) => {
      // "Other" can be selected multiple times
      if (option.value === "other") {
        return true;
      }
      // All other platforms can only be selected once
      return !selectedPlatforms.includes(option.value);
    });
  };

  const handleAddSellingPlatform = () => {
    addSellingPlatform({ platform: "", url: "" });
  };

  const handleResetForm = () => {
    form.reset(getDefaultValues());
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-500">Loading brand data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="text-sm text-red-800">
            <strong>Error:</strong>{" "}
            {(fetchError as ApiError)?.response?.data?.message ||
              (fetchError as ApiError)?.message ||
              "Failed to load brand data"}
          </div>
        </div>
      )}

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
              Basic Information
            </h3>

            <FormFieldsRenderer<BrandFormData>
              control={control}
              fieldConfigs={brandSchema.basic_information({ mode })}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            />
          </div>

          {/* Business Metrics */}
          <div className="space-y-4">
            <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
              Business Metrics
            </h3>

            <FormFieldsRenderer<BrandFormData>
              control={control}
              fieldConfigs={brandSchema.business_metrics({ mode })}
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            />
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
              Social Media
            </h3>

            <FormFieldsRenderer<BrandFormData>
              control={control}
              fieldConfigs={brandSchema.social_media({ mode })}
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            />
          </div>

          {/* Selling Platforms */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Selling Platforms
              </h3>
              {mode !== MODE.VIEW && (
                <Button
                  type="button"
                  onClick={handleAddSellingPlatform}
                  variant="outlined"
                  size="sm"
                >
                  Add Platform
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {sellingPlatformFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3">
                  <div className="flex-1">
                    <FormFieldsRenderer<BrandFormData>
                      control={control}
                      fieldConfigs={brandSchema.selling_platforms({
                        mode,
                        index,
                        availableOptions: getAvailablePlatformOptions(index),
                      })}
                      className="grid grid-cols-1 gap-3 md:grid-cols-2"
                    />
                  </div>
                  {mode !== MODE.VIEW && (
                    <Button
                      type="button"
                      onClick={() => removeSellingPlatform(index)}
                      variant="outlined"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          {(mode === MODE.EDIT || mode === MODE.VIEW) && (
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Status
              </h3>

              <FormFieldsRenderer<BrandFormData>
                control={control}
                fieldConfigs={brandSchema.status({ mode })}
                className="flex"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            {mode !== MODE.VIEW && (
              <>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleResetForm}
                  className="px-6 py-2"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={brandMutation.isPending}
                  className="px-6 py-2"
                >
                  {brandMutation.isPending
                    ? mode === MODE.EDIT
                      ? "Updating..."
                      : "Creating..."
                    : mode === MODE.EDIT
                      ? "Update Brand"
                      : "Create Brand"}
                </Button>
              </>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default BrandForm;
