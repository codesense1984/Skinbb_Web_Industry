import { createFormData } from "@/core/utils";
import type { Brand } from "@/modules/panel/types/brand.type";
import type { BrandFormData } from "./brand.schema";

/**
 * Creates form data for brand API requests
 * @param brandData - The brand form data
 * @returns FormData object ready for API submission
 */
export const createBrandFormData = (brandData: Record<string, unknown>) => {
  return createFormData(brandData, ["sellingOn"]);
};

/**
 * Transforms BrandFormData to Brand type
 * @param data - The brand form data
 * @returns Brand object with transformed data
 */
export const transformBrandFormDataToBrand = (data: BrandFormData): Brand => {
  const dataRecord = data as Record<string, unknown>;

  return {
    name:
      (dataRecord.brand_name as string) || (dataRecord.name as string) || "",
    aboutTheBrand: (dataRecord.description as string) || "",
    websiteUrl: (dataRecord.website_url as string) || "",
    totalSKU: Number(dataRecord.total_skus) || 0,
    marketingBudget: Number(dataRecord.marketing_budget) || 0,
    instagramUrl: (dataRecord.instagram_url as string) || "",
    facebookUrl: (dataRecord.facebook_url as string) || "",
    youtubeUrl: (dataRecord.youtube_url as string) || "",
    brandType: Array.isArray(dataRecord.product_category)
      ? (dataRecord.product_category as string[])
      : dataRecord.product_category
        ? [dataRecord.product_category as string]
        : [],
    sellingOn: Array.isArray(dataRecord.sellingOn)
      ? (dataRecord.sellingOn as Array<{ platform: string; url: string }>)
      : [],
    authorizationLetter: Array.isArray(
      dataRecord.brand_authorization_letter_files,
    )
      ? (dataRecord.brand_authorization_letter_files[0] as File[])
      : undefined,
    logoImage: Array.isArray(dataRecord.brand_logo_files)
      ? (dataRecord.brand_logo_files as File[])
      : undefined,
  };
};

/**
 * Extracts IDs from BrandFormData
 * @param data - The brand form data
 * @returns Object containing brandId, companyId, and locationId
 */
export const extractBrandIds = (data: BrandFormData) => {
  const dataRecord = data as Record<string, unknown>;
  return {
    brandId: (dataRecord._id as string) || "",
    companyId: (dataRecord.company_id as string) || "",
    locationId: (dataRecord.location_id as string) || "",
  };
};

/**
 * Common query keys for brand-related queries
 */
export const BRAND_QUERY_KEYS = {
  BRAND_DETAIL: (companyId: string, locationId: string, brandId: string) => [
    "company-location-brand",
    companyId,
    locationId,
    brandId,
  ],
  BRANDS_LIST: (companyId: string, locationId: string) => [
    `company-${companyId}-location-${locationId}-brands`,
  ],
} as const;

/**
 * Common success messages for brand operations
 */
export const BRAND_MESSAGES = {
  CREATE_SUCCESS: "Brand created successfully!",
  UPDATE_SUCCESS: "Brand updated successfully!",
  LOAD_ERROR: "Failed to load brand data",
  CREATE_ERROR: "Failed to create brand",
  UPDATE_ERROR: "Failed to update brand",
} as const;

/**
 * Common error messages for validation
 */
export const BRAND_ERROR_MESSAGES = {
  MISSING_IDS: "Missing company or location ID",
  MISSING_BRAND_ID: "Missing company, location, or brand ID",
} as const;
