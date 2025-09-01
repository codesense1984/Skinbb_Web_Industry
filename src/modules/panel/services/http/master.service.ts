// Get company details for dropdown
import { api } from "@/core/services/http";
import { ENDPOINTS } from "../../config/endpoint.config";
import type { ApiResponse } from "@/core/types";

export type ApiGetAllProductCategoriesResponse = ApiResponse<
  Array<{
    _id: string;
    name: string;
    slug: string;
    level: number;
    parentId: string | null;
    parentName: string | null;
  }>
>;

export async function apiGetAllProductCategories() {
  return api.get<ApiGetAllProductCategoriesResponse>(
    ENDPOINTS.PRODUCT.CATEGORY_HIERARCHY,
  );
}
