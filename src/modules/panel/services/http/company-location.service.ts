import { api } from "@/core/services/http";
import type { ApiResponse, PaginationParams } from "@/core/types";
import type {
  CompanyLocation,
  CompanyLocationListResponse,
} from "@/modules/panel/types/company-location.type";
import { ENDPOINTS } from "../../config/endpoint.config";
import type { CompanyOnboading } from "../../types";

// Get company locations with pagination
export interface CompanyLocationParams extends PaginationParams {
  userId?: string;
}

export async function apiGetCompanyLocationList<
  T = ApiResponse<CompanyLocationListResponse>,
>(companyId: string, params: CompanyLocationParams, signal?: AbortSignal) {
  return api.get<T>(ENDPOINTS.COMPANY.LOCATION(companyId), {
    params,
    signal,
  });
}

// Get company location detail by ID (new API endpoint)
export async function apiGetCompanyLocationDetail<
  T = { company: CompanyOnboading },
>(companyId: string, locationId: string, userId?: string) {
  return api.get<T>(
    ENDPOINTS.ONBOARDING.COMPANY_LOCATION_DETAILS(companyId, locationId),
    {
      params: {
        ...(userId && { userId }),
      },
    },
  );
}

// Get company location by ID (legacy endpoint)
export async function apiGetCompanyLocationById<
  T = ApiResponse<CompanyLocation>,
>(companyId: string, locationId: string) {
  return api.get<T>(ENDPOINTS.COMPANY.LOCATION_DETAILS(companyId, locationId));
}
