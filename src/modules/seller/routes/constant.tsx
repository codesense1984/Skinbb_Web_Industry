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
    LIST: (companyId: string = ROUTE.seg.id, locationId: string = ROUTE.seg.id) =>
      `/company/${companyId}/locations/${locationId}/brands`, // /company/:companyId/locations/:locationId/brands
    VIEW: (companyId: string = ROUTE.seg.id, locationId: string = ROUTE.seg.id, brandId: string = ROUTE.seg.id) =>
      `/company/${companyId}/locations/${locationId}/brands/${brandId}/view`, // /company/:companyId/locations/:locationId/brands/:brandId/view
    CREATE: (companyId: string = ROUTE.seg.id, locationId: string = ROUTE.seg.id) =>
      `/company/${companyId}/locations/${locationId}/brands/create`, // /company/:companyId/locations/:locationId/brands/create
    EDIT: (companyId: string = ROUTE.seg.id, locationId: string = ROUTE.seg.id, brandId: string = ROUTE.seg.id) =>
      `/company/${companyId}/locations/${locationId}/brands/${brandId}/edit`, // /company/:companyId/locations/:locationId/brands/:brandId/edit
  },

  // ---- Company Location Products ----
  COMPANY_LOCATION_PRODUCTS: {
    BASE: PRODUCTS_BASE, // /products
    LIST: (companyId: string = ROUTE.seg.id, locationId: string = ROUTE.seg.id) =>
      `/company/${companyId}/locations/${locationId}/products`, // /company/:companyId/locations/:locationId/products
    VIEW: (companyId: string = ROUTE.seg.id, locationId: string = ROUTE.seg.id, productId: string = ROUTE.seg.id) =>
      `/company/${companyId}/locations/${locationId}/products/${productId}/view`, // /company/:companyId/locations/:locationId/products/:productId/view
    CREATE: (companyId: string = ROUTE.seg.id, locationId: string = ROUTE.seg.id) =>
      `/company/${companyId}/locations/${locationId}/products/create`, // /company/:companyId/locations/:locationId/products/create
    EDIT: (companyId: string = ROUTE.seg.id, locationId: string = ROUTE.seg.id, productId: string = ROUTE.seg.id) =>
      `/company/${companyId}/locations/${locationId}/products/${productId}/edit`, // /company/:companyId/locations/:locationId/products/:productId/edit
  },

  // ---- Users ----
  USERS: {
    BASE: USERS_BASE, // /company-users
    LIST: (companyId: string = ROUTE.seg.id) =>
      `/company/${companyId}/users`, // /company/:id/users
    VIEW: (companyId: string = ROUTE.seg.id, userId: string = ROUTE.seg.id) =>
      `/company/${companyId}/users/${userId}/view`, // /company/:id/users/:userId/view
    CREATE: (companyId: string = ROUTE.seg.id) =>
      `/company/${companyId}/users/create`, // /company/:id/users/create
    EDIT: (companyId: string = ROUTE.seg.id, userId: string = ROUTE.seg.id) =>
      `/company/${companyId}/users/${userId}/edit`, // /company/:id/users/:userId/edit
  },
} as const;
