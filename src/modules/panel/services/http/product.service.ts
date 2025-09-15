import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

// Product Category APIs
export async function apiGetProductCategories(params?: any) {
  const response = await api.get(ENDPOINTS.PRODUCT.CATEGORY, {
    params: params || {},
  });

  return response;
}

export async function apiCreateProductCategory(data: any) {
  console.log("API: Creating product category with data:", data);
  const response = await api.post(ENDPOINTS.PRODUCT.CATEGORY, data);
  console.log("API: Product category creation response:", response);
  return response;
}

export async function apiUpdateProductCategory(id: string, data: any) {
  return api.put(`${ENDPOINTS.PRODUCT.CATEGORY}/${id}`, data);
}

export async function apiDeleteProductCategory(id: string) {
  return api.delete(`${ENDPOINTS.PRODUCT.CATEGORY}/${id}`);
}

export async function apiToggleProductCategoryStatus(id: string) {
  return api.put(`${ENDPOINTS.PRODUCT.CATEGORY_TOGGLE_STATUS}/${id}`, { id });
}

// Product Tag APIs
export async function apiGetProductTags(params?: any) {
  return api.get(ENDPOINTS.PRODUCT.TAG, { params });
}

export async function apiCreateProductTag(data: any) {
  return api.post(ENDPOINTS.PRODUCT.TAG, data);
}

export async function apiUpdateProductTag(id: string, data: any) {
  return api.put(`${ENDPOINTS.PRODUCT.TAG}/${id}`, data);
}

export async function apiDeleteProductTag(id: string) {
  return api.delete(`${ENDPOINTS.PRODUCT.TAG}/${id}`);
}

export async function apiBulkCreateProductTags(data: any) {
  return api.post(ENDPOINTS.PRODUCT.TAG_BULK_CREATE, data);
}

// Additional Product APIs (placeholder functions)
export async function apiGetBrandsForDropdown() {
  return api.get(ENDPOINTS.BRAND.MAIN_ALL);
}

export async function apiGetCategoriesForDropdown() {
  return api.get(ENDPOINTS.PRODUCT.CATEGORY_HIERARCHY);
}

export async function apiGetTagsForDropdown() {
  return api.get(ENDPOINTS.PRODUCT.TAG_LIST);
}

export async function apiGetVariationTypes() {
  return api.get(ENDPOINTS.PRODUCT.VARIATION_TYPE);
}

export async function apiGetMarketedBy() {
  return api.get(ENDPOINTS.INFO.MARKETED_BY);
}

export async function apiGetManufacturedBy() {
  return api.get(ENDPOINTS.INFO.MANUFACTURED_BY);
}

export async function apiGetImportedBy() {
  return api.get(ENDPOINTS.INFO.IMPORTED_BY);
}

export async function apiGetIngredients() {
  return api.get(ENDPOINTS.INFO.INGREDIENT_LIST);
}

export async function apiGetBenefits() {
  return api.get(ENDPOINTS.INFO.BENEFITS_LIST);
}

export async function apiGetProductAttributeValues(attributeId?: string) {
  if (attributeId) {
    return api.get(ENDPOINTS.PRODUCT.ATTRIBUTE_VALUE_BY_ATTRIBUTE(attributeId));
  }
  return api.get(ENDPOINTS.PRODUCT.ATTRIBUTE_VALUE_LIST);
}

export async function apiGetProductById(id: string) {
  return api.get(`${ENDPOINTS.PRODUCT.MAIN}/${id}`);
}

export async function apiGetProducts(params?: any) {
  return api.get(ENDPOINTS.PRODUCT.MAIN, { params });
}
