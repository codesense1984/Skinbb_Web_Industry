import React, { useEffect, useState } from "react";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Alert } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { PageContent } from "@/core/components/ui/structure";
import { useImagePreview } from "@/core/hooks/useImagePreview";
import { MODE } from "@/core/types/base.type";
import { apiGetBrandById, apiCreateBrand, apiUpdateBrandById } from "@/modules/panel/services/http/brand.service";
import { 
  apiGetCompanyLocationBrandById, 
  apiUpdateBrandStatus,
  apiGetCompaniesForFilter, 
  apiGetCompanyLocations,
  apiGetCompanyDetailById
} from "@/modules/panel/services/http/company.service";
import { STATUS_MAP } from "@/core/config/status";
import { StatusBadge } from "@/core/components/ui/badge";
import { WithAccess } from "@/modules/auth/components/guard";
import { ROLE } from "@/modules/auth/types/permission.type.";
import { BrandApprovalDialog } from "../../company/brands/components/BrandApprovalDialog";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/core/utils";
import type { AxiosError } from "axios";
import { normalizeAxiosError } from "@/core/services/http";
import {
  brandFormSchema,
  defaultValues,
  type BrandFormData,
} from "../brand-form/formSchema";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

// Interface for brand API response
interface BrandApiResponse {
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
  company?: { _id: string; companyName: string };
  location?: { _id: string; addressLine1: string; city: string; state: string };
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
  const { getCompanyId, getPrimaryAddress } = useSellerAuth();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [locationOptions, setLocationOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const form = useForm<BrandFormData>({
    defaultValues: defaultValues,
  });

  const { control, setValue, handleSubmit, reset, watch } = form;

  // Watch company_id to update location options
  const watchedCompanyId = watch("company_id");

  // Auto-determine company and location based on context
  const companyId = propCompanyId || getCompanyId();
  const primaryAddress = getPrimaryAddress();
  const locationId = propLocationId || primaryAddress?.addressId;

  // Determine if we're in company-location context
  const isCompanyLocationContext = !!(companyId && locationId);

  // Fetch companies for dropdown (only if not in company context)
  const {
    data: companiesData,
  } = useQuery({
    queryKey: ["companies-for-brand-form"],
    queryFn: () =>
      apiGetCompaniesForFilter<
        {
          statusCode: number;
          data: {
            items: Array<{ _id: string; companyName: string }>;
            page: number;
            limit: number;
            total: number;
          };
          message: string;
        },
        {
          page: number;
          limit: number;
          search?: string;
        }
      >({
        page: 1,
        limit: 100,
      }),
    select: (data) => data?.data?.items || [],
    retry: 1,
    enabled: !isCompanyLocationContext, // Only fetch if not in company context
  });

  // Fetch locations for selected company (only if not in location context)
  const {
    data: locationsData,
  } = useQuery({
    queryKey: ["company-locations-for-brand-form", watchedCompanyId],
    queryFn: () =>
      apiGetCompanyLocations<
        {
          statusCode: number;
          data: {
            items: Array<{ _id: string; addressLine1: string; city: string; state: string }>;
            page: number;
            limit: number;
            total: number;
          };
          message: string;
        }
      >(watchedCompanyId!, {
        page: 1,
        limit: 100,
      }),
    select: (data) => data?.data?.items || [],
    enabled: !!watchedCompanyId && !isCompanyLocationContext,
    retry: 1,
  });

  // Fetch brand data for edit and view modes
  const {
    data: brandData,
    isLoading: isLoadingBrand,
    error: brandError,
  } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: async () => {
      if (isCompanyLocationContext) {
        return await apiGetCompanyLocationBrandById(companyId!, locationId!, brandId!);
      } else {
        return await apiGetBrandById<{ data: BrandApiResponse }>(brandId!);
      }
    },
    enabled: !!brandId && (mode === MODE.EDIT || mode === MODE.VIEW),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch company details to display company name
  const { data: companyData } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => apiGetCompanyDetailById<{ data: { companyName: string } }>(companyId!, userId!),
    enabled: !!companyId && !!userId && isCompanyLocationContext,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch location details to display location name
  const { data: locationData } = useQuery({
    queryKey: ["location", companyId, locationId],
    queryFn: () => apiGetCompanyLocations<{ data: { items: Array<{ _id: string; addressLine1: string; city: string; state: string }> } }>(companyId!, { page: 1, limit: 100 }),
    enabled: !!companyId && !!locationId && isCompanyLocationContext,
    staleTime: 5 * 60 * 1000,
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

  const handleApproval = async (data: { status: string; statusChangeReason?: string }) => {
    if (!userId) {
      throw new Error("Admin ID not found");
    }
    await updateStatusMutation.mutateAsync(data);
  };

  // Populate company options
  useEffect(() => {
    if (companiesData) {
      const options = companiesData.map((company) => ({
        label: company.companyName,
        value: company._id,
      }));
      setCompanyOptions(options);
    }
  }, [companiesData]);

  // Populate location options when company changes
  useEffect(() => {
    if (locationsData) {
      const options = locationsData.map((location) => ({
        label: `${location.addressLine1} - ${location.city}, ${location.state}`,
        value: location._id,
      }));
      setLocationOptions(options);
    } else {
      setLocationOptions([]);
    }
  }, [locationsData]);

  // Auto-fill company and location from context or URL parameters
  useEffect(() => {
    if (isCompanyLocationContext) {
      // In company-location context, set the values directly
      setValue("company_id", companyId!);
      setValue("location_id", locationId!);
      setSelectedCompanyId(companyId!);
    } else if (companyId) {
      // In company context only, set company
      setValue("company_id", companyId);
      setSelectedCompanyId(companyId);
    }
  }, [companyId, locationId, isCompanyLocationContext, setValue]);

  // Reset location when company changes
  useEffect(() => {
    if (watchedCompanyId !== selectedCompanyId && !isCompanyLocationContext) {
      setValue("location_id", "");
      setSelectedCompanyId(watchedCompanyId);
    }
  }, [watchedCompanyId, selectedCompanyId, setValue, isCompanyLocationContext]);

  // Populate form with existing data when in edit or view mode
  useEffect(() => {
    if (brandData && (mode === MODE.EDIT || mode === MODE.VIEW)) {
      const brand = (brandData as { data?: BrandApiResponse }).data || brandData as BrandApiResponse;

      const formData = {
        brand_logo_files: [],
        brand_logo:
          (typeof brand.logoImage === "string" ? brand.logoImage : brand.logoImage?.url) ||
          brand.brand_logo ||
          brand.logo ||
          "",
        brand_name: brand.name || brand.brand_name || "",
        description: brand.aboutTheBrand || brand.description || "",
        status: brand.isActive ? "active" : "inactive",
        // Handle both camelCase (from API) and snake_case (legacy) field names
        total_skus: brand.totalSKU !== undefined 
          ? String(brand.totalSKU) 
          : brand.total_skus !== undefined 
            ? String(brand.total_skus) 
            : brand.skus !== undefined 
              ? String(brand.skus) 
              : "",
        marketing_budget:
          brand.marketingBudget !== undefined
            ? String(brand.marketingBudget)
            : brand.marketing_budget !== undefined
              ? String(brand.marketing_budget)
              : brand.budget !== undefined
                ? String(brand.budget)
                : "",
        product_category:
          Array.isArray(brand.brandType) && brand.brandType.length > 0
            ? brand.brandType[0]
            : Array.isArray(brand.productCategory)
              ? brand.productCategory[0] || ""
              : Array.isArray(brand.product_category)
                ? brand.product_category[0] || ""
                : (typeof brand.productCategory === "string" 
                    ? brand.productCategory 
                    : typeof brand.product_category === "string"
                      ? brand.product_category
                      : typeof brand.category === "string"
                        ? brand.category
                        : Array.isArray(brand.category)
                          ? brand.category[0] || ""
                          : ""),
        website_url:
          brand.websiteUrl || brand.website_url || brand.website || "",
        instagram_url:
          brand.instagramUrl || brand.instagram_url || brand.instagram || "",
        facebook_url:
          brand.facebookUrl || brand.facebook_url || brand.facebook || "",
        youtube_url: brand.youtubeUrl || brand.youtube_url || brand.youtube || "",
        sellingOn: brand.sellingOn || brand.platforms || [],
        brand_authorization_letter_files: [],
        brand_authorization_letter:
          // Handle authorizationLetter from API (can be string URL or object with url property)
          (typeof brand.authorizationLetter === "string" && brand.authorizationLetter
            ? brand.authorizationLetter 
            : typeof brand.authorizationLetter === "object" && brand.authorizationLetter?.url
              ? brand.authorizationLetter.url
              : "") ||
          // Fallback to other possible field names
          (brand.brand_authorization_letter || brand.authorization_letter || ""),
        // Set company and location from context or data
        company_id: companyId || brand.company?._id || "",
        location_id: locationId || brand.location?._id || "",
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

  // Authorization letter preview
  const authorizationLetterFiles = useWatch({
    control,
    name: "brand_authorization_letter_files",
  });

  const authorizationLetterData = authorizationLetterFiles
    ? authorizationLetterFiles instanceof FileList
      ? authorizationLetterFiles[0] || null
      : Array.isArray(authorizationLetterFiles) && authorizationLetterFiles.length > 0
        ? authorizationLetterFiles[0] || null
        : authorizationLetterFiles instanceof File
          ? authorizationLetterFiles
          : null
    : null;

  const existingAuthorizationLetterUrl = useWatch({
    control,
    name: "brand_authorization_letter",
  });

  const { element: authorizationLetterPreview } = useImagePreview(
    authorizationLetterData,
    existingAuthorizationLetterUrl,
    {
      clear: () => {
        setValue("brand_authorization_letter_files", []);
        setValue("brand_authorization_letter", "");
      },
    },
  );

  const { remove, append } = useFieldArray({
    control,
    name: "sellingOn",
  });

  const hasEmptyPlatforms = sellingOn.some(
    (field) => !field?.platform || !field?.url,
  );

  const addPlatform = () => {
    const hasEmptyPlatforms = sellingOn.some(
      (platform) => !platform?.platform || !platform?.url,
    );
    if (hasEmptyPlatforms) {
      return;
    }

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
    console.log(
      "onSubmitForm", data
    );
    if (onSubmit) {
      onSubmit(data);
      return;
    }

    try {
      if (mode === MODE.ADD) {
        const formData = new FormData();
        
        Object.entries(data).forEach(([key, value]) => {
          if (key === "brand_logo_files" || key === "brand_authorization_letter_files") {
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

  // Show loading state while fetching brand data
  if (isLoadingBrand && (mode === MODE.EDIT || mode === MODE.VIEW)) {
    return (
      <PageContent
        header={{
          title: "Loading...",
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

  // Show error state if fetching failed
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
  
  const brandStatus = (currentBrandData as BrandApiResponse)?.status || ((currentBrandData as BrandApiResponse)?.isActive ? "active" : "inactive");

  return (
    <Form {...form}>
      <PageContent
        header={{
          title,
          description,
          actions: (
            <div className="flex flex-wrap gap-3">
              {(mode === MODE.VIEW || mode === MODE.EDIT) && (
                <StatusBadge
                  status={brandStatus}
                  module="brand"
                  variant="badge"
                >
                  {brandStatus}
                </StatusBadge>
              )}
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
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Card - Brand Details */}
              <div className="space-y-6 rounded-xl border bg-white p-8 shadow-sm">
                {/* Brand Logo Section */}
                <div className="space-y-4">
                  <h2 className="col-span-1 text-xl font-semibold text-gray-900">
                    Brand Logo
                  </h2>
                  <div className="flex items-center justify-start gap-6">
                    <div className="left-0 col-span-1 flex">{element}</div>
                    <div className="left-0 col-span-1 flex">
                      <FormFieldsRenderer<BrandFormData>
                        className="w-full grid-cols-1"
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
                  
                  {/* Show company and location as read-only when auto-determined */}
                  {companyId ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Company</div>
                        <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                          {(currentBrandData as BrandApiResponse)?.company?.companyName || 
                           companyData?.data?.companyName || 
                           (propCompanyId ? "Selected Company" : "Your Company")}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Location</div>
                        <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                          {(currentBrandData as BrandApiResponse)?.location ? 
                            `${(currentBrandData as BrandApiResponse).location!.addressLine1} - ${(currentBrandData as BrandApiResponse).location!.city}, ${(currentBrandData as BrandApiResponse).location!.state}` : 
                            (() => {
                              const location = locationData?.data?.items?.find(loc => loc._id === locationId);
                              return location ? `${location.addressLine1} - ${location.city}, ${location.state}` : 
                                     (locationId ? "Selected Location" : "Your Primary Location");
                            })()
                          }
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormFieldsRenderer<BrandFormData>
                        control={control}
                        fieldConfigs={[
                          {
                            ...brandFormSchema.company_location[0],
                            options: companyOptions,
                            disabled: mode === MODE.VIEW,
                          },
                          {
                            ...brandFormSchema.company_location[1],
                            options: locationOptions,
                            disabled: mode === MODE.VIEW || !watchedCompanyId,
                          },
                        ] as FormFieldConfig<BrandFormData>[]}
                        className="contents"
                      />
                    </div>
                  )}
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
                      disabled={hasEmptyPlatforms || mode === MODE.VIEW}
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
                    <div className="text-center py-8 text-gray-500">
                      <p>No platforms added yet. Click &quot;Add Platform&quot; to get started.</p>
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
                  </h2>
                  <div className="flex items-center justify-start gap-6">
                    <div className="left-0 col-span-1 flex">{authorizationLetterPreview}</div>
                    <div className="left-0 col-span-1 flex">
                      <FormFieldsRenderer<BrandFormData>
                        control={control}
                        fieldConfigs={
                          brandFormSchema.brand_authorization_letter.map(
                            (field) => ({
                              ...field,
                              disabled: mode === MODE.VIEW,
                            }),
                          ) as FormFieldConfig<BrandFormData>[]
                        }
                        className="w-full !sm:grid-cols-2 !grid !grid-cols-1 !gap-4"
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
                  {submitting ? "Saving..." : mode === MODE.EDIT ? "Update Brand" : "Create Brand"}
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
