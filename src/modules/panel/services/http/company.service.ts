import { api } from "@/core/services/http";
import { ENDPOINTS } from "../../config/endpoint.config";
import type { ApiResponse, PaginationParams } from "@/core/types";
import type {
  CompanyOnboading,
  CompanyOnboardingSubmitRequest,
  CompanyListItem,
  CompanyDetailDataResponse,
} from "@/modules/panel/types/company.type";
import { createFormData } from "@/core/utils/formdata.utils";
import type { CompanyUser } from "../../types/user.type";

// Get all onboard entries (with params for search, paging, sorting)
export async function apiGetOnboardList<T, U extends Record<string, unknown>>(
  params: U,
) {
  return api.get<T>(ENDPOINTS.ONBOARDING.ADMIN, { params });
}

// Get onboard entry by ID
export async function apiGetOnboardById<T>(id: string) {
  return api.get<T>(ENDPOINTS.ONBOARDING.ADMIN_BY_ID(id));
}

// Update onboard entry by ID (PUT)
export async function apiUpdateOnboardById<
  T,
  U extends Record<string, unknown>,
>(companyId: string, locationId: string, data: U) {
  const formData = createFormData(data, ["addresses", "sellingOn"]);
  return api.put<T>(
    ENDPOINTS.ONBOARDING.COMPANY_LOCATION_DETAILS(companyId, locationId),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
}

// ---- Onboarding ----
export async function apiOnboardingSubmit<T = ApiResponse<string>>(
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
  return api.get<T>(ENDPOINTS.BRAND.MAIN_ALL, { params });
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
  return api.get<T>(ENDPOINTS.BRAND.MAIN_BY_ID(id));
}

// Update brand by ID (PUT)
// export async function apiUpdateBrandById<T>(id: string, data: BrandReqData) {
//   return api.put<T>(`${ENDPOINTS.BRAND.MAIN}/${id}`, data);
// }

// Delete brand by ID (PATCH)
export async function apiDeleteBrandById<T>(id: string) {
  return api.patch<T>(ENDPOINTS.BRAND.MAIN_BY_ID(id));
}

// Toggle active/inactive status (PATCH)
export async function apiToggleBrandStatus<T>(id: string) {
  return api.patch<T>(ENDPOINTS.BRAND.TOGGLE_STATUS(id));
}

// Get company details for dropdown
export async function apiGetCompanyDetails<T>() {
  return api.get<T>(ENDPOINTS.SELLER.GET_COMPANY_DETAILS_LIST);
}

// Get company details for dropdown
export interface CompanyDropdownItem {
  _id: string;
  companyName: string;
  companyStatus: string;
}

export async function apiGetCompanyDropdownList<
  T = ApiResponse<CompanyDropdownItem[]>,
>() {
  return api.get<T>(ENDPOINTS.SELLER.GET_COMPANY_LIST);
}

// Get company details by ID
export async function apiGetOnboardCompanyDetailById<
  T = { company: CompanyOnboading },
>(companyId: string) {
  return api.get<T>(ENDPOINTS.ONBOARDING.COMPANY_DETAILS(companyId));
}

export async function apiGetCompanyDetailById<
  T = ApiResponse<CompanyOnboading>,
>(companyId: string) {
  return api.get<T>(ENDPOINTS.SELLER.GET_COMPANY_DETAILS(companyId));
}

// Get company detail data by ID (new endpoint)
export async function apiGetCompanyDetailData<
  T = ApiResponse<CompanyDetailDataResponse>,
>(companyId: string) {
  return api.get<T>(ENDPOINTS.SELLER.GET_COMPANY_DETAIL_DATA(companyId));
}

// Check company status by email
export interface ApiRequestCheckStatusParams {
  email: string;
}

export interface CompanyAddressStatus {
  addressId: string;
  status: string;
  statusChangeReason: string;
  statusChangedAt: string | null;
  addressType: string;
  location: string;
}

export interface CompanyStatusData {
  companyId: string;
  companyName: string;
  addresses: CompanyAddressStatus[];
}

export async function apiGetOnboardingCheckStatus(
  params: ApiRequestCheckStatusParams,
) {
  return api.get<CompanyStatusData>(ENDPOINTS.ONBOARDING.COMPANY_CHECK_STATUS, {
    params,
  });
}

// Get company list with pagination
export interface CompanyListParams extends PaginationParams {
  status?: string;
}

export async function apiGetCompanyList<
  T = ApiResponse<{
    items: CompanyListItem[];
    page: number;
    limit: number;
    total: number;
  }>,
>(params: CompanyListParams, signal?: AbortSignal) {
  return api.get<T>(ENDPOINTS.SELLER.MAIN, { params, signal });
}

// Update company status (approval/rejection)
export interface CompanyStatusUpdateRequest {
  status: string;
  reason?: string;
}

export interface CompanyStatusUpdateResponse {
  _id: string;
  companyName: string;
  status: string;
  statusChangeReason: string;
  statusChangedAt: string;
  updatedAt: string;
}

export async function apiUpdateCompanyStatus(
  locationId: string,
  data: CompanyStatusUpdateRequest,
) {
  return api.put<ApiResponse<CompanyStatusUpdateResponse>>(
    ENDPOINTS.SELLER.UPDATE_STATUS(locationId),
    data,
  );
}

// Get company details for onboarding format
export async function apiGetCompanyDetailsForOnboarding<
  T = ApiResponse<{
    company: {
      companyId: string;
      logo: string;
      establishedIn: string;
      companyName: string;
      companyCategory: string;
      businessType: string;
      subsidiaryOfGlobalBusiness: boolean;
      headquaterLocation: string;
      website: string;
      status: string;
      landlineNo: string;
      isCompanyBrand: boolean;
      isDeleted: boolean;
      createdAt: string;
      updatedAt: string;
      addresses: Array<{
        addressId: string;
        addressType: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        isPrimary: boolean;
        landmark: string;
        gstNumber: string;
        panNumber: string;
        cinNumber: string;
        msmeNumber: string;
        landlineNumber: string;
        coiCertificate: string;
        panCertificate: string;
        gstCertificate: string;
        msmeCertificate: string;
        status: string;
        statusChangeReason: string;
        statusChangedAt: string;
        lat: number;
        lng: number;
        createdAt: string;
        updatedAt: string;
        brands: Array<{
          _id: string;
          name: string;
          slug: string;
          totalSKU: number;
          instagramUrl: string;
          facebookUrl: string;
          youtubeUrl: string;
          productCategory: string[];
          averageSellingPrice: number;
          marketingBudget: number;
          sellingOn: Array<{
            platform: string;
            url: string;
          }>;
          aboutTheBrand: string;
          websiteUrl: string;
          isActive: boolean;
          logoImage: string;
          coverImage: string;
          authorizationLetter: string;
          createdBy: string;
          isDeleted: boolean;
          deletedAt: string;
          deletedBy: string;
          createdAt: string;
          updatedAt: string;
        }>;
      }>;
      owner: {
        ownerUserId: string;
        ownerUser: string;
        ownerEmail: string;
        ownerPhone: string;
        ownerPassword: string;
        ownerDesignation: string;
      };
    };
  }>,
>(companyId: string) {
  return api.get<T>(ENDPOINTS.ONBOARDING.COMPANY_DETAILS(companyId));
}

export interface CompanyUserResponse {
  userId: string;
  user: CompanyUser;
  roleValue: string;
  companyId: string;
  orgType: string;
  createdAt: string;
}


// Get company users
export async function apiGetCompanyUsers<
  T = ApiResponse<{
    items: Array<CompanyUserResponse>;
    page: number;
    limit: number;
    total: number;
  }>,
>(companyId: string, params?: PaginationParams, signal?: AbortSignal) {
  return api.get<T>(ENDPOINTS.COMPANY.USERS(companyId), { params, signal });
}
