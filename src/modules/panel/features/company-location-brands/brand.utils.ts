import { createFormData } from "@/core/utils";
import type { BrandFormData } from "./brand.schema";
import { ENDPOINTS } from "../../config/endpoint.config";

/**
 * Transforms brand form data into API request format
 * @param brandData - The brand form data to transform
 * @returns Formatted data for API requests
 */
export const transformBrandDataForApi = (brandData?: BrandFormData) => {
  const requestData: any = {
    name: brandData?.name || "",
    aboutTheBrand: brandData?.aboutTheBrand || "",
    websiteUrl: brandData?.websiteUrl || "",
    totalSKU: brandData?.totalSKU ? String(brandData.totalSKU) : "0",
    marketingBudget: brandData?.marketingBudget
      ? String(brandData.marketingBudget)
      : "",
    instagramUrl: brandData?.instagramUrl || "",
    facebookUrl: brandData?.facebookUrl || "",
    youtubeUrl: brandData?.youtubeUrl || "",
    productCategory: brandData?.productCategory || [],
    sellingOn: brandData?.sellingOn || [],
  };

  if (brandData?._id) {
    requestData._id = brandData?._id;
  }

  if (brandData?.authorizationLetter_files) {
    requestData.authorizationLetter = brandData?.authorizationLetter_files;
  }
  if (brandData?.logo_files) {
    requestData.logoImage = brandData?.logo_files;
  }

  return requestData;
};

/**
 * Creates form data for brand API requests
 * @param brandData - The brand form data
 * @returns FormData object ready for API submission
 */
export const createBrandFormData = (brandData: BrandFormData) => {
  const apiData = transformBrandDataForApi(brandData);
  return createFormData(apiData, ["sellingOn"]);
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
    ENDPOINTS.COMPANY_LOCATION_BRANDS.LIST(companyId, locationId),
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
