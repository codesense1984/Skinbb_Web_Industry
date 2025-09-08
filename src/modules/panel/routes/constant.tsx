import { ROUTE } from "@/core/routes/constant";

const BRAND_BASE = "/brand";
const BRANDS = "/brands";

const ONBOARD_BASE = "/onboard";

const ORDER_BASE = "/order";
const ORDERS = "/orders";

const STATUS_BASE = "/status";

const COMPANY_BASE = "/company";
const COMPANIES = "/companies";
const COMPANY_LOCATION_BASE = "/company-location";

const CUSTOMER_BASE = "/customer";
const CUSTOMERS = "/customers";

const USER_BASE = "/user";
const USERS = "/users";

const LISTING_BASE = "/listing";

export const PANEL_ROUTES = {
  // ---- Brand ----
  BRAND: {
    BASE: BRAND_BASE, // /brand
    LIST: BRANDS, // /brands
    CREATE: ROUTE.build(BRAND_BASE, ROUTE.seg.create), // /brand/create
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(BRAND_BASE, id, ROUTE.seg.edit), // /brand/edit/:id
  },
  // ---- Order ----
  ORDER: {
    BASE: ORDER_BASE, // /order
    LIST: ORDERS, // /orders
    CREATE: ROUTE.build(ORDER_BASE, ROUTE.seg.create), // /order/create
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(ORDER_BASE, id, ROUTE.seg.edit), // /order/edit/:id
  },

  ONBOARD: {
    BASE: ONBOARD_BASE, // /onboard
    COMPANY: ROUTE.build(ONBOARD_BASE, COMPANY_BASE), // /onboard/create
    COMPANY_STATUS: ROUTE.build(ONBOARD_BASE, COMPANY_BASE, STATUS_BASE), // /onboard/create
    COMPANY_CREATE: ROUTE.build(ONBOARD_BASE, COMPANY_BASE, ROUTE.seg.create), // /onboard/create
    COMPANY_EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(ONBOARD_BASE, COMPANY_BASE, id, ROUTE.seg.edit), // /onboard/company/:id/edit
  },

  // ---- Company ----
  COMPANY: {
    BASE: COMPANY_BASE, // /company
    LIST: COMPANIES, // /companies
    CREATE: ROUTE.build(COMPANY_BASE, ROUTE.seg.create), // /company/create
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(COMPANY_BASE, id, ROUTE.seg.edit), // /company/edit/:id
    // VIEW: (id: string = ROUTE.seg.id) =>
    //   ROUTE.build(COMPANY_BASE, id, ROUTE.seg.view), // /company/edit/:id
    DETAIL: (id: string = ROUTE.seg.id) => ROUTE.build(COMPANY_BASE, id), // /company/:id
    // ONBOARD: ROUTE.build(COMPANY_BASE, ROUTE.seg.onboard), // /company/onboard
  },

  // ---- Company Location ----
  COMPANY_LOCATION: {
    BASE: COMPANY_LOCATION_BASE, // /company-location
    LIST: (companyId: string = ROUTE.seg.id) =>
      ROUTE.build(COMPANY_BASE, companyId, "locations"), // /company/:companyId/locations
    CREATE: (companyId: string = ROUTE.seg.id) =>
      ROUTE.build(COMPANY_BASE, companyId, "locations", ROUTE.seg.create), // /company/:companyId/locations/create
    EDIT: (
      companyId: string = ROUTE.seg.id,
      locationId: string = ROUTE.seg.id,
    ) =>
      ROUTE.build(
        COMPANY_BASE,
        companyId,
        "locations",
        locationId,
        ROUTE.seg.edit,
      ), // /company/:companyId/locations/:locationId/edit
    VIEW: (
      companyId: string = ":companyId",
      locationId: string = ":locationId",
    ) =>
      ROUTE.build(
        COMPANY_BASE,
        companyId,
        "locations",
        locationId,
        ROUTE.seg.view,
      ), // /company/:companyId/locations/:locationId/view
  },

  // ---- Customer ----
  CUSTOMER: {
    BASE: CUSTOMER_BASE, // /customer
    LIST: CUSTOMERS, // /customers
    CREATE: ROUTE.build(CUSTOMER_BASE, ROUTE.seg.create), // /customer/create
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(CUSTOMER_BASE, id, ROUTE.seg.edit), // /customer/edit/:id
    VIEW: (id: string = ROUTE.seg.id) =>
      ROUTE.build(CUSTOMER_BASE, id, ROUTE.seg.view), // /customer/view/:id
    DETAIL: (id: string = ROUTE.seg.id) => ROUTE.build(CUSTOMER_BASE, id), // /customer/:id
  },

  // ---- User ----
  USER: {
    BASE: USER_BASE, // /user
    LIST: USERS, // /users
    CREATE: ROUTE.build(USER_BASE, ROUTE.seg.create), // /user/create
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(USER_BASE, id, ROUTE.seg.edit), // /user/edit/:id
    VIEW: (id: string = ROUTE.seg.id) =>
      ROUTE.build(USER_BASE, id, ROUTE.seg.view), // /user/view/:id
    DETAIL: (id: string = ROUTE.seg.id) => ROUTE.build(USER_BASE, id), // /user/:id
  },

  // ---- Listing/Products ----
  LISTING: {
    BASE: LISTING_BASE, // /listing
    LIST: LISTING_BASE, // /listing
    CREATE: ROUTE.build(LISTING_BASE, ROUTE.seg.create), // /listing/create
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(LISTING_BASE, id, ROUTE.seg.edit), // /listing/edit/:id
    DETAIL: (id: string = ROUTE.seg.id) => ROUTE.build(LISTING_BASE, id), // /listing/:id
  },

  // ---- Misc panel pages ----
  CHAT: "/chat",
  RELATIONSHIP_PREVIEW: "/relationship",
  INGREDIENT_DETAILS: "/ingredient-details",

  // ---------- Back-compat flat keys (mapped to normalized ones) ----------
  // (Keep these so existing imports continue to work. Remove later.)
  // BRAND_LIST: BRANDS,
  // BRAND_CREATE: ROUTE.build(BRAND_BASE, ROUTE.seg.create),
  // BRAND_EDIT: ROUTE.build(BRAND_BASE, ROUTE.seg.edit), // used as `${...}/:id`

  // COMPANIES, // "/companies"
} as const;
