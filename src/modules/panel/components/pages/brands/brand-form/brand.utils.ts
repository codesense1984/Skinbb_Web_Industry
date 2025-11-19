import { createFormData } from "@/core/utils";
import type { BrandFormData } from "./brand.schema";
import { ENDPOINTS } from "../../../../config/endpoint.config";

/**
 * Transforms brand form data into API request format
 * @param brandData - The brand form data to transform
 * @returns Formatted data for API requests
 */
// export const transformBrandDataForApi = (brandData?: BrandFormData) => {
//   // Handle both 'name' and 'brand_name' field names (different forms use different names)
//   const data = brandData as Record<string, unknown>;
//   const brandName = (data?.brand_name as string) || (data?.name as string);

//   // Ensure name is provided (required field per API spec)
//   if (
//     !brandName ||
//     (typeof brandName === "string" && brandName.trim() === "")
//   ) {
//     throw new Error("Brand name is required");
//   }

//   const requestData: Record<string, unknown> = {
//     name: typeof brandName === "string" ? brandName.trim() : brandName, // API expects 'name' field (required)
//   };

//   // Optional string fields (only include if they have values)
//   if (brandData?.aboutTheBrand?.trim()) {
//     requestData.aboutTheBrand = brandData.aboutTheBrand.trim();
//   }
//   if (brandData?.websiteUrl?.trim()) {
//     requestData.websiteUrl = brandData.websiteUrl.trim();
//   }
//   if (brandData?.instagramUrl?.trim()) {
//     requestData.instagramUrl = brandData.instagramUrl.trim();
//   }
//   if (brandData?.facebookUrl?.trim()) {
//     requestData.facebookUrl = brandData.facebookUrl.trim();
//   }
//   if (brandData?.youtubeUrl?.trim()) {
//     requestData.youtubeUrl = brandData.youtubeUrl.trim();
//   }

//   // Optional number fields - convert to numbers (API expects numbers, not strings)
//   if (brandData?.totalSKU?.trim()) {
//     const totalSKU = parseFloat(brandData.totalSKU);
//     if (!isNaN(totalSKU) && totalSKU > 0) {
//       requestData.totalSKU = totalSKU;
//     }
//   }
//   if (brandData?.marketingBudget?.trim()) {
//     const marketingBudget = parseFloat(brandData.marketingBudget);
//     if (!isNaN(marketingBudget) && marketingBudget > 0) {
//       requestData.marketingBudget = marketingBudget;
//     }
//   }

//   // Map brandType to productCategory (API expects productCategory array)
//   if (Array.isArray(brandData?.brandType) && brandData.brandType.length > 0) {
//     requestData.productCategory = brandData.brandType;
//   }

//   // Selling platforms array (API expects array of {platform, url} objects)
//   if (Array.isArray(brandData?.sellingOn) && brandData.sellingOn.length > 0) {
//     requestData.sellingOn = brandData.sellingOn
//       .filter((item) => item?.platform && item?.url)
//       .map((item) => ({
//         platform: item.platform,
//         url: item.url,
//       }));
//   }

//   // Handle file uploads - extract first file from arrays
//   if (brandData?.authorizationLetter_files) {
//     const authFiles = Array.isArray(brandData.authorizationLetter_files)
//       ? brandData.authorizationLetter_files
//       : [brandData.authorizationLetter_files];
//     if (authFiles.length > 0 && authFiles[0] instanceof File) {
//       requestData.authorizationLetter = authFiles[0];
//     }
//   }

//   if (brandData?.logo_files) {
//     const logoFiles = Array.isArray(brandData.logo_files)
//       ? brandData.logo_files
//       : [brandData.logo_files];
//     if (logoFiles.length > 0 && logoFiles[0] instanceof File) {
//       requestData.logoImage = logoFiles[0];
//     }
//   }

//   return requestData;
// };

/**
 * Creates form data for brand API requests
 * @param brandData - The brand form data
 * @returns FormData object ready for API submission
 */
export const createBrandFormData = (brandData: BrandFormData) => {
  // const apiData = transformBrandDataForApi(brandData);
  // sellingOn is an array of objects that needs special handling
  // productCategory is a simple array of strings, handled automatically
  return createFormData(brandData, ["sellingOn"]);
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
