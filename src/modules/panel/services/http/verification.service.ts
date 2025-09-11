import { api } from "@/core/services/http";
import type { ApiResponse } from "@/core/types";
import type {
  PanVerificationRequest,
  PanVerificationResponse,
  GstVerificationRequest,
  GstVerificationResponse,
  CinVerificationRequest,
  CinVerificationResponse,
} from "@/modules/panel/types/verification.type";
import { ENDPOINTS } from "../../config/endpoint.config";

// Verify PAN details
export async function apiVerifyPan<T = ApiResponse<PanVerificationResponse>>(
  data: PanVerificationRequest,
) {
  return api.post<T>(ENDPOINTS.VERIFICATION.VERIFY_PAN, data);
}

// Verify GST details
export async function apiVerifyGst<T = ApiResponse<GstVerificationResponse>>(
  data: GstVerificationRequest,
) {
  return api.post<T>(ENDPOINTS.VERIFICATION.VERIFY_GST, data);
}

// Verify CIN details
export async function apiVerifyCin<T = ApiResponse<CinVerificationResponse>>(
  data: CinVerificationRequest,
) {
  return api.post<T>(ENDPOINTS.VERIFICATION.VERIFY_CIN, data);
}
