// COMMENTED OUT - OLD BRAND FORM
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from "@/core/components/ui/avatar";
// import { Button } from "@/core/components/ui/button";
// import { Form } from "@/core/components/ui/form";
// import {
//   FormInput,
//   type FormFieldConfig,
// } from "@/core/components/ui/form-input";
// import { Container, PageContent } from "@/core/components/ui/structure";
// import { cn } from "@/core/utils";
// import {
//   useEffect,
//   useState,
//   type ComponentProps,
//   type ReactNode,
// } from "react";
// import { useForm, type Control, type FieldValues } from "react-hook-form";
// import { useParams } from "react-router";
// import {
//   brandFormSchema,
//   defaultValues,
//   type BrandFormData,
// } from "./formSchema";

// const BrandForm = () => {
//   const { id } = useParams();
//   const form = useForm<BrandFormData>({
//     defaultValues: defaultValues,
//   });
//   const { control, watch, reset, handleSubmit } = form;
//   const [logo, setLogo] = useState("");

//   const logoForm = watch("logo_files");

//   useEffect(() => {
//     const logoObj = logoForm?.[0];
//     if (logoObj) {
//       const url = URL.createObjectURL(logoObj);
//       setLogo(url);
//       return () => {
//         URL.revokeObjectURL(url);
//       };
//     }
//   }, [logoForm]);

//   const onSubmit = (data: unknown) => {
//     console.log(data);
//   };

//   const action = (
//     <div className="flex justify-end gap-4">
//       <Button variant={"outlined"} type="reset" onClick={() => reset()}>
//         Reset
//       </Button>
//       <Button color={"primary"} type="submit">
//         Save
//       </Button>
//     </div>
//   );

//   return (
//     <Form {...form}>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//         <PageContent
//           header={{
//             title: id ? "Edit Brand" : "Add Brand",
//             actions: action,
//           }}
//         >
//           <Container className="space-y-5">
//             <div className="flex items-center gap-2 md:gap-4">
//               <Avatar className="size-28 rounded-md border">
//                 <AvatarImage src={logo} alt="Logo" />
//                 <AvatarFallback className="rounded-md"></AvatarFallback>
//               </Avatar>
//               <FormConditionRender
//                 className="flex"
//                 control={control}
//                 formSchema={brandFormSchema.uploadImage}
//               />
//             </div>
//             <Card name={"Brand Information"}>
//               <FormConditionRender
//                 control={control}
//                 formSchema={brandFormSchema.brand_information}
//               />
//             </Card>
//             <Card name={"Personal Information"}>
//               <FormConditionRender
//                 control={control}
//                 formSchema={brandFormSchema.personal_information}
//               />
//             </Card>
//             <Card name={"Password"}>
//               <FormConditionRender
//                 control={control}
//                 formSchema={brandFormSchema.password}
//                 className="lg:grid-cols-2"
//               />
//             </Card>
//             <Card name={"Legal Documents"}>
//               <FormConditionRender
//                 control={control}
//                 formSchema={brandFormSchema.legal_documents}
//               />
//             </Card>

//             <Card name={"Address"}>
//               <FormConditionRender
//                 control={control}
//                 formSchema={brandFormSchema.address}
//               />
//             </Card>

//             {action}
//           </Container>
//         </PageContent>
//       </form>
//     </Form>
//   );
// };

// COMMENTED OUT - OLD BRAND FORM COMPONENTS
// interface FormConditionRenderProps<T extends FieldValues>
//   extends ComponentProps<"div"> {
//   formSchema: FormFieldConfig<T>[];
//   control: Control<T>;
// }

// function FormConditionRender<T extends FieldValues>({
//   formSchema,
//   control,
//   className,
//   ...props
// }: FormConditionRenderProps<T>) {
//   return (
//     <div
//       className={cn(
//         "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
//         className,
//       )}
//       {...props}
//     >
//       {formSchema.map((item: FormFieldConfig<T>) => {
//         return <FormInput key={item.name} {...item} control={control} />;
//       })}
//     </div>
//   );
// }

// function Card({ children, name }: { children: ReactNode; name: string }) {
//   return (
//     <section>
//       <h2 className="text-lg font-medium">{name}</h2>
//       <hr className="mt-2 mb-5" />
//       {children}
//     </section>
//   );
// }

// NEW BRAND FORM COMPONENT BASED ON IMAGES
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
// import { apiGetAllProductCategories } from "@/modules/panel/services/http/master.service";
import { apiGetBrandById, apiCreateBrand, apiUpdateBrandById } from "@/modules/panel/services/http/brand.service";
import { apiGetCompaniesForFilter, apiGetCompanyLocations } from "@/modules/panel/services/http/company.service";
import { useQuery } from "@tanstack/react-query";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useParams, useLocation, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import {
  brandFormSchema,
  defaultValues,
  type BrandFormData,
} from "./formSchema";

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

const BrandForm = () => {
  const { id, companyId, locationId } = useParams();
  const location = useLocation();
  const pathname = location.pathname;
  const [searchParams] = useSearchParams();

  // Force re-render debugging
  console.log("=== BRAND FORM COMPONENT MOUNTED/RE-RENDERED ===");
  console.log("Full location object:", location);
  console.log("Current pathname:", pathname);
  console.log("Current search:", location.search);
  console.log("Current hash:", location.hash);

  // Determine mode based on URL path
  let mode = MODE.ADD;
  if (id) {
    if (pathname.endsWith("/view")) {
      mode = MODE.VIEW;
      console.log("DETECTED VIEW MODE - pathname ends with /view");
    } else if (pathname.endsWith("/edit")) {
      mode = MODE.EDIT;
      console.log("DETECTED EDIT MODE - pathname ends with /edit");
    } else {
      mode = MODE.EDIT; // fallback
      console.log("DETECTED FALLBACK MODE - defaulting to EDIT");
    }
  }

  // Debug logging
  console.log("Brand Form Debug:", {
    id,
    pathname,
    mode,
    isViewMode: mode === MODE.VIEW,
    isEditMode: mode === MODE.EDIT,
    isAddMode: mode === MODE.ADD,
    pathnameIncludesView: pathname.includes("/view/"),
    pathnameIncludesEdit: pathname.includes("/edit/"),
    MODE_VALUES: { ADD: MODE.ADD, EDIT: MODE.EDIT, VIEW: MODE.VIEW },
  });

  // State for company and location options
  const [companyOptions, setCompanyOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [locationOptions, setLocationOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const form = useForm<BrandFormData>({
    defaultValues: defaultValues,
  });

  const { control, setValue, handleSubmit, reset, watch } = form;

  // Watch company_id to update location options
  const watchedCompanyId = watch("company_id");

  // Fetch companies for dropdown
  const {
    data: companiesData,
    isLoading: isLoadingCompanies,
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
  });

  // Fetch locations for selected company
  const {
    data: locationsData,
    isLoading: isLoadingLocations,
  } = useQuery({
    queryKey: ["company-locations-for-brand-form", watchedCompanyId],
    queryFn: () =>
      apiGetCompanyLocations<{
        statusCode: number;
        data: {
          items: Array<{ _id: string; addressLine1: string; city: string }>;
          page: number;
          limit: number;
          total: number;
        };
        message: string;
      }>(watchedCompanyId!, {
        page: 1,
        limit: 100,
      }),
    select: (data) => data?.data?.items || [],
    enabled: !!watchedCompanyId,
    retry: 1,
  });

  // Fetch brand data for edit and view modes
  const {
    data: brandData,
    isLoading: isLoadingBrand,
    error: brandError,
  } = useQuery({
    queryKey: ["brand", id],
    queryFn: () => {
      console.log("Fetching brand data for ID:", id);
      return apiGetBrandById<{ data: BrandApiResponse }>(id!);
    },
    enabled: !!id && (mode === MODE.EDIT || mode === MODE.VIEW),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
        label: `${location.addressLine1} - ${location.city}`,
        value: location._id,
      }));
      setLocationOptions(options);
    } else {
      setLocationOptions([]);
    }
  }, [locationsData]);

  // Auto-fill company and location from URL parameters
  useEffect(() => {
    const urlCompanyId = companyId || searchParams.get("companyId");
    const urlLocationId = locationId || searchParams.get("locationId");
    
    if (urlCompanyId && companyOptions.length > 0) {
      setValue("company_id", urlCompanyId);
      setSelectedCompanyId(urlCompanyId);
    }
    
    if (urlLocationId && locationOptions.length > 0) {
      setValue("location_id", urlLocationId);
    }
  }, [companyId, locationId, searchParams, companyOptions, locationOptions, setValue]);

  // Reset location when company changes
  useEffect(() => {
    if (watchedCompanyId !== selectedCompanyId) {
      setValue("location_id", "");
      setSelectedCompanyId(watchedCompanyId);
    }
  }, [watchedCompanyId, selectedCompanyId, setValue]);

  // Populate form with existing data when in edit or view mode
  useEffect(() => {
    if (brandData && (mode === MODE.EDIT || mode === MODE.VIEW)) {
      console.log("Brand data received:", brandData);
      const brand = brandData.data || brandData;
      console.log("Brand object:", brand);
      console.log("Description field (aboutTheBrand):", brand.aboutTheBrand);
      console.log("Status field (isActive):", brand.isActive);
      console.log("Logo field (logoImage):", brand.logoImage);
      console.log("Logo URL:", brand.logoImage?.url);
      console.log("Authorization letter:", brand.authorizationLetter);
      console.log("Authorization letter URL:", brand.authorizationLetter?.url);
      console.log("Name field:", brand.name);

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
        // average_selling_price: (brand as any).average_selling_price || (brand as any).asp || "2",
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

      console.log("Form data being set:", formData);
      reset(formData);

      // Check form values after reset
      setTimeout(() => {
        const currentValues = form.getValues();
        console.log("Form values after reset:", currentValues);
        console.log("Description after reset:", currentValues.description);
      }, 100);
    }
  }, [brandData, mode, reset, form]);

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

  // Fetch product categories for dropdown
  // const { data: categoriesResponse } =
  //   useQuery({
  //     queryKey: ["productCategories"],
  //     queryFn: () => apiGetAllProductCategories(),
  //     staleTime: 5 * 60 * 1000, // 5 minutes
  //   });

  // const formatted =
  //   categoriesResponse?.data.map((item) => ({
  //     value: item._id,
  //     label: item.name,
  //   })) ?? [];

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
          if (key === 'brand_logo_files' || key === 'brand_authorization_letter_files') {
            // Handle file arrays
            if (Array.isArray(value) && value.length > 0) {
              value.forEach((file, index) => {
                formData.append(`${key}[${index}]`, file);
              });
            }
          } else if (key === 'sellingOn') {
            // Handle selling platforms array
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            }
          } else {
            // Handle regular fields
            formData.append(key, String(value || ''));
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

  // Force re-render when pathname changes
  useEffect(() => {
    console.log("=== PATHNAME CHANGED ===");
    console.log("New pathname:", pathname);
    console.log("New mode:", mode);
  }, [pathname, mode]);

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

  // Debug the mode before rendering
  console.log(
    "Rendering Brand Form with mode:",
    mode,
    "Title will be:",
    mode === MODE.VIEW
      ? "View Brand"
      : mode === MODE.EDIT
        ? "Edit Brand"
        : "Create Brand",
  );

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

export default BrandForm;
