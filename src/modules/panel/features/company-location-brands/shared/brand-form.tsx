import React, { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { FormFieldsRenderer } from "@/core/components/ui/form-input";
import {
  apiGetCompanyLocationBrandById,
  apiCreateCompanyLocationBrand,
  apiCreateCompanyLocationBrandJson,
  apiUpdateCompanyLocationBrand,
} from "@/modules/panel/services/http/company.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { CompanyLocationBrand } from "@/modules/panel/types/brand.type";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  brandFormSchema,
  brandSchema,
  type BrandFormData,
} from "../schema/brand.schema";
import { MODE } from "@/core/types";

// Type definitions for API responses
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Default values function with parameters
const getDefaultValues = (
  brandData?: CompanyLocationBrand | null,
): BrandFormData => {
  return {
    name: brandData?.name || "",
    aboutTheBrand: brandData?.aboutTheBrand || "",
    websiteUrl: brandData?.websiteUrl || "",
    totalSKU: brandData?.totalSKU ? String(brandData.totalSKU) : "0",
    averageSellingPrice: brandData?.averageSellingPrice
      ? String(brandData.averageSellingPrice)
      : "0",
    marketingBudget: brandData?.marketingBudget
      ? String(brandData.marketingBudget)
      : "0",
    instagramUrl: brandData?.instagramUrl || "",
    facebookUrl: brandData?.facebookUrl || "",
    youtubeUrl: brandData?.youtubeUrl || "",
    productCategory: brandData?.productCategory || [],
    sellingOn: brandData?.sellingOn || [],
    authorizationLetter: brandData?.authorizationLetter || "",
    isActive: brandData?.isActive ? "true" : "false",
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

  const { handleSubmit, control } = form;

  // Field array for selling platforms
  const {
    fields: sellingPlatformFields,
    append: addSellingPlatform,
    remove: removeSellingPlatform,
  } = useFieldArray({
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

  // Extract brand data from the API response
  const brand: CompanyLocationBrand | null = React.useMemo(() => {
    if (!brandData?.data) return null;

    // The API response structure is: { statusCode: 200, data: CompanyLocationBrand, message: "...", success: true }
    return brandData.data as CompanyLocationBrand;
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

      console.log("=== MUTATION DEBUG ===");
      console.log("companyId:", companyId);
      console.log("locationId:", locationId);
      console.log("companyId type:", typeof companyId);
      console.log("companyId length:", companyId?.length);
      console.log("=== END MUTATION DEBUG ===");

      // Try using regular object instead of FormData first
      const requestData = {
        sellerId: companyId,
        ...data,
        // Convert isActive from string to boolean for API
        isActive: data.isActive === "true",
      };

      // Debug: Log the request data
      console.log("Request data:", requestData);

      const formData = new FormData();

      // Add sellerId first
      formData.append("sellerId", companyId);

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
          // Convert isActive from string to boolean for API
          if (key === "isActive") {
            formData.append(key, value === "true" ? "true" : "false");
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Debug: Log the FormData contents
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      if (mode === MODE.EDIT && brandId) {
        return apiUpdateCompanyLocationBrand(
          companyId,
          locationId,
          brandId,
          formData,
        );
      } else {
        // Prepare JSON data with proper structure - ensure sellerId is first
        const jsonData = {
          sellerId: companyId, // Ensure sellerId is explicitly included and first
          name: data.name,
          aboutTheBrand: data.aboutTheBrand || "",
          websiteUrl: data.websiteUrl || "https://example.com", // Provide default if empty
          totalSKU: data.totalSKU ? parseInt(data.totalSKU) : 0,
          averageSellingPrice: data.averageSellingPrice
            ? parseFloat(data.averageSellingPrice)
            : 0,
          marketingBudget: data.marketingBudget
            ? parseFloat(data.marketingBudget)
            : 0,
          instagramUrl: data.instagramUrl || "",
          facebookUrl: data.facebookUrl || "",
          youtubeUrl: data.youtubeUrl || "",
          productCategory: data.productCategory || [],
          sellingOn: (data.sellingOn || []).filter(
            (item) => item.platform && item.url,
          ), // Filter out empty entries
          authorizationLetter: data.authorizationLetter || "",
          isActive: data.isActive === "true",
        };

        // Double-check sellerId is included
        if (!jsonData.sellerId) {
          throw new Error("sellerId is missing from request data");
        }
        console.log("=== BRAND CREATION DEBUG ===");
        console.log("Sending JSON data:", JSON.stringify(jsonData, null, 2));
        console.log("CompanyId (sellerId):", companyId);
        console.log("LocationId:", locationId);
        console.log(
          "API Endpoint:",
          `/sellers/${companyId}/locations/${locationId}/brands`,
        );
        console.log("=== END DEBUG ===");

        // Try different approaches for sellerId
        try {
          // Try with sellerId as first property and different casing
          const testData = {
            sellerId: companyId,
            seller_id: companyId, // Try snake_case as well
            name: data.name,
            websiteUrl: data.websiteUrl || "https://example.com",
          };
          console.log("Trying test data with multiple sellerId formats:", testData);
          
          const result = await apiCreateCompanyLocationBrandJson(
            companyId,
            locationId,
            testData,
          );
          console.log("Test data approach succeeded:", result);
          return result;
        } catch (error: unknown) {
          console.log("Test data approach failed:", error);
          const axiosError = error as { response?: { data?: unknown } };
          console.log("Error response:", axiosError?.response?.data);
          
          // Try with full data
          try {
            console.log("Trying full JSON data...");
            const result = await apiCreateCompanyLocationBrandJson(
              companyId,
              locationId,
              jsonData,
            );
            console.log("Full JSON approach succeeded:", result);
            return result;
          } catch (fullError: unknown) {
            console.log("Full JSON approach also failed:", fullError);
            const fullAxiosError = fullError as { response?: { data?: unknown } };
            console.log("Full error response:", fullAxiosError?.response?.data);
            console.log("Trying FormData approach as final fallback...");
            // Fallback to FormData if JSON fails
            return apiCreateCompanyLocationBrand(companyId, locationId, formData);
          }
        }
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
      <div className="w-full">
        <div className="bg-background rounded-xl border p-8 shadow-sm">
          <div className="py-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">Loading brand data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-background rounded-xl border p-8 shadow-sm">
        {fetchError && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
            <div className="text-sm text-red-800">
              <strong>Error:</strong>{" "}
              {(fetchError as ApiError)?.response?.data?.message ||
                (fetchError as ApiError)?.message ||
                "Failed to load brand data"}
            </div>
          </div>
        )}

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Column - Basic Information */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <FormFieldsRenderer<BrandFormData>
                    control={control}
                    fieldConfigs={brandSchema.basic_information({ mode })}
                    className="space-y-6"
                  />
                </CardContent>
              </Card>

              {/* Right Column - Business Metrics */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Business Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <FormFieldsRenderer<BrandFormData>
                    control={control}
                    fieldConfigs={brandSchema.business_metrics({ mode })}
                    className="space-y-6"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Social Media - Full Width */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <FormFieldsRenderer<BrandFormData>
                  control={control}
                  fieldConfigs={brandSchema.social_media({ mode })}
                  className="grid grid-cols-1 gap-6 md:grid-cols-3"
                />
              </CardContent>
            </Card>

            {/* Selling Platforms - Full Width */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Selling Platforms
                  </CardTitle>
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
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {sellingPlatformFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-end gap-4 rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex-1">
                        <FormFieldsRenderer<BrandFormData>
                          control={control}
                          fieldConfigs={brandSchema.selling_platforms({
                            mode,
                            index,
                            availableOptions:
                              getAvailablePlatformOptions(index),
                          })}
                          className="grid grid-cols-1 gap-4 md:grid-cols-2"
                        />
                      </div>
                      {mode !== MODE.VIEW && (
                        <Button
                          type="button"
                          onClick={() => removeSellingPlatform(index)}
                          variant="outlined"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {sellingPlatformFields.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      <p>No selling platforms added yet.</p>
                      {mode !== MODE.VIEW && (
                        <p className="text-sm">
                          Click &quot;Add Platform&quot; to get started.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status - Only show in edit/view mode */}
            {(mode === MODE.EDIT || mode === MODE.VIEW) && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <FormFieldsRenderer<BrandFormData>
                    control={control}
                    fieldConfigs={brandSchema.status({ mode })}
                    className="flex"
                  />
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4 border-t border-gray-200 pt-8">
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
    </div>
  );
};

export default BrandForm;
