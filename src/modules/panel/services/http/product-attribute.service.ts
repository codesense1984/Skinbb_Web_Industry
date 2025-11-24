import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

// API Request/Response Types
interface ProductAttributeListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: string;
  isVariantField?: boolean;
}

interface ProductAttributeCreateData {
  name: string;
  slug: string;
  dataType: "array" | "string" | "number" | "boolean";
  fieldType: "multi-select" | "single-select" | "text" | "number" | "boolean";
  isFilterable: boolean;
  isRequired: boolean;
  isVariantField: boolean;
  placeholder?: string;
  sortOrder?: number;
}

interface ProductAttributeUpdateData
  extends Partial<ProductAttributeCreateData> {
  _id: string;
}

interface ProductAttributeResponse {
  _id: string;
  name: string;
  slug: string;
  dataType: string;
  fieldType: string;
  isFilterable: boolean;
  isRequired: boolean;
  isVariantField: boolean;
  isMetadataField: boolean;
  isSearchable: boolean;
  placeholder: string;
  sortOrder: number;
  totalAttributeValue: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  defaultValue?: any;
  isDeleted: boolean;
  __v: number;
}

interface ProductAttributeListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    productAttributes: ProductAttributeResponse[];
    totalPages: number;
    totalRecords: number;
  };
}

// Get product attributes list
export async function apiGetProductAttributes(
  params?: ProductAttributeListParams,
  signal?: AbortSignal,
): Promise<ProductAttributeListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.order) searchParams.append("order", params.order);
  if (params?.isVariantField !== undefined)
    searchParams.append("isVariantField", params.isVariantField.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.PRODUCT.ATTRIBUTE_LIST}?${queryString}`
    : ENDPOINTS.PRODUCT.ATTRIBUTE_LIST;

  return api.get<ProductAttributeListResponse>(url, { signal });
}

// Get product attribute by ID
export async function apiGetProductAttributeById(
  id: string,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: ProductAttributeResponse;
}> {
  return api.get(`${ENDPOINTS.PRODUCT.ATTRIBUTE}/${id}`, { signal });
}

// Create product attribute
export async function apiCreateProductAttribute(
  data: ProductAttributeCreateData,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: ProductAttributeResponse;
}> {
  return api.post(ENDPOINTS.PRODUCT.ATTRIBUTE, data);
}

// Update product attribute
export async function apiUpdateProductAttribute(
  id: string,
  data: Partial<ProductAttributeCreateData>,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: ProductAttributeResponse;
}> {
  return api.put(`${ENDPOINTS.PRODUCT.ATTRIBUTE}/${id}`, data);
}

// Delete product attribute
export async function apiDeleteProductAttribute(
  id: string,
): Promise<{ statusCode: number; success: boolean; message: string }> {
  return api.delete(`${ENDPOINTS.PRODUCT.ATTRIBUTE}/${id}`);
}

// Export types for use in components
export type {
  ProductAttributeCreateData, ProductAttributeListParams, ProductAttributeListResponse, ProductAttributeResponse, ProductAttributeUpdateData
};
