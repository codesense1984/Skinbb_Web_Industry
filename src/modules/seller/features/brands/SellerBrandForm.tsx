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
import {
  apiGetBrandById,
  apiCreateBrand,
  apiUpdateBrandById,
} from "@/modules/panel/services/http/brand.service";
import { useQuery } from "@tanstack/react-query";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useParams, useLocation, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import {
  brandFormSchema,
  defaultValues,
  type BrandFormData,
} from "@/modules/panel/features/brands/brand-form/formSchema";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import { Label } from "@/core/components/ui/label";

// Interface for brand API response
interface BrandApiResponse {
  name?: string;
  aboutTheBrand?: string;
  isActive?: boolean;
  logoImage?: { url?: string };
  authorizationLetter?: { url?: string };
  total_skus?: string;
  skus?: string;
  marketing_budget?: string;
  budget?: string;
  product_category?: string;
  category?: string;
  instagram_url?: string;
  instagram?: string;
  facebook_url?: string;
  facebook?: string;
  youtube_url?: string;
  youtube?: string;
  sellingOn?: Array<{ platform: string; url: string }>;
  platforms?: Array<{ platform: string; url: string }>;
  brand_logo?: string;
  logo?: string;
  brand_name?: string;
  description?: string;
  brand_authorization_letter?: string;
  authorization_letter?: string;
}

const SellerBrandForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const pathname = location.pathname;
  const [searchParams] = useSearchParams();
  const { sellerInfo, isLoading: sellerInfoLoading } = useSellerAuth();

  // Determine mode based on URL path
  let mode = MODE.ADD;
  if (id) {
    if (pathname.endsWith("/view")) {
      mode = MODE.VIEW;
    } else if (pathname.endsWith("/edit")) {
      mode = MODE.EDIT;
    } else {
      mode = MODE.EDIT; // fallback
    }
  }

  // State for location options
  const [locationOptions, setLocationOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const form = useForm<BrandFormData>({
    defaultValues: defaultValues,
  });

  const { control, setValue, handleSubmit, reset, watch } = form;

  // console.log(watch(),"watch");

  // Fetch brand data for edit and view modes
  const {
    data: brandData,
    isLoading: isLoadingBrand,
    error: brandError,
  } = useQuery({
    queryKey: ["brand", id],
    queryFn: () => {
      return apiGetBrandById<{ data: BrandApiResponse }>(id!);
    },
    enabled: !!id && (mode === MODE.EDIT || mode === MODE.VIEW),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Populate location options from seller addresses
  useEffect(() => {
    if (sellerInfo?.addresses) {
      const options = sellerInfo.addresses.map((address) => ({
        label: `${address.addressLine1} - ${address.city}`,
        value: address.addressId,
      }));
      setLocationOptions(options);
    }
  }, [sellerInfo?.addresses]);

  // Auto-fill company and location from seller info
  useEffect(() => {
    if (sellerInfo && mode === MODE.ADD) {
      // Always set company ID from seller info
      setValue("company_id", sellerInfo.companyId);

      // Auto-fill location if only one location exists
      if (sellerInfo.addresses.length === 1) {
        setValue("location_id", sellerInfo.addresses[0].addressId);
      }
    }
  }, [sellerInfo, mode, setValue]);

  // Populate form with existing data when in edit or view mode
  useEffect(() => {
    if (brandData && (mode === MODE.EDIT || mode === MODE.VIEW)) {
      const brand = brandData.data || brandData;

      const formData = {
        brand_logo_files: [],
        brand_logo:
          brand.logoImage?.url ||
          (brand as any).brand_logo ||
          (brand as any).logo ||
          "",
        brand_name: brand.name || (brand as any).brand_name || "",
        description: brand.aboutTheBrand || (brand as any).description || "",
        status: brand.isActive ? "active" : "inactive",
        total_skus: (brand as any).total_skus || (brand as any).skus || "",
        marketing_budget:
          (brand as any).marketing_budget || (brand as any).budget || "",
        product_category:
          (brand as any).product_category || (brand as any).category || "",
        instagram_url:
          (brand as any).instagram_url || (brand as any).instagram || "",
        facebook_url:
          (brand as any).facebook_url || (brand as any).facebook || "",
        youtube_url: (brand as any).youtube_url || (brand as any).youtube || "",
        sellingOn: (brand as any).sellingOn || (brand as any).platforms || [],
        brand_authorization_letter_files: [],
        brand_authorization_letter:
          brand.authorizationLetter?.url ||
          (brand as any).brand_authorization_letter ||
          (brand as any).authorization_letter ||
          "",
      };

      reset(formData);
    }
  }, [brandData, mode, reset]);

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

  const hasEmptyPlatforms = sellingOn.some(
    (field) => !field?.platform || !field?.url,
  );

  const addPlatform = () => {
    // Check if there are any empty platforms first
    const hasEmptyPlatforms = sellingOn.some(
      (platform) => !platform?.platform || !platform?.url,
    );
    if (hasEmptyPlatforms) {
      // Don't add new platform if there are empty ones
      return;
    }

    // Check if there are duplicate platforms
    if (hasDuplicatePlatforms()) {
      // Don't add new platform if there are duplicates
      return;
    }

    append({ platform: "", url: "" });
  };

  // Get available platform options (exclude already selected ones, except "Other")
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
      // "Other" can be selected multiple times
      if (option.value === "other") {
        return true;
      }
      // All other platforms can only be selected once
      return !selectedPlatforms.includes(option.value);
    });
  };

  // Check if there are duplicate platforms (excluding "Other")
  const hasDuplicatePlatforms = () => {
    const platforms = sellingOn
      .map((platform) => platform?.platform)
      .filter(Boolean)
      .filter((platform) => platform !== "other"); // Exclude "Other" from duplicate check

    return new Set(platforms).size !== platforms.length;
  };

  const onSubmit = async (data: BrandFormData) => {
    console.log("Brand form data:", data);

    try {
      if (mode === MODE.ADD) {
        // Create new brand
        const formData = new FormData();

        // Add form fields to FormData
        Object.entries(data).forEach(([key, value]) => {
          if (
            key === "brand_logo_files" ||
            key === "brand_authorization_letter_files"
          ) {
            // Handle file arrays
            if (Array.isArray(value) && value.length > 0) {
              value.forEach((file, index) => {
                formData.append(`${key}[${index}]`, file);
              });
            }
          } else if (key === "sellingOn") {
            // Handle selling platforms array
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            }
          } else {
            // Handle regular fields
            formData.append(key, String(value || ""));
          }
        });

        const response = await apiCreateBrand(formData);
        console.log("Brand created successfully:", response);
        // Handle success (e.g., redirect, show success message)
      } else if (mode === MODE.EDIT && id) {
        // Update existing brand
        const response = await apiUpdateBrandById(id, data);
        console.log("Brand updated successfully:", response);
        // Handle success (e.g., redirect, show success message)
      }
    } catch (error) {
      console.error("Error submitting brand form:", error);
      // Handle error (e.g., show error message)
    }
  };

  // Show loading state while fetching seller info or brand data
  if (
    sellerInfoLoading ||
    (isLoadingBrand && (mode === MODE.EDIT || mode === MODE.VIEW))
  ) {
    return (
      <PageContent
        header={{
          title: "Loading...",
          description: "Fetching data",
        }}
      >
        <div className="w-full">
          <div className="bg-background rounded-xl border p-8 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Loading...</p>
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
                <p className="text-sm text-gray-600">Brand ID: {id}</p>
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

  // Show error if seller info is not available
  if (!sellerInfo?.companyId) {
    return (
      <PageContent
        header={{
          title: "Error",
          description: "Unable to load company information",
        }}
      >
        <div className="w-full">
          <div className="bg-background rounded-xl border p-8 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="mb-4 text-red-600">
                  Company information not available
                </p>
                <p className="text-sm text-gray-600">Please contact support.</p>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  // Show error if seller has no addresses
  if (!sellerInfo.addresses || sellerInfo.addresses.length === 0) {
    return (
      <PageContent
        header={{
          title: "Error",
          description: "No company locations found",
        }}
      >
        <div className="w-full">
          <div className="bg-background rounded-xl border p-8 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="mb-4 text-red-600">
                  No company locations available
                </p>
                <p className="text-sm text-gray-600">
                  Please contact support to set up company locations.
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
      <PageContent
        header={{
          title:
            mode === MODE.VIEW
              ? "View Brand"
              : mode === MODE.EDIT
                ? "Edit Brand"
                : "Create Brand",
          description:
            mode === MODE.VIEW
              ? "View brand information"
              : mode === MODE.EDIT
                ? "Update your brand information"
                : "Add a new brand to your portfolio",
        }}
      >
        <div className="w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Company Field - Always disabled and autofilled */}
                    <div className="space-y-2">
                      <Label className="gap-0">
                        Company<span className="text-destructive">*</span>
                      </Label>
                      <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                        {sellerInfo.companyName}
                      </div>
                      <p className="text-xs text-gray-500">
                        Company is automatically set based on your account
                      </p>
                      <input
                        type="hidden"
                        {...form.register("company_id")}
                        value={sellerInfo.companyId}
                      />
                    </div>

                    {/* Location Field - Conditional rendering */}
                    {sellerInfo.addresses.length === 1 ? (
                      // Single location - show as disabled field
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Location
                        </label>
                        <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                          {`${sellerInfo.addresses[0].addressLine1} - ${sellerInfo.addresses[0].city}`}
                        </div>
                        <p className="text-xs text-gray-500">
                          Location is automatically set to your company's only
                          location
                        </p>
                        <input
                          type="hidden"
                          {...form.register("location_id")}
                          value={sellerInfo.addresses[0].addressId}
                        />
                      </div>
                    ) : (
                      // Multiple locations - show dropdown
                      <div className="space-y-2">
                        <FormFieldsRenderer<BrandFormData>
                          control={control}
                          fieldConfigs={
                            [
                              {
                                ...brandFormSchema.company_location[1],
                                options: locationOptions,
                                disabled: mode === MODE.VIEW,
                                placeholder: "Select location",
                              },
                            ] as FormFieldConfig<BrandFormData>[]
                          }
                          className="contents"
                        />
                        <p className="text-xs text-gray-500">
                          Select the location where this brand will be managed
                        </p>
                      </div>
                    )}
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
                  </h2>
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
                    className="!sm:grid-cols-2 !grid !grid-cols-1 !gap-4"
                  />
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
                <Button type="submit" color="primary" className="px-6 py-2">
                  {mode === MODE.EDIT ? "Update Brand" : "Create Brand"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </PageContent>
    </Form>
  );
};

export default SellerBrandForm;
