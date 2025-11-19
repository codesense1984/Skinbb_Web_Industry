import { createUrlValidator, VALIDATION_CONSTANTS } from "@/core/utils";
import { z } from "zod";


// Selling platform schema
const sellingPlatformSchema = z
  .object({
    platform: z.string().optional(),
    url: z.string().optional(),
  })
  .optional()
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
export const createBrandZodSchema = (options: {
  companyId?: string;
  locationId?: string;
  isEdit?: boolean;
}) => {
  const { companyId, locationId, isEdit = false } = options;

  const baseSchema = z.object({
    // Brand Logo
    brand_logo_files: z.array(z.instanceof(File)).optional(),
    brand_logo: z.string().optional(),

    // Company and Location
    company_id: companyId
      ? z.string().default(companyId)
      : z.string().min(1, "Company is required"),
    location_id: locationId
      ? z.string().default(locationId)
      : z.string().min(1, "Location is required"),

    // Brand Information
    brand_name: z.string().min(1, "Brand name is required"),
    description: z.string().optional(),
    website_url: createUrlValidator("Website"),
    total_skus: z.string().optional(),
    marketing_budget: z.string().optional(),
    product_category: z.string().optional(),
    average_selling_price: z.string().optional(),

    // Social Media URLs (Optional)
    instagram_url: createUrlValidator("Instagram"),
    facebook_url: createUrlValidator("Facebook"),
    youtube_url: createUrlValidator("YouTube"),

    // Selling Platforms
    sellingOn: z.array(sellingPlatformSchema).optional().default([]),

    // Brand Authorization Letter - required only on create, optional on edit
    brand_authorization_letter_files: z.array(z.any()).optional(),
    brand_authorization_letter: z.string().optional(),

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
