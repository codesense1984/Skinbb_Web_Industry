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
  brandId?: string;
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
  slug: string;
  description?: string;
  seoKeywords?: string[];
}

interface ProductTagUpdateData extends Partial<ProductTagCreateData> {
  _id: string;
}

interface BulkTagCreateData {
  tags: Omit<ProductTagCreateData, "_id">[];
}

// Product Category APIs
export async function apiGetProductCategories(params?: ApiParams, signal?: AbortSignal) {
    const response = await api.get(ENDPOINTS.PRODUCT.CATEGORY, { 
      params: params || {},
      signal
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
  console.log("apiGetProductTags called with endpoint:", ENDPOINTS.PRODUCT.TAG_LIST, "params:", params);
  return api.get(ENDPOINTS.PRODUCT.TAG_LIST, { params });
}

export async function apiCreateProductTag(data: ProductTagCreateData) {
  return api.post(ENDPOINTS.PRODUCT.TAG, data);
}

export async function apiUpdateProductTag(id: string, data: ProductTagUpdateData) {
  return api.put(`${ENDPOINTS.PRODUCT.TAG}/${id}`, data);
}

export async function apiDeleteProductTag(id: string) {
  return api.patch(`${ENDPOINTS.PRODUCT.TAG}/${id}`);
}

export async function apiBulkCreateProductTags(data: BulkTagCreateData) {
  return api.post(ENDPOINTS.PRODUCT.TAG_BULK_CREATE, data);
}

// Additional Product APIs (placeholder functions)

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
  if (params?.brandId) searchParams.append("brandId", params.brandId);
  if (params?.productType) searchParams.append("productType", params.productType);
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.order) searchParams.append("order", params.order);
  if (params?.companyId) searchParams.append("companyId", params.companyId);
  if (params?.locationId) searchParams.append("locationId", params.locationId);
  
  const url = `${ENDPOINTS.PRODUCT.MAIN}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
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

// Bulk import products with S3 upload
export interface BulkImportRequest {
  file: File;
  brandId: string;
  category: string;
  sellerId: string;
}

export interface BulkImportResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    fileUrl: string;
    fileKey: string;
    importJobId: string;
    totalRows: number;
    status: string;
  };
}

export async function apiBulkImportProducts(data: BulkImportRequest): Promise<BulkImportResponse> {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("brandId", data.brandId);
  formData.append("category", data.category);
  formData.append("sellerId", data.sellerId);

  return api.post<BulkImportResponse>(ENDPOINTS.PRODUCT.BULK_IMPORT, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// Catalog List API Types
export interface CatalogListParams {
  page?: number;
  limit?: number;
  companyId?: string;
  brandId?: string;
  categoryId?: string;
  importId?: string;
  search?: string;
  status?: "pending" | "processing" | "completed" | "failed" | "approved";
  validationStatus?: "pending" | "valid" | "invalid";
  sortBy?: "createdAt" | "startedAt" | "completedAt" | "fileName" | "status";
  order?: "asc" | "desc";
}

export interface CatalogJob {
  _id: string;
  fileName: string;
  userId: string;
  brandId: string;
  categoryId: string;
  sellerId: string;
  status: string;
  validationStatus: string;
  totalRows: number;
  importedCount: number;
  failedCount: number;
  errorMessage?: string | null;
  fileUrl: string;
  fileKey: string;
  startedAt: string;
  completedAt: string;
  failedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    importJobs: CatalogJob[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalJobs: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface CatalogDetailResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CatalogJob;
}

export interface CatalogApprovalResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

export interface CatalogDownloadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    downloadUrl: string;
    expiresAt: string;
  };
}

// Get catalog list
export async function apiGetCatalogList(params?: CatalogListParams): Promise<CatalogListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.companyId) searchParams.append("companyId", params.companyId);
  if (params?.brandId) searchParams.append("brandId", params.brandId);
  if (params?.categoryId) searchParams.append("categoryId", params.categoryId);
  if (params?.importId) searchParams.append("importId", params.importId);
  if (params?.search) searchParams.append("search", params.search);
  if (params?.status) searchParams.append("status", params.status);
  if (params?.validationStatus) searchParams.append("validationStatus", params.validationStatus);
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.order) searchParams.append("order", params.order);

  const queryString = searchParams.toString();
  const url = queryString ? `${ENDPOINTS.PRODUCT.BULK_IMPORTS}?${queryString}` : ENDPOINTS.PRODUCT.BULK_IMPORTS;

  return api.get<CatalogListResponse>(url);
}

// Get catalog detail
export async function apiGetCatalogDetail(importJobId: string): Promise<CatalogDetailResponse> {
  return api.get<CatalogDetailResponse>(ENDPOINTS.PRODUCT.BULK_IMPORT_DETAIL(importJobId));
}

// Approve catalog
export async function apiApproveCatalog(importJobId: string, data: { status: string; reason?: string }): Promise<CatalogApprovalResponse> {
  return api.post<CatalogApprovalResponse>(ENDPOINTS.PRODUCT.BULK_IMPORT_APPROVE(importJobId), data);
}

// Download catalog
export async function apiDownloadCatalog(importJobId: string): Promise<CatalogDownloadResponse> {
  return api.get<CatalogDownloadResponse>(ENDPOINTS.PRODUCT.BULK_IMPORT_DOWNLOAD(importJobId));
}

// Reject catalog
export async function apiRejectCatalog(importJobId: string, data: { status: string; reason?: string }): Promise<CatalogApprovalResponse> {
  return api.post<CatalogApprovalResponse>(ENDPOINTS.PRODUCT.BULK_IMPORT_APPROVE(importJobId), data);
}