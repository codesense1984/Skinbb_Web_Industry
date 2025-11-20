// Components
export { default as BrandForm, default as UnifiedBrandForm } from "./BrandForm";

// Hooks
export {
  useBrandCreateMutation, useBrandData, useBrandUpdateMutation
} from "./useBrandMutations";

// Types
export type {
  BrandApiResponse, // Legacy export
  BrandFormBaseProps, BrandFormProps, BrandSubmitHandler, UnifiedBrandFormProps
} from "./types";

// Utils
export {
  BRAND_ERROR_MESSAGES, BRAND_MESSAGES, BRAND_QUERY_KEYS, createBrandFormData, extractBrandIds, transformBrandFormDataToBrand
} from "./brand.utils";
