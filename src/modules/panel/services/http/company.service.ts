import { api } from "@/core/services/http";
import { ENDPOINTS } from "../../config/endpoint.config";
import type { ApiResponse } from "@/core/types";

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
export async function apiOnboardingSubmit<T, U extends Record<string, unknown>>(
  data: U,
) {
  return api.post<T>(ENDPOINTS.ONBOARDING.MAIN, data);
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
