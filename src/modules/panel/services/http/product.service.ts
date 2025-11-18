import { api } from "@/core/services/http";
import { ENDPOINTS, API_PREFIX } from "@/modules/panel/config/endpoint.config";

// API Request/Response Types
export interface ApiParams {
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

export async function apiGetProductCategoryById(id: string) {
  return api.get(`${ENDPOINTS.PRODUCT.CATEGORY}/${id}`);
}

// Media Upload API
export interface MediaUploadResponse {
  statusCode: number;
  data: {
    media: Array<{
      _id: string;
      url: string;
    }>;
  };
  message: string;
  success: boolean;
}

export async function apiUploadMedia(file: File, type: string = "image"): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("files", file);

  return api.post<MediaUploadResponse>(ENDPOINTS.MEDIA.UPLOAD_MEDIA, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

export async function apiGetSkinTypes(params?: ApiParams, signal?: AbortSignal) {
  return api.get(ENDPOINTS.INFO.SKIN_TYPES, {
    params: {
      limit: 1000,
      page: 1,
      ...params,
    },
    signal,
  });
}

export async function apiGetHairTypes(params?: ApiParams, signal?: AbortSignal) {
  return api.get(ENDPOINTS.INFO.HAIR_TYPES, {
    params: {
      limit: 1000,
      page: 1,
      ...params,
    },
    signal,
  });
}

export async function apiGetSkinConcerns(params?: ApiParams, signal?: AbortSignal) {
  return api.get(ENDPOINTS.INFO.SKIN_CONCERNS, {
    params: {
      limit: 1000,
      page: 1,
      ...params,
    },
    signal,
  });
}

export async function apiGetHairConcerns(params?: ApiParams, signal?: AbortSignal) {
  return api.get(ENDPOINTS.INFO.HAIR_CONCERNS, {
    params: {
      limit: 1000,
      page: 1,
      ...params,
    },
    signal,
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

// Publish bulk products API
export async function apiPublishBulkProducts(productIds: string[]) {
  return api.post(ENDPOINTS.PRODUCT.PUBLISH_BULK, {
    productIds,
  });
}

export async function apiGetProducts(params?: ApiParams, signal?: AbortSignal) {
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
  return api.get(url, { signal });
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
  return api.get(`${API_PREFIX}/products/admin/${id}`);
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

export interface CatalogApprovalRequest {
  status: "approved" | "rejected";
  reason?: string;
}

export interface CatalogApprovalResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: Record<string, unknown>;
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

// Approve or reject bulk import
// POST /api/v1/products/admin/bulk-import/{importJobId}/approve
// Body: { status: "approved" | "rejected", reason?: string }
export async function apiApproveOrRejectCatalog(
  importJobId: string, 
  data: CatalogApprovalRequest
): Promise<CatalogApprovalResponse> {
  return api.post<CatalogApprovalResponse>(
    ENDPOINTS.PRODUCT.BULK_IMPORT_APPROVE(importJobId), 
    data
  );
}

// Approve catalog (convenience function)
export async function apiApproveCatalog(
  importJobId: string, 
  data?: { reason?: string }
): Promise<CatalogApprovalResponse> {
  return apiApproveOrRejectCatalog(importJobId, { 
    status: "approved", 
    ...data 
  });
}

// Download catalog
export async function apiDownloadCatalog(importJobId: string): Promise<CatalogDownloadResponse> {
  return api.get<CatalogDownloadResponse>(ENDPOINTS.PRODUCT.BULK_IMPORT_DOWNLOAD(importJobId));
}

// Reject catalog (convenience function)
export async function apiRejectCatalog(
  importJobId: string, 
  data: { reason?: string }
): Promise<CatalogApprovalResponse> {
  return apiApproveOrRejectCatalog(importJobId, { 
    status: "rejected", 
    reason: data.reason 
  });
}

// Import Job Error Logs API Types
export interface ImportJobErrorLog {
  _id: string;
  importJobId: string;
  rowNumber: number;
  productName: string;
  sku: string;
  errorMessage: string;
  rawData: Record<string, unknown>;
  createdAt: string;
}

export interface ImportJobErrorLogsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    errorLogs: ImportJobErrorLog[];
    importJob: {
      _id: string;
      fileName: string;
      status: string;
      totalRows: number;
      importedCount: number;
      failedCount: number;
    };
  };
}

// Get import job error logs
export async function apiGetImportJobErrorLogs(importJobId: string): Promise<ImportJobErrorLogsResponse> {
  return api.get<ImportJobErrorLogsResponse>(ENDPOINTS.PRODUCT.BULK_IMPORT_ERROR_LOGS(importJobId));
}

// Download import template
export async function apiDownloadImportTemplate(categoryName: "skincare" | "haircare" | "lipcare"): Promise<Blob> {
  return api.get<Blob>(ENDPOINTS.PRODUCT.BULK_IMPORT_TEMPLATE(categoryName), {
    responseType: "blob",
  });
}

// Create Product with Seller API Types
export interface ProductVariant {
  sku: string;
  isPrimary: boolean;
  price: number;
  salePrice: number;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

export interface CreateProductWithSellerRequest {
  productName: string;
  sku: string;
  sellerId: string;
  description?: string;
  brand: string;
  productCategory: string[];
  price: number;
  salePrice?: number;
  quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  manufacturingDate?: string;
  expiryDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  thumbnail?: string;
  images?: string[];
  barcodeImage?: string;
  tags?: string[];
  ingredients?: string[];
  keyIngredients?: string[];
  skinTypes?: string[];
  hairTypes?: string[];
  skinConcerns?: string[];
  hairConcerns?: string[];
  hairGoals?: string[];
  productType: "skincare" | "haircare" | "lipcare";
  materialType?: number;
  marketedBy?: string;
  manufacturedBy?: string;
  importedBy?: string;
  benefit?: string[];
  variants?: ProductVariant[];
}

export interface CreateProductWithSellerResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    _id: string;
    productName: string;
    sku: string;
    slug: string;
    status: string;
    sellerId: {
      _id: string;
      companyName: string;
      slug: string;
    };
    brand: {
      _id: string;
      name: string;
      slug: string;
    };
    capturedBy: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    price: number;
    salePrice?: number;
    quantity: number;
    variants?: Array<{
      _id: string;
      sku: string;
      sequence: number;
      isPrimary: boolean;
      price: number;
      salePrice: number;
      quantity: number;
      dimensions: Record<string, unknown>;
      manufacturingDate: string;
      expiryDate: string;
    }>;
    totalVariants?: number;
    easyEcomSyncStatus?: string;
  };
}

// Create product with seller
export async function apiCreateProductWithSeller(data: CreateProductWithSellerRequest): Promise<CreateProductWithSellerResponse> {
  return api.post<CreateProductWithSellerResponse>(ENDPOINTS.PRODUCT.CREATE_WITH_SELLER, data);
}