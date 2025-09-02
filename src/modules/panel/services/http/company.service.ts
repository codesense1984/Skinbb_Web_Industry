import { api } from "@/core/services/http";
import { ENDPOINTS } from "../../config/endpoint.config";
import type {
  ApiResponse,
  PaginationApiResponse,
  PaginationParams,
} from "@/core/types";
import type {
  CompanyOnboading,
  CompanyOnboardingSubmitRequest,
  CompanyListItem,
} from "@/modules/panel/types/company.type";
import { createFormData } from "@/core/utils/formdata.utils";

// Get all onboard entries (with params for search, paging, sorting)
export async function apiGetOnboardList<T, U extends Record<string, unknown>>(
  params: U,
) {
  return api.get<T>(ENDPOINTS.ONBOARDING.ADMIN, { params });
}

// Get onboard entry by ID
export async function apiGetOnboardById<T>(id: string) {
  return api.get<T>(`${ENDPOINTS.ONBOARDING.ADMIN}/${id}`);
}

// Update onboard entry by ID (PUT)
export async function apiUpdateOnboardById<
  T,
  U extends Record<string, unknown>,
>(id: string, data: U) {
  return api.put<T>(`${ENDPOINTS.ONBOARDING.ADMIN}/${id}`, {
    data,
  });
}

// ---- Onboarding ----
export async function apiOnboardingSubmit<T>(
  data: CompanyOnboardingSubmitRequest,
) {
  // Use generic FormData utility with specific array keys for onboarding
  const formData = createFormData(data, ["addresses", "sellingOn"]);

  return api.post<T>(ENDPOINTS.ONBOARDING.MAIN, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiSendMailOTP<T, U extends Record<string, unknown>>(
  data: U,
) {
  return api.post<T>(ENDPOINTS.ONBOARDING.SEND_MAIL, data);
}

export async function apiVerifyMailOTP<T, U extends Record<string, unknown>>(
  data: U,
) {
  return api.post<T>(ENDPOINTS.ONBOARDING.VERIFY_MAIL, data);
}

export async function apiSendMobileOTP(data: { phoneNumber: string }) {
  return api.post<ApiResponse<string>>(ENDPOINTS.ONBOARDING.SEND_MOBILE, data);
}

export interface VerifyMobileOTPData {
  phoneNumber: string;
  otp: string;
}

export async function apiVerifyMobileOTP(data: VerifyMobileOTPData) {
  return api.post<ApiResponse<string>>(
    ENDPOINTS.ONBOARDING.VERIFY_MOBILE,
    data,
  );
}

export async function apiGetOnboardingStatus<
  T,
  U extends Record<string, unknown>,
>(params: U) {
  return api.get<T>(ENDPOINTS.ONBOARDING.STATUS, { params });
}

// ---- Pages ----
export async function apiGetPageDetails<T, U extends Record<string, unknown>>(
  params: U,
) {
  return api.get<T>(ENDPOINTS.PAGE.DETAILS, { params });
}

// Get all brands (with params for search, paging, sorting)
export async function apiGetBrandList<T, U extends Record<string, unknown>>(
  params: U,
) {
  return api.get<T>(`${ENDPOINTS.BRAND.MAIN}/all`, { params });
}

// export async function apiCreateBrand(data: BrandReqData) {
//   return api.post<BrandResData>(endpointConfig.brand, data);
//     url: endpointConfig.brand,
//     method: "post",
//     data,
//   });
// }

// Get brand by ID
export async function apiGetBrandById<T>(id: string) {
  return api.get<T>(`${ENDPOINTS.BRAND.MAIN}/${id}`);
}

// Update brand by ID (PUT)
// export async function apiUpdateBrandById<T>(id: string, data: BrandReqData) {
//   return api.put<T>(`${ENDPOINTS.BRAND.MAIN}/${id}`, data);
// }

// Delete brand by ID (PATCH)
export async function apiDeleteBrandById<T>(id: string) {
  return api.patch<T>(`${ENDPOINTS.BRAND.MAIN}/${id}`);
}

// Toggle active/inactive status (PATCH)
export async function apiToggleBrandStatus<T>(id: string) {
  return api.patch<T>(`${ENDPOINTS.BRAND.TOGGLE_STATUS}/${id}`);
}

// Get company details for dropdown
// export async function apiGetCompanyDetails<T>() {
//   return api.get<T>(ENDPOINTS.SELLER.GET_COMPANY_DETAILS);
// }

// Get company details for dropdown
export interface CompanyDropdownItem {
  _id: string;
  companyName: string;
}

export async function apiGetCompanyDropdownList<
  T = ApiResponse<CompanyDropdownItem[]>,
>() {
  return api.get<T>(ENDPOINTS.SELLER.GET_COMPANY_LIST);
}

// Get company details by ID
export async function apiGetCompanyDetailById<
  T = ApiResponse<CompanyOnboading>,
>(companyId: string) {
  return api.get<T>(`${ENDPOINTS.SELLER.GET_COMPANY_DETAILS}/${companyId}`);
}

// Check company status by email or phone
export interface ApiRequestCheckStatusParams {
  email?: string;
  phoneNumber?: string;
}

export interface CompanyStatusData {
  _id: string;
  companyName: string;
  status: string;
  statusChangeReason?: string;
  statusChangedAt: string;
  createdAt: string;
  updatedAt: string;
}

export async function apiCheckCompanyStatus(
  params: ApiRequestCheckStatusParams,
) {
  return api.get<ApiResponse<CompanyStatusData>>(
    ENDPOINTS.SELLER.CHECK_STATUS,
    { params },
  );
}

// Get company list with pagination
export async function apiGetCompanyList(
  params: PaginationParams,
  signal?: AbortSignal,
): Promise<PaginationApiResponse<{ data: CompanyListItem[] }>> {
  return api.get<PaginationApiResponse<{ data: CompanyListItem[] }>>(
    ENDPOINTS.SELLER.MAIN,
    { params, signal },
  );
}
