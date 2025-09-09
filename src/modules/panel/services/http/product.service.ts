import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

// Product Category APIs
export async function apiGetProductCategories(params?: any) {
    const response = await api.get("/api/v1/product-category/admin", { 
      params: params || {}
    });
    
    return response;
}

export async function apiCreateProductCategory(data: any) {
  console.log("API: Creating product category with data:", data);
  const response = await api.post("/api/v1/product-category/admin", data);
  console.log("API: Product category creation response:", response);
  return response;
}

export async function apiUpdateProductCategory(id: string, data: any) {
  return api.put(`/api/v1/product-category/admin/${id}`, data);
}

export async function apiDeleteProductCategory(id: string) {
  return api.delete(`/api/v1/product-category/admin/${id}`);
}

export async function apiToggleProductCategoryStatus(id: string) {
  return api.put(`/api/v1/product-category/admin/${id}/toggle-status`, { id });
}

// Product Tag APIs
export async function apiGetProductTags(params?: any) {
  return api.get("/api/v1/product-tag/admin", { params });
}

export async function apiCreateProductTag(data: any) {
  return api.post("/api/v1/product-tag/admin", data);
}

export async function apiUpdateProductTag(id: string, data: any) {
  return api.put(`/api/v1/product-tag/admin/${id}`, data);
}

export async function apiDeleteProductTag(id: string) {
  return api.delete(`/api/v1/product-tag/admin/${id}`);
}

export async function apiBulkCreateProductTags(data: any) {
  return api.post("/api/v1/product-tag/admin/bulk", data);
}

// Additional Product APIs (placeholder functions)
export async function apiGetBrandsForDropdown() {
  return api.get("/api/v1/brands/dropdown");
}

export async function apiGetCategoriesForDropdown() {
  return api.get("/api/v1/product-category/dropdown");
}

export async function apiGetTagsForDropdown() {
  return api.get("/api/v1/product-tag/dropdown");
}

export async function apiGetVariationTypes() {
  return api.get("/api/v1/variation-types");
}

export async function apiGetMarketedBy() {
  return api.get("/api/v1/marketed-by");
}

export async function apiGetManufacturedBy() {
  return api.get("/api/v1/manufactured-by");
}

export async function apiGetImportedBy() {
  return api.get("/api/v1/imported-by");
}

export async function apiGetIngredients() {
  return api.get("/api/v1/ingredients");
}

export async function apiGetBenefits() {
  return api.get("/api/v1/benefits");
}

export async function apiGetProductAttributeValues() {
  return api.get("/api/v1/product-attribute-values");
}

export async function apiGetProductById(id: string) {
  return api.get(`/api/v1/products/${id}`);
}

export async function apiGetProducts(params?: any) {
  return api.get("/api/v1/products", { params });
}