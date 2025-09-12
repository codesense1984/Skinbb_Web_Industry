import { api } from "@/core/services/http";
import type {
  SellerMemberListResponse,
  SellerMemberListParams,
  CreateSellerMemberRequest,
  UpdateSellerMemberRequest,
  SellerMemberCreateResponse,
  SellerMemberUpdateResponse,
  SellerMemberDeleteResponse,
} from "@/modules/panel/types/user.type";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

export async function apiGetSellerMembers(
  params?: SellerMemberListParams,
  signal?: AbortSignal,
): Promise<SellerMemberListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.brandId) searchParams.append("brandId", params.brandId);
  if (params?.status) searchParams.append("status", params.status);
  if (params?.query) searchParams.append("query", params.query);
  if (params?.sort?.order)
    searchParams.append("sort[order]", params.sort.order);
  if (params?.sort?.key) searchParams.append("sort[key]", params.sort.key);

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.USER.SELLER_MEMBERS}?${queryString}`
    : ENDPOINTS.USER.SELLER_MEMBERS;

  return api.get<SellerMemberListResponse>(url, { signal });
}

export async function apiCreateSellerMember(
  sellerId: string,
  data: CreateSellerMemberRequest,
  signal?: AbortSignal,
): Promise<SellerMemberCreateResponse> {
  const url = `${ENDPOINTS.USER.SELLER_MEMBERS_CREATE.replace("{sellerId}", sellerId)}`;
  return api.post<SellerMemberCreateResponse>(url, data, { signal });
}

export async function apiUpdateSellerMember(
  memberId: string,
  data: UpdateSellerMemberRequest,
  signal?: AbortSignal,
): Promise<SellerMemberUpdateResponse> {
  const url = `${ENDPOINTS.USER.SELLER_MEMBERS_UPDATE.replace("{memberId}", memberId)}`;
  return api.put<SellerMemberUpdateResponse>(url, data, { signal });
}

export async function apiGetSellerMemberById(
  memberId: string,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: any;
  message: string;
  success: boolean;
}> {
  // Since individual member API might not work, fetch from the list and find the member
  try {
    const response = await apiGetSellerMembers(
      { page: 1, limit: 1000 },
      signal,
    );
    const member = response.data.items.find((m: any) => m._id === memberId);

    if (!member) {
      throw new Error("Member not found");
    }

    return {
      statusCode: 200,
      data: member,
      message: "Member found",
      success: true,
    };
  } catch (error) {
    console.error("Error fetching member:", error);
    throw error;
  }
}

export async function apiDeleteSellerMember(
  memberId: string,
  signal?: AbortSignal,
): Promise<SellerMemberDeleteResponse> {
  const url = `${ENDPOINTS.USER.SELLER_MEMBERS_DELETE.replace("{memberId}", memberId)}`;
  return api.delete<SellerMemberDeleteResponse>(url, { signal });
}
