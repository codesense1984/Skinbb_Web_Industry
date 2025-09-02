// endpoints.ts

export const API_PREFIX = "/api/v1" as const;

export const ENDPOINTS = {
  AUTH: {
    SIGN_IN: `${API_PREFIX}/users/login`,
    SIGN_OUT: "/sign-out",
  },

  ONBOARDING: {
    // MAIN: `${API_PREFIX}/brands/on-boarding`,
    MAIN: `${API_PREFIX}/sellers/onboard`,
    SEND_MAIL: `${API_PREFIX}/otp/send/email`,
    VERIFY_MAIL: `${API_PREFIX}/otp/verify/email`,
    SEND_MOBILE: `${API_PREFIX}/otp/send`,
    VERIFY_MOBILE: `${API_PREFIX}/otp/verify`,
    STATUS: `${API_PREFIX}/brands/on-boarding/status`,
    ADMIN: `${API_PREFIX}/brands/on-boarding/admin`, // (was "onboard")
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
  },

  MEDIA: {
    UPLOAD: `${API_PREFIX}/media/upload`,
  },

  BRAND: {
    MAIN: `${API_PREFIX}/brands/admin`,
    TOGGLE_STATUS: `${API_PREFIX}/brands/admin/toggle-status`,
  },

  INFO: {
    INGREDIENT_LIST: `${API_PREFIX}/ingredients/list`,
    MARKETED_BY: `${API_PREFIX}/marketed-by`,
    MANUFACTURED_BY: `${API_PREFIX}/manufactured-by`,
    IMPORTED_BY: `${API_PREFIX}/imported-by`,
    BENEFITS_LIST: `${API_PREFIX}/benefits/options`,
  },

  REVIEW: {
    LIST: `${API_PREFIX}/reviews/admin/list`,
    MAIN: `${API_PREFIX}/reviews/admin`,
    UPDATE_STATUS: `${API_PREFIX}/reviews/admin/status`,
  },

  USER: {
    LIST: `${API_PREFIX}/users/all`,
    CUSTOMERS: `${API_PREFIX}/customers/admin/all`,
  },

  SELLER: {
    MAIN: `${API_PREFIX}/sellers/admin`,
    GET_COMPANY_DETAILS: `${API_PREFIX}/sellers/companyDetailById`,
    GET_COMPANY_LIST: `${API_PREFIX}/sellers/getCompanyNameList`,
    CHECK_STATUS: `${API_PREFIX}/sellers/check-status`,
  },

  DISCOUNT: {
    LIST: `${API_PREFIX}/discount/admin/list`,
  },

  COUPON: {
    MAIN: `${API_PREFIX}/coupons/admin`,
  },

  ORDER: {
    MAIN: `${API_PREFIX}/orders/admin`,
  },

  DASHBOARD: {
    SALES_ANALYTICS: `${API_PREFIX}/dashboard/admin/sales-analytics`,
    TOP_PRODUCTS: `${API_PREFIX}/dashboard/admin/top-products-analytics`,
    TOP_BRANDS: `${API_PREFIX}/dashboard/admin/top-brands-analytics`,
    TOP_SELLERS: `${API_PREFIX}/dashboard/admin/top-sellers-analytics`,
  },
} as const;

export type Endpoints = typeof ENDPOINTS;
