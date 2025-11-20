import type { ApiResponse } from "@/core/types/base.type";
import { useMemo } from "react";
import type { BrandFormData } from "../brand.schema";
import type { BrandApiResponse } from "../types";

interface UseBrandFormTransformProps {
  brandData?: ApiResponse<BrandApiResponse>;
  companyId?: string;
  locationId?: string;
}

export const useBrandFormTransform = ({
  brandData,
  companyId: propCompanyId,
  locationId: propLocationId,
}: UseBrandFormTransformProps) => {
  const transformedData = useMemo(() => {
    if (!brandData) {
      return null;
    }

    const brand = brandData.data;
    const formData: BrandFormData = {
      status: brand.status || "",
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
      company_id: propCompanyId || brand.companyId || "",
      location_id: propLocationId || brand.locationId || "",
      companyName: brand.companyName || "",
      locationAddress: brand.locationAddress || "",
      _id: brand._id || "",
    };

    return formData;
  }, [brandData, propCompanyId, propLocationId]);

  return { transformedData };
};
