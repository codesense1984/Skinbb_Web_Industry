import { MODE } from "@/core/types";
import UnifiedBrandForm from "../brands/shared/UnifiedBrandForm";
import type { BrandFormData as UnifiedBrandFormData } from "../brands/brand-form/formSchema";
import type { BrandFormData as CompanyLocationBrandFormData } from "./brand.schema";
import { useBrandUpdateMutation } from "./useBrandMutations";

interface BrandPageWrapperProps {
  mode: MODE;
  title: string;
  description: string;
  companyId?: string;
  locationId?: string;
  onSubmit?: (data: CompanyLocationBrandFormData) => void;
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
  const brandMutation = useBrandUpdateMutation();

  const handleSubmit = (data: UnifiedBrandFormData) => {
    // Convert UnifiedBrandFormData to CompanyLocationBrandFormData
    const dataRecord = data as Record<string, unknown>;
    const convertedData: CompanyLocationBrandFormData = {
      name:
        (dataRecord.brand_name as string) || (dataRecord.name as string) || "",
      aboutTheBrand: (dataRecord.description as string) || "",
      websiteUrl:
        (dataRecord.website_url as string) ||
        (dataRecord.websiteUrl as string) ||
        "",
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
      authorizationLetter:
        (dataRecord.brand_authorization_letter as string) || "",
      logo_files: Array.isArray(dataRecord.brand_logo_files)
        ? (dataRecord.brand_logo_files as File[])
        : undefined,
      logo: (dataRecord.brand_logo as string) || "",
      authorizationLetter_files: Array.isArray(
        dataRecord.brand_authorization_letter_files,
      )
        ? (dataRecord.brand_authorization_letter_files as File[])
        : undefined,
    };

    if (onSubmit) {
      onSubmit(convertedData);
    } else {
      brandMutation.mutate(convertedData);
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
      submitting={submitting || brandMutation.isPending}
    />
  );
};
