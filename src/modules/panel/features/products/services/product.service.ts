// import { apiClient } from '@/core/services/api-client';
import type { ProductReqData } from '../types/product.types';

// Mock API client for now - replace with actual implementation
const apiClient = {
  post: async (_url: string, _data: any) => ({ data: { message: 'Product created successfully' } }),
  put: async (_url: string, _data: any) => ({ data: { message: 'Product updated successfully' } }),
  get: async (_url: string, _config?: any) => ({ data: { productAttributes: [] } }),
};

const PRODUCT_ENDPOINTS = {
  CREATE: '/products',
  UPDATE: (id: string) => `/products/${id}`,
  GET_BY_ID: (id: string) => `/products/${id}`,
  GET_ATTRIBUTES: '/product-attributes',
  GET_ATTRIBUTE_VALUES: '/product-attribute-values',
  GET_META_FIELDS: '/product-meta-fields',
} as const;

export const apiCreateProduct = async (data: ProductReqData) => {
  const response = await apiClient.post(PRODUCT_ENDPOINTS.CREATE, data);
  return response.data;
};

export const apiUpdateProduct = async (id: string, data: ProductReqData) => {
  const response = await apiClient.put(PRODUCT_ENDPOINTS.UPDATE(id), data);
  return response.data;
};

export const apiGetProductById = async (id: string) => {
  const response = await apiClient.get(PRODUCT_ENDPOINTS.GET_BY_ID(id));
  return response.data;
};

export const apiGetProductAttributes = async (params?: {
  isMetadataField?: number;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get(
    PRODUCT_ENDPOINTS.GET_ATTRIBUTES,
    { params }
  );
  return response.data;
};

export const apiGetProductAttributeValues = async (params: {
  attributeId: string;
}) => {
  const response = await apiClient.get(
    PRODUCT_ENDPOINTS.GET_ATTRIBUTE_VALUES,
    { params }
  );
  return response.data;
};

export const apiGetProductMetaFieldAttributes = async (
  params?: {
    isMetadataField?: number;
    page?: number;
    limit?: number;
  }
) => {
  const response = await apiClient.get(
    PRODUCT_ENDPOINTS.GET_META_FIELDS,
    { params }
  );
  return response.data;
};
