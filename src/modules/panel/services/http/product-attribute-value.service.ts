import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

// API Request/Response Types
interface ProductAttributeValueListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: string;
  attributeId: string;
}

interface ProductAttributeValueCreateData {
  label: string;
  value: string;
}

interface ProductAttributeValueUpdateData
  extends Partial<ProductAttributeValueCreateData> {
  _id: string;
}

interface ProductAttributeValueResponse {
  _id: string;
  attributeId: string;
  label: string;
  value: string;
  colorCode?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  __v: number;
}

interface ProductAttributeValueListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    productAttributeValues: ProductAttributeValueResponse[];
    totalPages: number;
    totalRecords: number;
  };
}

// Get product attribute values list
export async function apiGetProductAttributeValues(
  params: ProductAttributeValueListParams,
  signal?: AbortSignal,
): Promise<ProductAttributeValueListResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.order) searchParams.append("order", params.order);
  searchParams.append("attributeId", params.attributeId);

  const queryString = searchParams.toString();
  const url = `${ENDPOINTS.PRODUCT.ATTRIBUTE_VALUE_LIST}?${queryString}`;

  return api.get<ProductAttributeValueListResponse>(url, { signal });
}

// Get product attribute value by ID
export async function apiGetProductAttributeValueById(
  id: string,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: ProductAttributeValueResponse;
}> {
  return api.get(`${ENDPOINTS.PRODUCT.ATTRIBUTE_VALUE}/${id}`, { signal });
}

// Create product attribute value
export async function apiCreateProductAttributeValue(
  attributeId: string,
  data: ProductAttributeValueCreateData,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: ProductAttributeValueResponse;
}> {
  return api.post(`${ENDPOINTS.PRODUCT.ATTRIBUTE_VALUE}/${attributeId}`, data);
}

// Update product attribute value
export async function apiUpdateProductAttributeValue(
  id: string,
  data: Partial<ProductAttributeValueCreateData>,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: ProductAttributeValueResponse;
}> {
  return api.put(`${ENDPOINTS.PRODUCT.ATTRIBUTE_VALUE}/${id}`, data);
}

// Delete product attribute value
export async function apiDeleteProductAttributeValue(
  id: string,
): Promise<{ statusCode: number; success: boolean; message: string }> {
  return api.delete(`${ENDPOINTS.PRODUCT.ATTRIBUTE_VALUE}/${id}`);
}

// Export types for use in components
export type {
  ProductAttributeValueListParams,
  ProductAttributeValueCreateData,
  ProductAttributeValueUpdateData,
  ProductAttributeValueResponse,
  ProductAttributeValueListResponse,
};
