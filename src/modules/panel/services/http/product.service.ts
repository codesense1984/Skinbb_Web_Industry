import { api } from "@/core/services/http";
import { ENDPOINTS, API_PREFIX } from "@/modules/panel/config/endpoint.config";

// API Request/Response Types
interface ApiParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  tag?: string;
  brand?: string;
  productType?: string;
  sortBy?: string;
  order?: string;
  companyId?: string;
  locationId?: string;
  [key: string]: unknown;
}

interface ProductCategoryCreateData {
  name: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

interface ProductCategoryUpdateData extends Partial<ProductCategoryCreateData> {
  _id: string;
}

interface ProductTagCreateData {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

interface ProductTagUpdateData extends Partial<ProductTagCreateData> {
  _id: string;
}

interface BulkTagCreateData {
  tags: Omit<ProductTagCreateData, "_id">[];
}

// Product Category APIs
export async function apiGetProductCategories(params?: ApiParams) {
    const response = await api.get(ENDPOINTS.PRODUCT.CATEGORY, { 
      params: params || {}
    });
    
    return response;
}

export async function apiCreateProductCategory(data: ProductCategoryCreateData) {
  console.log("API: Creating product category with data:", data);
  const response = await api.post(ENDPOINTS.PRODUCT.CATEGORY, data);
  console.log("API: Product category creation response:", response);
  return response;
}

export async function apiUpdateProductCategory(id: string, data: ProductCategoryUpdateData) {
  return api.put(`${ENDPOINTS.PRODUCT.CATEGORY}/${id}`, data);
}

export async function apiDeleteProductCategory(id: string) {
  return api.delete(`${ENDPOINTS.PRODUCT.CATEGORY}/${id}`);
}

export async function apiToggleProductCategoryStatus(id: string) {
  return api.put(`${ENDPOINTS.PRODUCT.CATEGORY_TOGGLE_STATUS}/${id}`, { id });
}

// Product Tag APIs
export async function apiGetProductTags(params?: ApiParams) {
  return api.get(ENDPOINTS.PRODUCT.TAG, { params });
}

export async function apiCreateProductTag(data: ProductTagCreateData) {
  return api.post(ENDPOINTS.PRODUCT.TAG, data);
}

export async function apiUpdateProductTag(id: string, data: ProductTagUpdateData) {
  return api.put(`${ENDPOINTS.PRODUCT.TAG}/${id}`, data);
}

export async function apiDeleteProductTag(id: string) {
  return api.delete(`${ENDPOINTS.PRODUCT.TAG}/${id}`);
}

export async function apiBulkCreateProductTags(data: BulkTagCreateData) {
  return api.post(ENDPOINTS.PRODUCT.TAG_BULK_CREATE, data);
}

// Additional Product APIs (placeholder functions)
export async function apiGetBrandsForDropdown() {
  return api.get(ENDPOINTS.BRAND.MAIN_ALL, {
    params: {
      limit: 1000,
      page: 1,
    },
  });
}

export async function apiGetCategoriesForDropdown() {
  return api.get(ENDPOINTS.PRODUCT.CATEGORY_HIERARCHY, {
    params: {
      limit: 1000,
      page: 1,
    },
  });
}

export async function apiGetTagsForDropdown() {
  return api.get(ENDPOINTS.PRODUCT.TAG_LIST, {
    params: {
      limit: 1000,
      page: 1,
    },
  });
}

export async function apiGetVariationTypes() {
  return api.get(ENDPOINTS.PRODUCT.VARIATION_TYPE, {
    params: {
      limit: 1000,
      page: 1,
    },
  });
}

export async function apiGetMarketedBy() {
  return api.get(ENDPOINTS.INFO.MARKETED_BY, {
    params: {
      limit: 1000,
      page: 1,
    },
  });
}

export async function apiGetManufacturedBy() {
  return api.get(ENDPOINTS.INFO.MANUFACTURED_BY, {
    params: {
      limit: 1000,
      page: 1,
    },
  });
}

export async function apiGetImportedBy() {
  return api.get(ENDPOINTS.INFO.IMPORTED_BY, {
    params: {
      limit: 1000,
      page: 1,
    },
  });
}

export async function apiGetIngredients() {
    return api.get(ENDPOINTS.INFO.INGREDIENT_LIST, {
    params: {
      limit: 1000,
      page: 1,
    },
  });
}

export async function apiGetBenefits() {
  return api.get(ENDPOINTS.INFO.BENEFITS_LIST, {
    params: {
      limit: 1000,
      page: 1,
    },
  });
}

export async function apiGetProductAttributeValues(attributeId?: string) {
  if (attributeId) {
    return api.get(ENDPOINTS.PRODUCT.ATTRIBUTE_VALUE_BY_ATTRIBUTE(attributeId), {
      params: {
        limit: 1000,
        page: 1,
      },
    });
  }
  return api.get(ENDPOINTS.PRODUCT.ATTRIBUTE_VALUE_LIST, {
    params: {
      limit: 1000,
      page: 1,
    },
  });
}

export async function apiGetProductById(id: string) {
  return api.get(`${ENDPOINTS.PRODUCT.MAIN}/${id}`);
}

export async function apiGetProducts(params?: ApiParams) {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.status) searchParams.append("status", params.status);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.tag) searchParams.append("tag", params.tag);
  if (params?.brand) searchParams.append("brand", params.brand);
  if (params?.productType) searchParams.append("productType", params.productType);
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.order) searchParams.append("order", params.order);
  if (params?.companyId) searchParams.append("companyId", params.companyId);
  if (params?.locationId) searchParams.append("locationId", params.locationId);
  
  const url = `${ENDPOINTS.PRODUCT.MAIN}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  return api.get(url);
}

// Get products for dropdown selection
export async function apiGetProductsForDropdown(params?: ApiParams) {
  return api.get(ENDPOINTS.PRODUCT.MAIN, { 
    params: { 
      ...params, 
      limit: 10 // Limit to 100 products for dropdown
      // status: "active" // Only active products
    } 
  });
}

// Product Detail and Update APIs
export async function apiGetProductDetail(id: string) {
  return api.get(`${API_PREFIX}/products/detail/${id}`);
}

export async function apiUpdateProduct(id: string, data: Record<string, unknown>) {
  return api.put(`${API_PREFIX}/products/admin/${id}`, data);
}

// Product Status Update API
export async function apiUpdateProductStatus(id: string, data: { status: string; reason?: string; feedback?: string }) {
  return api.patch(`${API_PREFIX}/products/status/${id}`, data);
}