import { ROUTE } from "@/core/routes/constant";

// const SELLER_BASE = "/seller";
const DASHBOARD_BASE = "/dashboard";
const PRODUCTS_BASE = "/products";
const ORDERS_BASE = "/orders";
const COMPANY_LOCATION_BASE = "/company-location";

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
} as const;
