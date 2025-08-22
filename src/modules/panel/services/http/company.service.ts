import { api } from "@/core/services/http";
import { ENDPOINTS } from "../../config/endpoint.config";

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

export async function apiSendMobileOTP<T, U extends Record<string, unknown>>(
  data: U,
) {
  return api.post<T>(ENDPOINTS.ONBOARDING.SEND_MOBILE, data);
}

export async function apiVerifyMobileOTP<T, U extends Record<string, unknown>>(
  data: U,
) {
  return api.post<T>(ENDPOINTS.ONBOARDING.VERIFY_MOBILE, data);
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
