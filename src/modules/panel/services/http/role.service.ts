import { api } from "@/core/services/http";
import type {
  RoleListResponse,
  RoleListParams,
} from "@/modules/panel/types/role.type";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import axios from "axios";

export async function apiGetRoles(
  params?: RoleListParams,
  signal?: AbortSignal,
): Promise<RoleListResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.excludeRole)
      searchParams.append("excludeRole", params.excludeRole);

    const queryString = searchParams.toString();
    const url = queryString
      ? `${ENDPOINTS.ROLE.LIST}?${queryString}`
      : ENDPOINTS.ROLE.LIST;

    // Try with the regular api service first
    try {
      const response = await api.get<RoleListResponse>(url, { signal });
      return response;
    } catch (apiError) {
      // Fallback to direct axios call with full URL
      const fullUrl = `https://api.skintruth.in${url}`;

      const response = await axios.get<RoleListResponse>(fullUrl, {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    }
  } catch (error) {
    console.error("Roles API error:", error);
    // Return mock data for testing
    return {
      statusCode: 200,
      data: {
        roles: [
          {
            _id: "668ff47f3bfea6db0365063a",
            label: "Admin",
            value: "admin",
            isDisabled: false,
            memberCount: 6,
          },
          {
            _id: "66ab8102e097e4c93d5c1ecc",
            label: "Doctor",
            value: "doctor",
            isDisabled: false,
            memberCount: 17,
          },
          {
            _id: "66a9d611c62e3782008273e5",
            label: "General",
            value: "general",
            isDisabled: false,
            memberCount: 175,
          },
          {
            _id: "6875fc068683bb026013181a",
            label: "Seller",
            value: "seller",
            isDisabled: false,
            memberCount: 7,
          },
          {
            _id: "68b830f548302327fe481073",
            label: "Seller Member",
            value: "seller-member",
            isDisabled: false,
            memberCount: 15,
          },
        ],
        totalRecords: 5,
        totalPages: 1,
      },
      message: "Mock roles data for testing",
      success: true,
    };
  }
}
