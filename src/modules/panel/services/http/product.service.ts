import { api } from "@/core/services/http";
import type {
  ProductListResponse,
  ProductListParams,
  BrandListResponse,
  CategoryListResponse,
  TagListResponse,
} from "@/modules/panel/types/product.type";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

export async function apiGetProducts(
  params?: ProductListParams,
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.order) searchParams.append("order", params.order);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.brand) searchParams.append("brand", params.brand);
  if (params?.tag) searchParams.append("tag", params.tag);
  if (params?.status) searchParams.append("status", params.status);

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.PRODUCT.MAIN}?${queryString}`
    : ENDPOINTS.PRODUCT.MAIN;

  return api.get<ProductListResponse>(url, { signal });
}

export async function apiGetBrandsForDropdown(
  params?: { search?: string; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<BrandListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.BRAND.MAIN_ALL}?${queryString}`
    : ENDPOINTS.BRAND.MAIN_ALL;

  return api.get<BrandListResponse>(url, { signal });
}

export async function apiGetCategoriesForDropdown(
  params?: {
    search?: string;
    page?: number;
    limit?: number;
    parentCategory?: string;
  },
  signal?: AbortSignal,
): Promise<CategoryListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.parentCategory)
    searchParams.append("parentCategory", params.parentCategory);

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.PRODUCT.CATEGORY}?${queryString}`
    : ENDPOINTS.PRODUCT.CATEGORY;

  return api.get<CategoryListResponse>(url, { signal });
}

export async function apiGetTagsForDropdown(
  params?: { search?: string; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<TagListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.PRODUCT.TAG_LIST}?${queryString}`
    : ENDPOINTS.PRODUCT.TAG_LIST;

  return api.get<TagListResponse>(url, { signal });
}

// Additional API services for product creation
export async function apiGetVariationTypes(signal?: AbortSignal): Promise<{
  statusCode: number;
  data: {
    productVariationTypes: Array<{ _id: string; name: string; slug: string }>;
  };
  message: string;
  success: boolean;
}> {
  return api.get(ENDPOINTS.PRODUCT.VARIATION_TYPE, { signal });
}

export async function apiGetMarketedBy(
  params?: { search?: string; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: { marketedBy: Array<{ _id: string; name: string; address: string }> };
  message: string;
  success: boolean;
}> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.INFO.MARKETED_BY}?${queryString}`
    : ENDPOINTS.INFO.MARKETED_BY;

  return api.get(url, { signal });
}

export async function apiGetManufacturedBy(
  params?: { search?: string; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: {
    manufacturedBy: Array<{ _id: string; name: string; address: string }>;
  };
  message: string;
  success: boolean;
}> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.INFO.MANUFACTURED_BY}?${queryString}`
    : ENDPOINTS.INFO.MANUFACTURED_BY;

  return api.get(url, { signal });
}

export async function apiGetImportedBy(
  params?: { search?: string; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: { importedBys: Array<{ _id: string; name: string; address: string }> };
  message: string;
  success: boolean;
}> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.INFO.IMPORTED_BY}?${queryString}`
    : ENDPOINTS.INFO.IMPORTED_BY;

  return api.get(url, { signal });
}

export async function apiGetIngredients(
  params?: { search?: string; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: {
    ingredientLists: Array<{
      _id: string;
      name: string;
      otherName: Array<{ _id: string; name: string }>;
    }>;
  };
  message: string;
  success: boolean;
}> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.INFO.INGREDIENT_LIST}?${queryString}`
    : ENDPOINTS.INFO.INGREDIENT_LIST;

  return api.get(url, { signal });
}

export async function apiGetBenefits(
  params?: { search?: string; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: { benefits: Array<{ _id: string; name: string }> };
  message: string;
  success: boolean;
}> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.INFO.BENEFITS_LIST}?${queryString}`
    : ENDPOINTS.INFO.BENEFITS_LIST;

  return api.get(url, { signal });
}

// Product Attribute Values API
export async function apiGetProductAttributeValues(
  attributeId: string,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: {
    productAttributeValues: Array<{
      _id: string;
      label: string;
      value: string;
    }>;
  };
  message: string;
  success: boolean;
}> {
  const url = ENDPOINTS.PRODUCT.ATTRIBUTE_VALUE_BY_ATTRIBUTE(attributeId);
  return api.get(url, { signal });
}

// Product Attributes List API
export async function apiGetProductAttributes(
  params?: { search?: string; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: {
    productAttributes: Array<{ _id: string; name: string; slug: string }>;
  };
  message: string;
  success: boolean;
}> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.PRODUCT.ATTRIBUTE_LIST}?${queryString}`
    : ENDPOINTS.PRODUCT.ATTRIBUTE_LIST;

  return api.get(url, { signal });
}

// Product Attributes with Metadata Field Filter
export async function apiGetProductAttributesWithMetadataField(
  params?: { isMetadataField?: number; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: {
    productAttributes: Array<{ _id: string; name: string; slug: string }>;
  };
  message: string;
  success: boolean;
}> {
  const searchParams = new URLSearchParams();

  if (params?.isMetadataField !== undefined)
    searchParams.append("isMetadataField", params.isMetadataField.toString());
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.PRODUCT.ATTRIBUTE_LIST}?${queryString}`
    : ENDPOINTS.PRODUCT.ATTRIBUTE_LIST;

  return api.get(url, { signal });
}

// Product Attributes with Variant Field Filter
export async function apiGetProductAttributesWithVariantField(
  params?: { isVariantField?: number; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: {
    productAttributes: Array<{ _id: string; name: string; slug: string }>;
  };
  message: string;
  success: boolean;
}> {
  const searchParams = new URLSearchParams();

  if (params?.isVariantField !== undefined)
    searchParams.append("isVariantField", params.isVariantField.toString());
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.PRODUCT.ATTRIBUTE_LIST}?${queryString}`
    : ENDPOINTS.PRODUCT.ATTRIBUTE_LIST;

  return api.get(url, { signal });
}

// Benefits Options API (different from benefits list)
export async function apiGetBenefitsOptions(
  params?: { search?: string; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: { benefits: Array<{ _id: string; name: string }> };
  message: string;
  success: boolean;
}> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.INFO.BENEFITS_LIST}?${queryString}`
    : ENDPOINTS.INFO.BENEFITS_LIST;

  return api.get(url, { signal });
}
