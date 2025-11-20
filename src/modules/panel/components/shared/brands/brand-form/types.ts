import { MODE } from "@/core/types";
import type { transformBrandFormDataToBrand } from "./brand.utils";

/**
 * Base props shared across brand form components
 */
export interface BrandFormBaseProps {
  mode: MODE;
  companyId?: string;
  locationId?: string;
  brandId?: string;
}

/**
 * Brand submit handler - generic type for form submissions
 */
export type BrandSubmitRequest<
  T = ReturnType<typeof transformBrandFormDataToBrand>,
> = {
  companyId: string;
  locationId: string;
  brandId?: string;
  data: T;
};
export type BrandSubmitHandler<
  T = ReturnType<typeof transformBrandFormDataToBrand>,
> = (params: BrandSubmitRequest<T>) => void;

/**
 * Props for brand form component
 * onSubmit accepts BrandSubmitHandler with transformed Brand data
 */
export interface BrandFormProps extends BrandFormBaseProps {
  title: string;
  description: string;
  onSubmit?: BrandSubmitHandler;
  submitting?: boolean;
}

/**
 * @deprecated Use BrandFormProps instead. Kept for backward compatibility.
 */
export type UnifiedBrandFormProps = BrandFormProps;

/**
 * Brand API response type
 */
export interface BrandApiResponse {
  _id?: string;
  name?: string;
  aboutTheBrand?: string;
  isActive?: boolean;
  logoImage?: string | { url?: string };
  authorizationLetter?: string | { url?: string };
  totalSKU?: number;
  marketingBudget?: number;
  brandType?: string[];
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  sellingOn?: Array<{ platform: string; url: string }>;
  companyId?: string;
  companyName?: string;
  locationId?: string;
  locationAddress?: string;
  status?: string;
}
