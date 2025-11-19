import { createSimpleFetcher } from "@/core/components/data-table";
import { Alert } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import {
  FormFieldsRenderer,
  FormInput,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import PaginationComboBox from "@/core/components/ui/pagination-combo-box";
import { PageContent } from "@/core/components/ui/structure";
import { STATUS_MAP } from "@/core/config/status";
import { useImagePreview } from "@/core/hooks/useImagePreview";
import { normalizeAxiosError } from "@/core/services/http";
import { MODE, type ApiResponse } from "@/core/types/base.type";
import { queryClient } from "@/core/utils";
import { handleFormErrors } from "@/core/utils/react-hook-form.utils";
import { WithAccess } from "@/modules/auth/components/guard";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ROLE } from "@/modules/auth/types/permission.type.";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import {
  apiCreateBrand,
  apiGetBrandById,
  apiUpdateBrandById,
} from "@/modules/panel/services/http/brand.service";
import {
  apiGetCompaniesForFilter,
  apiGetCompanyLocations,
  apiUpdateBrandStatus,
} from "@/modules/panel/services/http/company.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { toast } from "sonner";
import { BrandApprovalDialog } from "../../../../features/company/brands/components/BrandApprovalDialog";
import { createBrandZodSchema } from "../../../../features/brands/create/brandZodSchema";
import {
  brandFormSchema,
  defaultValues,
  type BrandFormData,
} from "../../../../features/brands/create/formSchema";

// Interface for brand API response
interface BrandApiResponse {
  _id?: string;
  name?: string;
  aboutTheBrand?: string;
  isActive?: boolean;
  logoImage?: string | { url?: string };
  authorizationLetter?: string | { url?: string };
  // Handle both camelCase (from API) and snake_case (legacy)
  totalSKU?: number;
  total_skus?: string | number;
  skus?: string | number;
  marketingBudget?: number;
  marketing_budget?: string | number;
  budget?: string | number;
  productCategory?: string | string[];
  product_category?: string | string[];
  category?: string | string[];
  brandType?: string[];
  instagramUrl?: string;
  instagram_url?: string;
  instagram?: string;
  facebookUrl?: string;
  facebook_url?: string;
  facebook?: string;
  youtubeUrl?: string;
  youtube_url?: string;
  youtube?: string;
  websiteUrl?: string;
  website_url?: string;
  website?: string;
  sellingOn?: Array<{ platform: string; url: string }>;
  platforms?: Array<{ platform: string; url: string }>;
  brand_logo?: string;
  logo?: string;
  brand_name?: string;
  description?: string;
  brand_authorization_letter?: string;
  authorization_letter?: string;
  status?: string;
  // company?: { _id: string; companyName: string };
  // location?: { _id: string; addressLine1: string; city: string; state: string };
  companyId?: string;
  companyName?: string;
  locationId?: string;
  locationAddress?: string;
}

interface UnifiedBrandFormProps {
  mode: MODE;
  title: string;
  description: string;
  companyId?: string;
  locationId?: string;
  brandId?: string;
  onSubmit?: (data: BrandFormData) => void;
  submitting?: boolean;
}

const UnifiedBrandForm: React.FC<UnifiedBrandFormProps> = ({
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
  // const { getCompanyId, getPrimaryAddress } = useSellerAuth();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  // const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  // Auto-determine company and location based on context
  const companyId = propCompanyId;
  const locationId = propLocationId;

  // Create zod schema based oncompanyId props and mode
  const zodSchema = createBrandZodSchema({
    companyId: propCompanyId,
    locationId: propLocationId,
    isEdit: mode === MODE.EDIT,
  });

  // Initialize form with default values, including company_id and location_id if provided
  const initialDefaultValues: BrandFormData = {
    ...defaultValues,
    ...(propCompanyId && { company_id: propCompanyId }),
    ...(propLocationId && { location_id: propLocationId }),
  };

  const form = useForm<BrandFormData>({
    resolver: zodResolver(zodSchema),
    defaultValues: initialDefaultValues,
  });

  const { control, setValue, handleSubmit, reset, watch, getValues } = form;
  console.log("🚀 ~ UnifiedBrandForm ~ watch:", watch());

  // Watch company_id to update location options
  const watchedCompanyId = useWatch({ control, name: "company_id" });
  // const watchedLocationId = useWatch({ control, name: "location_id" });

  // Determine if we're in company-location context
  const isCompanyLocationContext = !!(companyId && locationId);

  // Fetch companies for dropdown (only if companyId is not provided in props)
  // const { data: companiesData } = useQuery({
  //   queryKey: ["companies-for-brand-form"],
  //   queryFn: () =>
  //     apiGetCompaniesForFilter<
  //       {
  //         statusCode: number;
  //         data: {
  //           items: Array<{ _id: string; companyName: string }>;
  //           page: number;
  //           limit: number;
  //           total: number;
  //         };
  //         message: string;
  //       },
  //       {
  //         page?: number;
  //         limit?: number;
  //         search?: string;
  //       }
  //     >({
  //       page: 1,
  //       limit: 10,
  //       // search:""
  //     }),
  //   select: (data) => data?.data?.items || [],
  //   retry: 1,
  //   // enabled: !propCompanyId, // Only fetch if companyId is not provided in props
  // });

  // Fetch locations for selected company (only if locationId is not provided in props)
  // const { data: locationsData } = useQuery({
  //   queryKey: ["company-locations-for-brand-form", watchedCompanyId],
  //   queryFn: () =>
  //     apiGetCompanyLocations<{
  //       statusCode: number;
  //       data: {
  //         items: Array<{
  //           _id: string;
  //           addressLine1: string;
  //           city: string;
  //           state: string;
  //         }>;
  //         page: number;
  //         limit: number;
  //         total: number;
  //       };
  //       message: string;
  //     }>(watchedCompanyId!, {
  //       page: 1,
  //       limit: 100,
  //     }),
  //   select: (data) => data?.data?.items || [],
  //   enabled: !!watchedCompanyId && !propLocationId, // Only fetch if locationId is not provided in props
  //   retry: 1,
  // });

  // Fetch brand data for edit and view modes
  const {
    data: brandData,
    isLoading: isLoadingBrand,
    error: brandError,
  } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: async () => {
      return await apiGetBrandById<ApiResponse<BrandApiResponse>>(brandId!);
    },
    enabled: !!brandId && (mode === MODE.EDIT || mode === MODE.VIEW),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: string; statusChangeReason?: string }) => {
      return apiUpdateBrandStatus(userId!, brandId!, data);
    },
    onSuccess: (response) => {
      toast.success(response.message || "Brand status updated successfully!");
      queryClient.invalidateQueries({
        queryKey: isCompanyLocationContext
          ? [ENDPOINTS.COMPANY_LOCATION_BRANDS.LIST(companyId!, locationId!)]
          : [ENDPOINTS.BRAND.MAIN],
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

  const handleApproval = async (data: {
    status: string;
    statusChangeReason?: string;
  }) => {
    if (!userId) {
      throw new Error("Admin ID not found");
    }
    await updateStatusMutation.mutateAsync(data);
  };

  // Populate company options
  // useEffect(() => {
  //   if (companiesData) {
  //     const options = companiesData.map((company) => ({
  //       label: company.companyName,
  //       value: company._id,
  //     }));
  //     setCompanyOptions(options);
  //   }
  // }, [companiesData]);

  // Populate location options when company changes
  // useEffect(() => {
  //   if (locationsData) {
  //     const options = locationsData.map((location) => ({
  //       label: `${location.addressLine1} - ${location.city}, ${location.state}`,
  //       value: location._id,
  //     }));
  //     setLocationOptions(options);
  //   } else {
  //     setLocationOptions([]);
  //   }
  // }, [locationsData]);

  // Auto-fill company and location from context or URL parameters
  // This effect only runs when props change, not when form values change
  // useEffect(() => {
  //   const currentCompanyId = getValues("company_id");
  //   const currentLocationId = getValues("location_id");

  //   // If propCompanyId is provided, always set it (field will be disabled)
  //   if (propCompanyId && propCompanyId !== currentCompanyId) {
  //     setValue("company_id", propCompanyId, { shouldDirty: false });
  //     // setSelectedCompanyId(propCompanyId);
  //   }
  //   // If propCompanyId is NOT provided, only set from context if form is empty
  //   else if (!propCompanyId && companyId && !currentCompanyId) {
  //     setValue("company_id", companyId, { shouldDirty: false });
  //     // setSelectedCompanyId(companyId);
  //   }

  //   // If propLocationId is provided, always set it (field will be disabled)
  //   if (propLocationId && propLocationId !== currentLocationId) {
  //     setValue("location_id", propLocationId, { shouldDirty: false });
  //   }
  //   // If propLocationId is NOT provided, only set from context if form is empty
  //   else if (
  //     !propLocationId &&
  //     locationId &&
  //     !currentLocationId &&
  //     currentCompanyId
  //   ) {
  //     setValue("location_id", locationId, { shouldDirty: false });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [propCompanyId, propLocationId, setValue, getValues]); // Only depend on props, not form values

  // Reset location when company changes
  // useEffect(() => {
  //   if (watchedCompanyId !== selectedCompanyId && !isCompanyLocationContext) {
  //     // setValue("location_id", "");
  //     // setSelectedCompanyId(watchedCompanyId);
  //   }
  // }, [watchedCompanyId, selectedCompanyId, setValue, isCompanyLocationContext]);

  // Populate form with existing data when in edit or view mode
  useEffect(() => {
    if (brandData && (mode === MODE.EDIT || mode === MODE.VIEW)) {
      const brand = brandData.data;

      const formData = {
        brand_logo_files: [],
        brand_logo:
          typeof brand.logoImage === "string"
            ? brand.logoImage
            : brand.logoImage?.url || "",
        brand_name: brand.name || "",
        description: brand.aboutTheBrand || "",
        total_skus: brand.totalSKU !== undefined ? String(brand.totalSKU) : "",
        website_url: brand.websiteUrl || "",
        marketing_budget:
          brand.marketingBudget !== undefined
            ? String(brand.marketingBudget)
            : "",
        product_category:
          Array.isArray(brand.brandType) && brand.brandType.length > 0
            ? brand.brandType[0]
            : "",
        instagram_url: brand.instagramUrl || "",
        facebook_url: brand.facebookUrl || "",
        youtube_url: brand.youtubeUrl || "",
        sellingOn: Array.isArray(brand.sellingOn) ? brand.sellingOn : [],
        brand_authorization_letter:
          typeof brand.authorizationLetter === "string"
            ? brand.authorizationLetter
            : brand.authorizationLetter?.url || "",
        company_id: companyId || brand.companyId || "",
        location_id: locationId || brand.locationId || "",
        companyName: brand.companyName || "",
        locationAddress: brand.locationAddress || "",
        _id: brand._id || "",
      };

      reset(formData);
    }
  }, [brandData, mode, reset, companyId, locationId]);

  const profileData = useWatch({
    control,
    name: "brand_logo_files",
  })?.[0];

  const existingLogoUrl = useWatch({
    control,
    name: "brand_logo",
  });

  const sellingOn =
    useWatch({
      control,
      name: "sellingOn",
    }) || [];

  // Static product category options
  const formatted = [
    { value: "colour-cosmetics", label: "Colour Cosmetics" },
    { value: "personal-care-products", label: "Personal Care Products" },
    {
      value: "nutraceuticals-and-wellness",
      label: "Nutraceuticals and Wellness",
    },
    { value: "devices", label: "Devices" },
  ];

  const { element } = useImagePreview(profileData, existingLogoUrl, {
    clear: () => {
      setValue("brand_logo_files", []);
      setValue("brand_logo", "");
    },
  });

  const { remove, append } = useFieldArray({
    control,
    name: "sellingOn",
  });

  const addPlatform = () => {
    if (hasDuplicatePlatforms()) {
      return;
    }

    append({ platform: "", url: "" });
  };

  const getAvailablePlatformOptions = (currentIndex: number) => {
    const selectedPlatforms = sellingOn
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
      if (option.value === "other") {
        return true;
      }
      return !selectedPlatforms.includes(option.value);
    });
  };

  const hasDuplicatePlatforms = () => {
    const platforms = sellingOn
      .map((platform) => platform?.platform)
      .filter(Boolean)
      .filter((platform) => platform !== "other");

    return new Set(platforms).size !== platforms.length;
  };

  const onSubmitForm = async (data: BrandFormData) => {
    if (onSubmit) {
      onSubmit(data);
      return;
    }

    try {
      if (mode === MODE.ADD) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (
            key === "brand_logo_files" ||
            key === "brand_authorization_letter_files"
          ) {
            if (Array.isArray(value) && value.length > 0) {
              value.forEach((file, index) => {
                if (file instanceof File) {
                  formData.append(`${key}[${index}]`, file);
                }
              });
            }
          } else if (key === "sellingOn") {
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            }
          } else {
            formData.append(key, String(value || ""));
          }
        });

        await apiCreateBrand(formData);
        toast.success("Brand created successfully!");
      } else if (mode === MODE.EDIT && brandId) {
        await apiUpdateBrandById(brandId, data);
        toast.success("Brand updated successfully!");
      }
    } catch (error) {
      console.error("Error submitting brand form:", error);
      toast.error("Failed to save brand. Please try again.");
    }
  };

  const onError = (errors: FieldErrors<BrandFormData>, data: BrandFormData) => {
    console.error("Error submitting brand form:", errors, data, watch());
    handleFormErrors(errors);
    // toast.error("Failed to save brand. Please try again.");
  };

  // // Show loading state while fetching brand data
  if (isLoadingBrand && (mode === MODE.EDIT || mode === MODE.VIEW)) {
    return (
      <PageContent
        header={{
          title: "Brand",
          description: "Fetching brand data",
        }}
      >
        <div className="w-full">
          <div className="bg-background rounded-xl border p-8 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Loading brand data...</p>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  // // Show error state if fetching failed
  if (brandError && (mode === MODE.EDIT || mode === MODE.VIEW)) {
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
                  Error: {brandError.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  // Extract brand data from different response structures
  const currentBrandData = (() => {
    if (!brandData) return null;

    // Handle CompanyLocationBrandResponse structure
    if ("data" in brandData && typeof brandData.data === "object") {
      return brandData.data;
    }

    // Handle direct brand data
    return brandData;
  })();

  const brandStatus =
    (currentBrandData as BrandApiResponse)?.status ||
    ((currentBrandData as BrandApiResponse)?.isActive ? "active" : "inactive");

  return (
    <Form {...form}>
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
                {/* Brand Logo Section */}
                <div className="space-y-4">
                  <h2 className="col-span-1 text-xl font-semibold text-gray-900">
                    Brand Logo
                  </h2>
                  <div className="flex items-center justify-start gap-6">
                    <div className="flex">{element}</div>
                    <div className="w-full">
                      <FormFieldsRenderer<BrandFormData>
                        className="w-full md:grid-cols-1 lg:grid-cols-1"
                        control={control}
                        fieldConfigs={
                          brandFormSchema.uploadbrandImage.map((field) => ({
                            ...field,
                            disabled: mode === MODE.VIEW,
                          })) as FormFieldConfig<BrandFormData>[]
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Company and Location Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Company & Location
                  </h2>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {mode === MODE.ADD ? (
                      <FormInput
                        control={control}
                        name="company_id"
                        type="custom"
                        label="Company"
                        placeholder="Select company"
                        required
                        render={({ field }) => (
                          <PaginationComboBox
                            apiFunction={createSimpleFetcher(
                              apiGetCompaniesForFilter,
                              {
                                dataPath: "data.items",
                                totalPath: "data.totalRecords",
                              },
                            )}
                            transform={(company: {
                              _id: string;
                              companyName: string;
                            }) => ({
                              label: company.companyName,
                              value: company._id,
                            })}
                            placeholder="Select company"
                            value={field.value || ""}
                            queryKey={["companies-for-brand-form"]}
                            pageSize={100}
                            disabled={!!propCompanyId}
                            onChange={(value) => {
                              const newValue = value as string;
                              field.onChange(newValue);
                              setSelectedCompanyId(newValue); // Keep selectedCompanyId in sync
                              field.onBlur(); // Trigger validation
                            }}
                          />
                        )}
                      />
                    ) : (
                      <FormInput
                        control={control}
                        name="companyName"
                        type="text"
                        label="Company"
                        placeholder="Enter company"
                        disabled
                        required
                      />
                    )}

                    {mode === MODE.ADD ? (
                      <FormInput
                        control={control}
                        name="location_id"
                        type="custom"
                        label="Location"
                        placeholder="Select location"
                        required
                        render={({ field }) => (
                          <PaginationComboBox
                            apiFunction={createSimpleFetcher(
                              (params: Record<string, unknown>) =>
                                apiGetCompanyLocations(watchedCompanyId!, {
                                  page: (params.pageIndex as number) + 1,
                                  limit: params.pageSize as number,
                                }),
                              {
                                dataPath: "data.items",
                                totalPath: "data.totalRecords",
                              },
                            )}
                            pageSize={100}
                            enabled={!!watchedCompanyId}
                            transform={(company: {
                              _id: string;
                              addressLine1: string;
                              city: string;
                            }) => ({
                              label: `${company.addressLine1} - ${company.city}`,
                              value: company._id,
                            })}
                            placeholder="Select location"
                            value={field.value || ""}
                            queryKey={[
                              "company-locations-for-brand-form",
                              watchedCompanyId,
                            ]}
                            disabled={!!propCompanyId && !!propLocationId}
                            onChange={(value) => {
                              const newValue = value as string;
                              field.onChange(newValue);
                              field.onBlur(); // Trigger validation
                            }}
                          />
                        )}
                      />
                    ) : (
                      <FormInput
                        control={control}
                        name="locationAddress"
                        type="text"
                        label="Location"
                        placeholder="Enter location"
                        disabled
                        required
                      />
                    )}
                    {/* <FormFieldsRenderer<BrandFormData>
                      control={control}
                      fieldConfigs={
                        [
                          {
                            ...brandFormSchema.company_location[1],
                            options: locationOptions,
                            disabled:
                              mode === MODE.VIEW ||
                              !!propLocationId ||
                              !watchedCompanyId,
                          },
                        ] as FormFieldConfig<BrandFormData>[]
                      }
                      className="contents"
                    /> */}
                  </div>
                </div>

                {/* Brand Information Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Brand Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormFieldsRenderer<BrandFormData>
                      control={control}
                      fieldConfigs={
                        brandFormSchema.brand_information.map((field) => ({
                          ...field,
                          disabled: mode === MODE.VIEW,
                          ...(field.name === "product_category" && {
                            options: formatted,
                          }),
                        })) as FormFieldConfig<BrandFormData>[]
                      }
                      className="contents"
                    />
                  </div>
                </div>
              </div>

              {/* Right Card - URLs, Uploads, etc. */}
              <div className="space-y-6 rounded-xl border bg-white p-8 shadow-sm">
                {/* Social Media URLs Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Social Media URLs
                  </h2>
                  <FormFieldsRenderer<BrandFormData>
                    control={control}
                    fieldConfigs={
                      brandFormSchema.social_media_urls.map((field) => ({
                        ...field,
                        disabled: mode === MODE.VIEW,
                      })) as FormFieldConfig<BrandFormData>[]
                    }
                    className="!sm:grid-cols-2 !grid !grid-cols-1 !gap-4"
                  />
                </div>

                {/* Selling Platforms Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Selling Platforms
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        Add the platforms where you sell your products
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outlined"
                      color={"primary"}
                      onClick={addPlatform}
                      disabled={mode === MODE.VIEW}
                      className="px-4 py-2 text-sm"
                    >
                      + Add Platform
                    </Button>
                  </div>

                  {sellingOn.map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <FormFieldsRenderer<BrandFormData>
                        control={control}
                        fieldConfigs={[
                          {
                            type: "select",
                            name: `sellingOn.${index}.platform`,
                            label: "Platform",
                            placeholder: "Select platform",
                            options: getAvailablePlatformOptions(index),
                            disabled: mode === MODE.VIEW,
                          },
                          {
                            type: "text",
                            name: `sellingOn.${index}.url`,
                            label: "URL",
                            placeholder: "Enter platform URL",
                            disabled: mode === MODE.VIEW,
                          },
                        ]}
                        className="!sm:grid-cols-2 !grid !grid-cols-1 !gap-4"
                      />
                      {mode !== MODE.VIEW && (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outlined"
                            color="destructive"
                            onClick={() => remove(index)}
                            className="px-3 py-1 text-sm"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {sellingOn.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      <p>
                        No platforms added yet. Click &quot;Add Platform&quot;
                        to get started.
                      </p>
                    </div>
                  )}

                  {hasDuplicatePlatforms() && (
                    <Alert
                      variant="destructive"
                      title="Duplicate Platforms"
                      description="You have selected the same platform multiple times. Please choose different platforms for each entry."
                    />
                  )}

                  <Alert
                    variant="info"
                    title="URL Tips:"
                    description={
                      <ul className="mt-2 space-y-1">
                        <li>
                          • Platform URLs: Enter full URLs (e.g.,
                          &quot;https://amazon.in&quot;,
                          &quot;https://flipkart.com&quot;)
                        </li>
                        <li>
                          • Social Media URLs: Enter full URLs (e.g.,
                          &quot;https://instagram.com/yourbrand&quot;)
                        </li>
                      </ul>
                    }
                  />
                </div>

                {/* Brand Authorization Letter Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Brand Authorization Letter
                    {mode === MODE.EDIT && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        (Optional)
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center justify-start gap-6">
                    <div className="left-0 col-span-1 flex">
                      <FormFieldsRenderer<BrandFormData>
                        control={control}
                        fieldConfigs={
                          brandFormSchema.brand_authorization_letter.map(
                            (field) => ({
                              ...field,
                              disabled: mode === MODE.VIEW,
                              required: mode === MODE.ADD,
                            }),
                          ) as FormFieldConfig<BrandFormData>[]
                        }
                        className="!sm:grid-cols-2 !grid w-full !grid-cols-1 !gap-4"
                      />
                    </div>
                  </div>
                </div>
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

export default UnifiedBrandForm;
