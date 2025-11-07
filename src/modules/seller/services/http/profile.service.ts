import { api } from "@/core/services/http";

export interface SellerProfileResponse {
  statusCode: number;
  data: {
    personalInformation: {
      fullName: string;
      role: string;
      email: string;
      phoneNo: string;
      gender: string;
      dateOfBirth: string;
      weight: string;
      height: string;
      joinedDate: string;
      lastLogin: string | null;
      skinType: string;
      concerns: string;
    };
    addressInformation: {
      country: string;
      state: string;
      city: string;
      postalCode: string;
      line1: string;
      line2: string;
    };
  };
  message: string;
}

export async function apiGetSellerProfile(
  signal?: AbortSignal,
): Promise<SellerProfileResponse> {
  return api.get<SellerProfileResponse>("/api/v1/sellers/profile", { signal });
}

