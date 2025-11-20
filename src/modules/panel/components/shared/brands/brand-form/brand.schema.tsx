import type { FormFieldConfig } from "@/core/components/ui/form-input";
import { STATUS_MAP } from "@/core/config/status";
import { MODE } from "@/core/types";
import {
  createOptionalString,
  createRequiredString,
  createUrlValidator,
  VALIDATION_CONSTANTS,
} from "@/core/utils";
import { z } from "zod";

// Selling platform schema
const sellingPlatformSchema = z
  .object({
    platform: createRequiredString("Platform"),
    url: createOptionalString(),
  })
  .superRefine((platform, ctx) => {
    if (platform?.platform && platform.platform.trim() !== "") {
      // URL is required only when platform is "other"
      if (platform.platform.toLowerCase() === "other") {
        if (!platform.url || platform.url.trim() === "") {
          ctx.addIssue({
            path: ["url"],
            code: z.ZodIssueCode.custom,
            message: "URL is required when platform is 'Other'",
          });
          return;
        }
      }

      // Validate URL format only if URL is provided
      if (platform.url && platform.url.trim() !== "") {
        if (!VALIDATION_CONSTANTS.URL.REGEX.test(platform.url)) {
          ctx.addIssue({
            path: ["url"],
            code: z.ZodIssueCode.custom,
            message:
              "Please enter a valid URL (e.g., https://amazon.in, https://flipkart.com)",
          });
        }
      }
    }
  });

// Base brand schema
export const createBrandZodSchema = (options: { isEdit?: boolean }) => {
  const { isEdit = false } = options;

  const baseSchema = z.object({
    // Brand Logo
    brand_logo_files: z.array(z.instanceof(File)).optional(),
    brand_logo: createOptionalString(),

    // Company and Location
    company_id: createRequiredString("Company"),
    location_id: createRequiredString("Location"),

    // Brand Information
    brand_name: createRequiredString("Brand name"),
    status: createOptionalString(),
    description: createOptionalString(),
    website_url: createUrlValidator("Website"),
    total_skus: createRequiredString("Total SKUs"),
    marketing_budget: createRequiredString("Marketing budget"),
    product_category: createRequiredString("Product category"),
    // average_selling_price: createRequiredString("Average selling price"),

    // Social Media URLs (Optional)
    instagram_url: createUrlValidator("Instagram"),
    facebook_url: createUrlValidator("Facebook"),
    youtube_url: createUrlValidator("YouTube"),

    // Selling Platforms
    sellingOn: z.array(sellingPlatformSchema),

    // Brand Authorization Letter - required only on create, optional on edit
    brand_authorization_letter_files: z.array(z.any()).optional(),
    brand_authorization_letter: isEdit
      ? createOptionalString()
      : createRequiredString("Brand authorization letter"),

    // Additional fields for edit mode
    _id: z.string().optional(),
    companyName: z.string().optional(),
    locationAddress: z.string().optional(),
  });

  // Add custom validation for Brand Authorization Letter on create
  if (!isEdit) {
    return baseSchema.refine(
      (data) => {
        const hasFiles =
          data.brand_authorization_letter_files &&
          data.brand_authorization_letter_files.length > 0;
        const hasUrl =
          data.brand_authorization_letter &&
          data.brand_authorization_letter.length > 0;
        return hasFiles || hasUrl;
      },
      {
        message: "Brand Authorization Letter is required",
        path: ["brand_authorization_letter_files"],
      },
    );
  }

  return baseSchema;
};

export type BrandFormData = z.infer<ReturnType<typeof createBrandZodSchema>>;

export const defaultValues: BrandFormData = {
  // Brand Logo
  brand_logo_files: [],
  brand_logo: "",

  // Company and Location
  company_id: "",
  location_id: "",

  // Brand Information
  brand_name: "",
  description: "",
  status: STATUS_MAP.brand.pending.value,
  website_url: "",
  total_skus: "",
  marketing_budget: "",
  product_category: "",
  // average_selling_price: "2",

  // Social Media URLs (Optional)
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",

  // Selling Platforms
  sellingOn: [],

  // Brand Authorization Letter
  brand_authorization_letter_files: [],
  brand_authorization_letter: "",

  // Additional fields for edit mode
  _id: "",
  companyName: "",
  locationAddress: "",
};
export interface ModeProps {
  mode: MODE;
}

export interface SellingPlatformProps extends ModeProps {
  index: number;
  availableOptions?: Array<{ label: string; value: string }>;
}

export type BrandFormSchema = Record<string, FormFieldConfig<BrandFormData>[]>;

const ACCEPTED_FILE_TYPES = ["application/pdf"];
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"] as const;

export const brandFormSchema: BrandFormSchema = {
  uploadbrandImage: [
    {
      type: "file",
      name: "brand_logo_files",
      label: "Brand Logo",
      placeholder: "Upload",
      className: "w-full",
      inputProps: {
        accept: ACCEPTED_IMAGE_TYPES.join(", "),
      },
    },
  ],

  company_location: [
    {
      type: "select",
      name: "company_id",
      label: "Company",
      placeholder: "Select company",
      options: [], // Will be populated dynamically
      required: true,
      rules: {
        required: "Company is required",
      },
    },
    {
      type: "select",
      name: "location_id",
      label: "Location",
      placeholder: "Select location",
      options: [], // Will be populated dynamically
      required: true,
      rules: {
        required: "Location is required",
      },
    },
  ],

  brand_information: [
    {
      type: "text",
      name: "brand_name",
      label: "Brand Name",
      placeholder: "Enter brand name",
      required: true,
      className: "w-full md:col-span-2",
      rules: {
        required: "Brand name is required",
      },
    },
    {
      type: "combobox",
      options: Object.values(STATUS_MAP.brand).map((status) => ({
        label: status.label,
        value: status.value,
      })),
      name: "status",
      label: "Status",
      placeholder: "Select status",
      disabled: true,
      className: "w-full md:col-span-2",
    },
    {
      type: "rich_text",
      name: "description",
      label: "Description",
      placeholder: "Enter brand description",
      className: "col-span-full",
    },
    {
      type: "text",
      name: "website_url",
      label: "Website URL",
      placeholder: "Enter website URL",
    },
    {
      type: "text",
      name: "total_skus",
      label: "Total No of SKUs",
      placeholder: "Enter number of SKUs",
      required: true,
      inputProps: {
        keyfilter: "int",
      },
    },
    {
      type: "text",
      name: "marketing_budget",
      label: "Marketing Budget",
      placeholder: "Enter marketing budget",
      required: true,
      inputProps: {
        keyfilter: "int",
      },
    },
    {
      type: "select",
      name: "product_category",
      label: "Product Category",
      placeholder: "Select product category",
      required: true,
      options: [], // Will be populated dynamically
    },
    // {
    //   type: "text",
    //   name: "average_selling_price",
    //   label: "Average Selling Price (ASP)",
    //   placeholder: "Enter average selling price",
    // },
  ],

  social_media_urls: [
    {
      type: "text",
      name: "instagram_url",
      label: "Instagram URL (Optional)",
      placeholder: "https://instagram.com/yourbrand",
    },
    {
      type: "text",
      name: "facebook_url",
      label: "Facebook URL (Optional)",
      placeholder: "https://facebook.com/yourbrand",
    },
    {
      type: "text",
      name: "youtube_url",
      label: "YouTube URL (Optional)",
      placeholder: "https://youtube.com/yourchannel",
    },
  ],

  selling_platforms: [
    {
      type: "select",
      name: "platform" as keyof BrandFormData,
      label: "Platform",
      placeholder: "Select...",
      options: [
        { label: "Amazon", value: "amazon" },
        { label: "Flipkart", value: "flipkart" },
        { label: "Myntra", value: "myntra" },
        { label: "Nykaa", value: "nykaa" },
        { label: "Purplle", value: "purplle" },
        { label: "Other", value: "other" },
      ],
    },
    {
      type: "text",
      name: "url" as keyof BrandFormData,
      label: "Platform URL",
      placeholder: "e.g., https://amazon.in, https://flipkart.co",
    },
  ],

  brand_authorization_letter: [
    {
      type: "file",
      name: "brand_authorization_letter",
      label: "Upload Brand Authorisation Letter",
      placeholder: "Upload file",
      inputProps: {
        accept: ACCEPTED_FILE_TYPES.join(", "),
      },
    },
  ],
};
