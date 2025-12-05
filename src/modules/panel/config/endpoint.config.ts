// endpoints.ts

export const API_PREFIX = "/api/v1" as const;

export const ENDPOINTS = {
  AUTH: {
    SIGN_IN: `${API_PREFIX}/users/login`,
    SIGN_OUT: "/sign-out",
  },

  ONBOARDING: {
    // MAIN: `${API_PREFIX}/brands/on-boarding`,
    MAIN: `${API_PREFIX}/onboard/company`,
    SEND_MAIL: `${API_PREFIX}/otp/send/email`,
    VERIFY_MAIL: `${API_PREFIX}/otp/verify/email`,
    SEND_MOBILE: `${API_PREFIX}/otp/send`,
    VERIFY_MOBILE: `${API_PREFIX}/otp/verify`,
    STATUS: `${API_PREFIX}/brands/on-boarding/status`,
    ADMIN: `${API_PREFIX}/brands/on-boarding/admin`, // (was "onboard")
    ADMIN_BY_ID: (id: string) => `${API_PREFIX}/brands/on-boarding/admin/${id}`,
    COMPANY_DETAILS: (id: string) => `${API_PREFIX}/onboard/company/${id}`,
    COMPANY_LOCATION_DETAILS: (id: string, locationId: string) =>
      `${API_PREFIX}/onboard/${id}/locations/${locationId}/onboarding`,
    COMPANY_CHECK_STATUS: `${API_PREFIX}/onboard/status`,
  },

  COMPANY: {
    MAIN: `${API_PREFIX}/company`,
    DETAIL: (id: string) => `${API_PREFIX}/company/${id}`,
    LOCATION: (companyId: string) =>
      `${API_PREFIX}/company/${companyId}/locations`,
    LOCATION_DETAILS: (companyId: string, locationId: string) =>
      `${API_PREFIX}/company/${companyId}/locations/${locationId}`,
    USERS: (companyId: string) => `${API_PREFIX}/company/${companyId}/users`,
  },

  PAGE: {
    DETAILS: `${API_PREFIX}/pages/details`,
  },

  PRODUCT: {
    MAIN: `${API_PREFIX}/products/admin`,
    TAG: `${API_PREFIX}/product-tags/admin`,
    TAG_LIST: `${API_PREFIX}/product-tags/admin/all`,
    TAG_BULK_CREATE: `${API_PREFIX}/product-tags/admin/bulk-create`,
    ATTRIBUTE: `${API_PREFIX}/product-attributes/admin`,
    ATTRIBUTE_LIST: `${API_PREFIX}/product-attributes/admin/list`,
    ATTRIBUTE_VALUE: `${API_PREFIX}/product-attributes/admin/value`,
    ATTRIBUTE_VALUE_LIST: `${API_PREFIX}/product-attributes/admin/value/list`,
    ATTRIBUTE_VALUE_BULK_CREATE: `${API_PREFIX}/product-attributes/admin/value/bulk-create`,
    CATEGORY: `${API_PREFIX}/product-category/admin`,
    CATEGORY_TOGGLE_STATUS: `${API_PREFIX}/product-category/admin/toggle-status`,
    CATEGORY_HIERARCHY: `${API_PREFIX}/product-category/admin/all`,
    VARIATION_TYPE: `${API_PREFIX}/product-variation-types/admin`,
    META_FIELD_ATTRIBUTES: `${API_PREFIX}/product-attributes/admin/list`,
    ATTRIBUTE_VALUE_BY_ATTRIBUTE: (attributeId: string) =>
      `${API_PREFIX}/product-attributes/admin/value/list?attributeId=${attributeId}`,
    BULK_IMPORT: `${API_PREFIX}/products/admin/bulk-import`,
    BULK_IMPORTS: `${API_PREFIX}/products/admin/bulk-imports`,
    BULK_IMPORT_DETAIL: (importJobId: string) =>
      `${API_PREFIX}/products/admin/bulk-import/${importJobId}`,
    BULK_IMPORT_APPROVE: (importJobId: string) =>
      `${API_PREFIX}/products/admin/bulk-import/${importJobId}/approve`,
    BULK_IMPORT_DOWNLOAD: (importJobId: string) =>
      `${API_PREFIX}/products/admin/bulk-import/${importJobId}/download`,
    BULK_IMPORT_ERROR_LOGS: (importJobId: string) =>
      `${API_PREFIX}/product-import-jobs/admin/${importJobId}`,
    BULK_IMPORT_TEMPLATE: (categoryName: string) =>
      `${API_PREFIX}/products/admin/template/${categoryName}`,
    CREATE_WITH_SELLER: `${API_PREFIX}/products/create-with-seller`,
    CREATE_PRODUCT: `${API_PREFIX}/products/create-product`,
  },

  MEDIA: {
    UPLOAD: `${API_PREFIX}/media/upload`,
    UPLOAD_MEDIA: `${API_PREFIX}/media/upload-media`,
  },

  BRAND: {
    MAIN: `${API_PREFIX}/brands/admin`,
    TOGGLE_STATUS: (id: string) =>
      `${API_PREFIX}/brands/admin/toggle-status/${id}`,
    MAIN_BY_ID: (id: string) => `${API_PREFIX}/brands/admin/${id}`,
    MAIN_ALL: `${API_PREFIX}/brands/admin/all`,
    UPDATE_STATUS: (adminId: string, brandId: string) =>
      `${API_PREFIX}/sellers/admin/${adminId}/brands/${brandId}/status`,
    GET_STATUS: (adminId: string, brandId: string) =>
      `${API_PREFIX}/sellers/admin/${adminId}/brands/${brandId}/status`,
  },

  INFO: {
    INGREDIENT_LIST: `${API_PREFIX}/ingredients/list`,
    MARKETED_BY: `${API_PREFIX}/marketed-by`,
    MANUFACTURED_BY: `${API_PREFIX}/manufactured-by`,
    IMPORTED_BY: `${API_PREFIX}/imported-by`,
    BENEFITS_LIST: `${API_PREFIX}/benefits/options`,
    SKIN_TYPES: `${API_PREFIX}/skin-types`,
    HAIR_TYPES: `${API_PREFIX}/hair-types`,
    SKIN_CONCERNS: `${API_PREFIX}/skin-concerns`,
    HAIR_CONCERNS: `${API_PREFIX}/hair-concerns`,
  },

  REVIEW: {
    LIST: `${API_PREFIX}/reviews/admin/list`,
    MAIN: `${API_PREFIX}/reviews/admin`,
    UPDATE_STATUS: `${API_PREFIX}/reviews/admin/status`,
  },

  USER: {
    LIST: `${API_PREFIX}/users/all`,
    CUSTOMERS: `${API_PREFIX}/customers/admin/all`,
    CUSTOMER: `${API_PREFIX}/customers/admin`,
    SELLER_MEMBERS: `${API_PREFIX}/sellers/seller-members`,
    SELLER_MEMBERS_CREATE: `${API_PREFIX}/sellers/{sellerId}/seller-members`,
    SELLER_MEMBERS_UPDATE: `${API_PREFIX}/sellers/seller-members/{memberId}`,
    SELLER_MEMBERS_DELETE: `${API_PREFIX}/sellers/seller-members/{memberId}`,
  },

  ROLE: {
    LIST: `${API_PREFIX}/roles/lists`,
  },

  SELLER: {
    MAIN: `${API_PREFIX}/company`,
    GET_COMPANY_DETAILS: (id: string) => `${API_PREFIX}/sellers/${id}`,
    GET_COMPANY_DETAIL_DATA: (id: string) =>
      `${API_PREFIX}/sellers/${id}/detailData`,
    GET_COMPANY_LIST: `${API_PREFIX}/sellers/getCompanyNameList`,
    GET_COMPANY_DETAILS_LIST: `${API_PREFIX}/sellers/getCompanyDetails`,
    // CHECK_STATUS: `${API_PREFIX}/sellers/check-status`,
    UPDATE_INFO: `${API_PREFIX}/sellers/info`,
    UPDATE_STATUS: (addressId: string) =>
      `${API_PREFIX}/sellers/admin/address/${addressId}/status`,
  },

  // Company Location Brands
  COMPANY_LOCATION_BRANDS: {
    LIST: (companyId: string, locationId: string) =>
      `${API_PREFIX}/sellers/${companyId}/locations/${locationId}/brands`,
    CREATE: (companyId: string, locationId: string) =>
      `${API_PREFIX}/sellers/${companyId}/locations/${locationId}/brands`,
    GET_BY_ID: (companyId: string, locationId: string, brandId: string) =>
      `${API_PREFIX}/sellers/${companyId}/locations/${locationId}/brands/${brandId}`,
    UPDATE: (companyId: string, locationId: string, brandId: string) =>
      `${API_PREFIX}/sellers/${companyId}/locations/${locationId}/brands/${brandId}`,
    DELETE: (companyId: string, locationId: string, brandId: string) =>
      `${API_PREFIX}/sellers/${companyId}/locations/${locationId}/brands/${brandId}`,
  },

  // Company Location Products
  COMPANY_LOCATION_PRODUCTS: {
    LIST: (companyId: string, locationId: string) =>
      `${API_PREFIX}/sellers/${companyId}/locations/${locationId}/products`,
    CREATE: (companyId: string, locationId: string) =>
      `${API_PREFIX}/sellers/${companyId}/locations/${locationId}/products`,
    GET_BY_ID: (companyId: string, locationId: string, productId: string) =>
      `${API_PREFIX}/sellers/${companyId}/locations/${locationId}/products/${productId}`,
    UPDATE: (companyId: string, locationId: string, productId: string) =>
      `${API_PREFIX}/sellers/${companyId}/locations/${locationId}/products/${productId}`,
    DELETE: (companyId: string, locationId: string, productId: string) =>
      `${API_PREFIX}/sellers/${companyId}/locations/${locationId}/products/${productId}`,
  },

  // Seller Brand Products (New endpoint for product view/edit)
  SELLER_BRAND_PRODUCTS: {
    LIST: (sellerId: string, brandId: string) =>
      `${API_PREFIX}/sellers/${sellerId}/brands/${brandId}/products`,
    GET_BY_ID: (sellerId: string, brandId: string, productId: string) =>
      `${API_PREFIX}/sellers/${sellerId}/brands/${brandId}/products/${productId}`,
    DETAILS: (productId: string) => `${API_PREFIX}/products/admin/${productId}`,
  },

  DISCOUNT: {
    LIST: `${API_PREFIX}/discount/admin/list`,
  },

  COUPON: {
    MAIN: `${API_PREFIX}/coupons/admin`,
    LIST: `${API_PREFIX}/coupons/admin/all`,
    CREATE: `${API_PREFIX}/coupons/admin`,
    UPDATE: (id: string) => `${API_PREFIX}/coupons/admin/${id}`,
    DELETE: (id: string) => `${API_PREFIX}/coupons/admin/${id}`,
    GET_BY_ID: (id: string) => `${API_PREFIX}/coupons/admin/${id}`,
  },

  ORDER: {
    MAIN: `${API_PREFIX}/orders/admin`,
    MAIN_ALL: `${API_PREFIX}/orders/admin/all`,
    MAIN_BY_ID: (id: string) => `${API_PREFIX}/orders/admin/${id}`,
  },

  DASHBOARD: {
    SALES_ANALYTICS: `${API_PREFIX}/dashboard/admin/sales-analytics`,
    TOP_PRODUCTS: `${API_PREFIX}/dashboard/admin/top-products-analytics`,
    TOP_BRANDS: `${API_PREFIX}/dashboard/admin/top-brands-analytics`,
    TOP_SELLERS: `${API_PREFIX}/dashboard/admin/top-sellers-analytics`,
  },

  ANALYTICS: {
    OVERVIEW: `${API_PREFIX}/admin-analytics/overview`,
    ABANDONED_DRAFT_ORDERS: `${API_PREFIX}/admin-analytics/abandoned-draft-orders`,
    SALES_INSIGHTS: `${API_PREFIX}/admin-analytics/sales-insights`,
  },

  VERIFICATION: {
    VERIFY_PAN: `${API_PREFIX}/company-verification/verify-pan`,
    VERIFY_GST: `${API_PREFIX}/company-verification/verify-gst`,
    VERIFY_CIN: `${API_PREFIX}/company-verification/verify-cin`,
  },

  SURVEY: {
    MAIN: `${API_PREFIX}/surveys`,
    TYPES: `${API_PREFIX}/survey-types`,
  },
} as const;

export type Endpoints = typeof ENDPOINTS;
