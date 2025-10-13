import { ROUTE } from "@/core/routes/constant";

// const SELLER_BASE = "/seller";
const DASHBOARD_BASE = "/dashboard";
const PRODUCTS_BASE = "/products";
const ORDERS_BASE = "/orders";
const COMPANY_LOCATION_BASE = "/company-location";
const BRANDS_BASE = "/company-location-brands";
const USERS_BASE = "/company-users";

export const SELLER_ROUTES = {
  // ---- Dashboard ----
  DASHBOARD: {
    BASE: DASHBOARD_BASE, // /dashboard
    HOME: "/", // / (root for seller)
  },

  // ---- Products ----
  PRODUCTS: {
    BASE: PRODUCTS_BASE, // /products
    LIST: PRODUCTS_BASE, // /products
    CREATE: ROUTE.build(PRODUCTS_BASE, ROUTE.seg.create), // /products/create
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(PRODUCTS_BASE, id, ROUTE.seg.edit), // /products/edit/:id
    VIEW: (id: string = ROUTE.seg.id) =>
      ROUTE.build(PRODUCTS_BASE, id, ROUTE.seg.view), // /products/view/:id
    DETAIL: (id: string = ROUTE.seg.id) => ROUTE.build(PRODUCTS_BASE, id), // /products/:id
  },

  // ---- Orders ----
  ORDERS: {
    BASE: ORDERS_BASE, // /orders
    LIST: ORDERS_BASE, // /orders
    VIEW: (id: string = ROUTE.seg.id) =>
      ROUTE.build(ORDERS_BASE, id, ROUTE.seg.view), // /orders/view/:id
    DETAIL: (id: string = ROUTE.seg.id) => ROUTE.build(ORDERS_BASE, id), // /orders/:id
  },

  // ---- Company Location ----
  COMPANY_LOCATION: {
    BASE: COMPANY_LOCATION_BASE, // /company-location
    VIEW: (locationId: string = ROUTE.seg.id) =>
      ROUTE.build(COMPANY_LOCATION_BASE, locationId, ROUTE.seg.view), // /company-location/:locationId
  },

  // ---- Brands ----
  BRANDS: {
    BASE: BRANDS_BASE, // /company-location-brands
    LIST: (
      companyId: string = ROUTE.seg.id,
      locationId: string = ROUTE.seg.id,
    ) => `/company/${companyId}/locations/${locationId}/brands`, // /company/:companyId/locations/:locationId/brands
    VIEW: (
      companyId: string = ROUTE.seg.id,
      locationId: string = ROUTE.seg.id,
      brandId: string = ROUTE.seg.id,
    ) => `/company/${companyId}/locations/${locationId}/brands/${brandId}/view`, // /company/:companyId/locations/:locationId/brands/:brandId/view
    CREATE: (
      companyId: string = ROUTE.seg.id,
      locationId: string = ROUTE.seg.id,
    ) => `/company/${companyId}/locations/${locationId}/brands/create`, // /company/:companyId/locations/:locationId/brands/create
    EDIT: (
      companyId: string = ROUTE.seg.id,
      locationId: string = ROUTE.seg.id,
      brandId: string = ROUTE.seg.id,
    ) => `/company/${companyId}/locations/${locationId}/brands/${brandId}/edit`, // /company/:companyId/locations/:locationId/brands/:brandId/edit
  },

  // ---- Seller Brand Routes (simplified) ----
  SELLER_BRANDS: {
    BASE: "/brands", // /brands
    LIST: "/brands", // /brands
    CREATE: "/brand/create", // /brand/create
    VIEW: (id: string = ROUTE.seg.id) => `/brand/${id}/view`, // /brand/:id/view
    EDIT: (id: string = ROUTE.seg.id) => `/brand/${id}/edit`, // /brand/:id/edit
  },

  // ---- Seller Product Routes (simplified) ----
  SELLER_PRODUCTS: {
    BASE: "/products", // /products
    LIST: "/products", // /products
    CREATE: "/product/create", // /product/create
    VIEW: (id: string = ROUTE.seg.id) => `/product/${id}/view`, // /product/:id/view
    EDIT: (id: string = ROUTE.seg.id) => `/product/${id}/edit`, // /product/:id/edit
  },

  // ---- Seller Order Routes (simplified) ----
  SELLER_ORDERS: {
    BASE: "/orders", // /orders
    LIST: "/orders", // /orders
    VIEW: (id: string = ROUTE.seg.id) => `/order/${id}/view`, // /order/:id/view
  },

  // ---- Seller Company Routes (simplified) ----
  SELLER_COMPANY: {
    BASE: "/company", // /company
    VIEW: (id: string = ROUTE.seg.id) => `/company/${id}/view`, // /company/:id/view
    EDIT: (id: string = ROUTE.seg.id) => `/company/${id}/edit`, // /company/:id/edit
  },

  // ---- Seller User Routes (simplified) ----
  SELLER_USERS: {
    BASE: "/company", // /company
    LIST: (companyId: string = ROUTE.seg.id) => `/company/${companyId}/users`, // /company/:id/users
    CREATE: (companyId: string = ROUTE.seg.id) =>
      `/company/${companyId}/users/create`, // /company/:id/users/create
    VIEW: (companyId: string = ROUTE.seg.id, userId: string = ROUTE.seg.id) =>
      `/company/${companyId}/users/${userId}/view`, // /company/:id/users/:userId/view
    EDIT: (companyId: string = ROUTE.seg.id, userId: string = ROUTE.seg.id) =>
      `/company/${companyId}/users/${userId}/edit`, // /company/:id/users/:userId/edit
  },

  // ---- Seller Listing Routes (simplified) ----
  SELLER_LISTINGS: {
    BASE: "/listings", // /listings
    LIST: "/listings", // /listings
    CREATE: "/listing/create", // /listing/create
  },

  // ---- Seller Catalog Routes (using admin components) ----
  CATALOG: {
    BASE: "/catalog", // /catalog (dedicated catalog list)
    LIST: "/catalog", // /catalog (dedicated catalog list)
    ADD: "/listing/catalog", // /listing/catalog (admin catalog add)
  },

  // ---- Company Location Products ----
  COMPANY_LOCATION_PRODUCTS: {
    BASE: PRODUCTS_BASE, // /products
    LIST: (
      companyId: string = ROUTE.seg.id,
      locationId: string = ROUTE.seg.id,
    ) => `/company/${companyId}/locations/${locationId}/products`, // /company/:companyId/locations/:locationId/products
    VIEW: (
      companyId: string = ROUTE.seg.id,
      locationId: string = ROUTE.seg.id,
      productId: string = ROUTE.seg.id,
    ) =>
      `/company/${companyId}/locations/${locationId}/products/${productId}/view`, // /company/:companyId/locations/:locationId/products/:productId/view
    CREATE: (
      companyId: string = ROUTE.seg.id,
      locationId: string = ROUTE.seg.id,
    ) => `/company/${companyId}/locations/${locationId}/products/create`, // /company/:companyId/locations/:locationId/products/create
    EDIT: (
      companyId: string = ROUTE.seg.id,
      locationId: string = ROUTE.seg.id,
      productId: string = ROUTE.seg.id,
    ) =>
      `/company/${companyId}/locations/${locationId}/products/${productId}/edit`, // /company/:companyId/locations/:locationId/products/:productId/edit
  },

  // ---- Users ----
  USERS: {
    BASE: USERS_BASE, // /company-users
    LIST: () => "/users", // /company/:id/users
    VIEW: (companyId: string = ROUTE.seg.id, userId: string = ROUTE.seg.id) =>
      `/company/${companyId}/users/${userId}/view`, // /company/:id/users/:userId/view
    CREATE: (companyId: string = ROUTE.seg.id) =>
      `/company/${companyId}/users/create`, // /company/:id/users/create
    EDIT: (companyId: string = ROUTE.seg.id, userId: string = ROUTE.seg.id) =>
      `/company/${companyId}/users/${userId}/edit`, // /company/:id/users/:userId/edit
  },

  // ---- Marketing ----
  MARKETING: {
    BASE: "/marketing",
    DISCOUNT_COUPONS: {
      BASE: "/marketing/discount-coupons",
      LIST: "/marketing/discount-coupons",
      CREATE: "/marketing/discount-coupons/create",
      VIEW: (id: string = ROUTE.seg.id) => `/marketing/discount-coupons/${id}/view`,
      EDIT: (id: string = ROUTE.seg.id) => `/marketing/discount-coupons/${id}/edit`,
    },
    SURVEYS: {
      BASE: "/marketing/surveys",
      LIST: "/marketing/surveys",
      CREATE: "/marketing/surveys/create",
      VIEW: (id: string = ROUTE.seg.id) => `/marketing/surveys/${id}/view`,
      EDIT: (id: string = ROUTE.seg.id) => `/marketing/surveys/${id}/edit`,
    },
    PROMOTIONS: {
      BASE: "/marketing/promotions",
      LIST: "/marketing/promotions",
      CREATE: "/marketing/promotions/create",
      VIEW: (id: string = ROUTE.seg.id) => `/marketing/promotions/${id}/view`,
      EDIT: (id: string = ROUTE.seg.id) => `/marketing/promotions/${id}/edit`,
    },
  },

  // ---- Analytics ----
  ANALYTICS: {
    BASE: "/analytics",
    SALES_INSIGHTS: {
      BASE: "/analytics/sales-insights",
    },
    INGREDIENT_INSIGHTS: {
      BASE: "/analytics/ingredient-insights",
    },
    BRAND_INSIGHTS: {
      BASE: "/analytics/brand-insights",
    },
    CUSTOMER_INSIGHTS: {
      BASE: "/analytics/customer-insights",
    },
    MARKET_TRENDS: {
      BASE: "/analytics/market-trends",
    },
    ECOMMERCE: {
      BASE: "/analytic/ecommerce",
    },
  },

  // ---- User Settings ----
  USER_SETTINGS: {
    BASE: "/settings",
    PROFILE: {
      BASE: "/settings/profile",
    },
    PERMISSIONS: {
      BASE: "/settings/permissions",
    },
    PREFERENCES: {
      BASE: "/settings/preferences",
    },
  },
} as const;
