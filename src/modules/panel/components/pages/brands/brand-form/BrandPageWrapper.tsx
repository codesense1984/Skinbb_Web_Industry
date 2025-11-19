import { MODE } from "@/core/types";
import type { BrandFormData as UnifiedBrandFormData } from "../../../../features/brands/create/formSchema";
import type { BrandFormData } from "./brand.schema";
import UnifiedBrandForm from "./UnifiedBrandForm";

interface BrandPageWrapperProps {
  mode: MODE;
  title: string;
  description: string;
  companyId?: string;
  locationId?: string;
  onSubmit?: ({
    companyId,
    locationId,
    brandId,
    data,
  }: {
    companyId: string;
    locationId: string;
    brandId: string;
    data: BrandFormData;
  }) => void;
  submitting?: boolean;
  brandId?: string;
}

/**
 * Reusable wrapper component for brand pages (create/edit)
 * Handles data fetching for edit mode and provides consistent page structure
 */
export const BrandPageWrapper = ({
  mode,
  title,
  description,
  companyId,
  locationId,
  onSubmit,
  submitting = false,
  brandId,
}: BrandPageWrapperProps) => {
  const handleSubmit = (data: UnifiedBrandFormData) => {
    // Convert UnifiedBrandFormData to CompanyLocationBrandFormData
    const dataRecord = data as Record<string, unknown>;
    const convertedData = {
      name:
        (dataRecord.brand_name as string) || (dataRecord.name as string) || "",
      aboutTheBrand: (dataRecord.description as string) || "",
      websiteUrl: (dataRecord.website_url as string) || "",
      totalSKU: (dataRecord.total_skus as string) || "",
      marketingBudget: (dataRecord.marketing_budget as string) || "",
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

    if (onSubmit) {
      onSubmit({
        brandId: dataRecord._id as string,
        companyId: dataRecord.company_id as string,
        locationId: dataRecord.location_id as string,
        data: convertedData,
      });
    }
  };

  return (
    <UnifiedBrandForm
      mode={mode}
      title={title}
      description={description}
      companyId={companyId}
      locationId={locationId}
      brandId={brandId}
      onSubmit={handleSubmit}
      submitting={submitting}
    />
  );
};
