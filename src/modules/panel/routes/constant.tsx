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

const PRODUCT_BASE = "/product";
const PRODUCTS = "/products";

const MASTER_BASE = "/master";
const PRODUCT_CATEGORY_BASE = "/product-category";
const PRODUCT_TAG_BASE = "/product-tag";
const DISCOUNT_COUPON_BASE = "/discount-coupons";

export const PANEL_ROUTES = {
  // ---- Brand ----
  BRAND: {
    BASE: BRAND_BASE, // /brand
    LIST: BRANDS, // /brands
    CREATE: ROUTE.build(BRAND_BASE, ROUTE.seg.create), // /brand/create
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(BRAND_BASE, id, ROUTE.seg.edit), // /brand/edit/:id
    VIEW: (id: string = ROUTE.seg.id) =>
      ROUTE.build(BRAND_BASE, id, ROUTE.seg.view), // /brand/view/:id
  },
  // ---- Order ----
  ORDER: {
    BASE: ORDER_BASE, // /order
    LIST: ORDERS, // /orders
    CREATE: ROUTE.build(ORDER_BASE, ROUTE.seg.create), // /order/create
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(ORDER_BASE, id, ROUTE.seg.edit), // /order/edit/:id
    VIEW: (id: string = ROUTE.seg.id) =>
      ROUTE.build(ORDER_BASE, id, ROUTE.seg.view), // /order/view/:id
  },

  ONBOARD: {
    BASE: ONBOARD_BASE, // /onboard
    COMPANY: ROUTE.build(ONBOARD_BASE, COMPANY_BASE), // /onboard/create
    COMPANY_STATUS: ROUTE.build(ONBOARD_BASE, COMPANY_BASE, STATUS_BASE), // /onboard/create
    COMPANY_CREATE: ROUTE.build(ONBOARD_BASE, COMPANY_BASE, ROUTE.seg.create), // /onboard/create
    COMPANY_EDIT: (
      id: string = ROUTE.seg.id,
      locationId: string = ":locationId",
    ) =>
      ROUTE.build(
        ONBOARD_BASE,
        COMPANY_BASE,
        id,
        "location",
        locationId,
        ROUTE.seg.edit,
      ), // /onboard/company/:id/edit
  },

  // ---- Company ----
  COMPANY: {
    BASE: COMPANY_BASE, // /company
    LIST: COMPANIES, // /companies
    CREATE: ROUTE.build(COMPANY_BASE, ROUTE.seg.create), // /company/create
    VIEW: (id: string = ROUTE.seg.id) =>
      ROUTE.build(COMPANY_BASE, id, ROUTE.seg.view), // /company/view/:id
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(COMPANY_BASE, id, ROUTE.seg.edit), // /company/edit/:id
    DETAIL: (id: string = ROUTE.seg.id) => ROUTE.build(COMPANY_BASE, id), // /company/:id
    USERS: (id: string = ROUTE.seg.id) =>
      ROUTE.build(COMPANY_BASE, id, "users"), // /company/:id/users
    USER_CREATE: (id: string = ROUTE.seg.id) =>
      ROUTE.build(COMPANY_BASE, id, "users", ROUTE.seg.create), // /company/:id/users/create
    USER_EDIT: (id: string = ROUTE.seg.id, userId: string = ":userId") =>
      ROUTE.build(COMPANY_BASE, id, "users", userId, ROUTE.seg.edit), // /company/:id/users/:userId/edit
    USER_VIEW: (id: string = ROUTE.seg.id, userId: string = ":userId") =>
      ROUTE.build(COMPANY_BASE, id, "users", userId, ROUTE.seg.view), // /company/:id/users/:userId/view
    BRANDS: (id: string = ROUTE.seg.id) =>
      ROUTE.build(COMPANY_BASE, id, "brands"), // /company/:id/brands
    BRAND_CREATE: (id: string = ROUTE.seg.id) =>
      ROUTE.build(COMPANY_BASE, id, "brands", ROUTE.seg.create), // /company/:id/brands/create
    BRAND_EDIT: (id: string = ROUTE.seg.id, brandId: string = ":brandId") =>
      ROUTE.build(COMPANY_BASE, id, "brands", brandId, ROUTE.seg.edit), // /company/:id/brands/:brandId/edit
    BRAND_VIEW: (id: string = ROUTE.seg.id, brandId: string = ":brandId") =>
      ROUTE.build(COMPANY_BASE, id, "brands", brandId, ROUTE.seg.view), // /company/:id/brands/:brandId/view
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
    BRANDS: (
      companyId: string = ":companyId",
      locationId: string = ":locationId",
    ) =>
      ROUTE.build(COMPANY_BASE, companyId, "locations", locationId, "brands"), // /company/:companyId/locations/:locationId/brands
    BRAND_CREATE: (
      companyId: string = ":companyId",
      locationId: string = ":locationId",
    ) =>
      ROUTE.build(
        COMPANY_BASE,
        companyId,
        "locations",
        locationId,
        "brands",
        ROUTE.seg.create,
      ), // /company/:companyId/locations/:locationId/brands/create
    BRAND_EDIT: (
      companyId: string = ":companyId",
      locationId: string = ":locationId",
      brandId: string = ":brandId",
    ) =>
      ROUTE.build(
        COMPANY_BASE,
        companyId,
        "locations",
        locationId,
        "brands",
        brandId,
        ROUTE.seg.edit,
      ), // /company/:companyId/locations/:locationId/brands/:brandId/edit
    BRAND_VIEW: (
      companyId: string = ":companyId",
      locationId: string = ":locationId",
      brandId: string = ":brandId",
    ) =>
      ROUTE.build(
        COMPANY_BASE,
        companyId,
        "locations",
        locationId,
        "brands",
        brandId,
        ROUTE.seg.view,
      ), // /company/:companyId/locations/:locationId/brands/:brandId/view
    BRAND_PRODUCTS: (
      companyId: string = ":companyId",
      locationId: string = ":locationId",
      brandId: string = ":brandId",
    ) =>
      ROUTE.build(
        COMPANY_BASE,
        companyId,
        "locations",
        locationId,
        "brands",
        brandId,
        "products",
      ), // /company/:companyId/locations/:locationId/brands/:brandId/products
    BRAND_PRODUCT_CREATE: (
      companyId: string = ":companyId",
      locationId: string = ":locationId",
      brandId: string = ":brandId",
    ) =>
      ROUTE.build(
        COMPANY_BASE,
        companyId,
        "locations",
        locationId,
        "brands",
        brandId,
        "products",
        ROUTE.seg.create,
      ), // /company/:companyId/locations/:locationId/brands/:brandId/products/create
    PRODUCTS: (
      companyId: string = ":companyId",
      locationId: string = ":locationId",
    ) =>
      ROUTE.build(COMPANY_BASE, companyId, "locations", locationId, "products"), // /company/:companyId/locations/:locationId/products
    PRODUCT_CREATE: (
      companyId: string = ":companyId",
      locationId: string = ":locationId",
    ) =>
      ROUTE.build(
        COMPANY_BASE,
        companyId,
        "locations",
        locationId,
        "products",
        ROUTE.seg.create,
      ), // /company/:companyId/locations/:locationId/products/create
    PRODUCT_EDIT: (
      companyId: string = ":companyId",
      locationId: string = ":locationId",
      productId: string = ":productId",
    ) =>
      ROUTE.build(
        COMPANY_BASE,
        companyId,
        "locations",
        locationId,
        "products",
        productId,
        ROUTE.seg.edit,
      ), // /company/:companyId/locations/:locationId/products/:productId/edit
    PRODUCT_VIEW: (
      companyId: string = ":companyId",
      locationId: string = ":locationId",
      productId: string = ":productId",
    ) =>
      ROUTE.build(
        COMPANY_BASE,
        companyId,
        "locations",
        locationId,
        "products",
        productId,
        ROUTE.seg.view,
      ), // /company/:companyId/locations/:locationId/products/:productId/view
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
    CREATE_WITH_PARAMS: (companyId: string, brandId: string) =>
      ROUTE.build(LISTING_BASE, ROUTE.seg.create) + `?companyId=${companyId}&brandId=${brandId}`, // /listing/create?companyId=:companyId&brandId=:brandId
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(LISTING_BASE, id, ROUTE.seg.edit), // /listing/edit/:id
    EDIT_WITH_PARAMS: (companyId: string, brandId: string, id: string) =>
      ROUTE.build(LISTING_BASE, ROUTE.seg.create) + `?mode=edit&id=${id}&companyId=${companyId}&brandId=${brandId}`, // /listing/create?mode=edit&id=:id&companyId=:companyId&brandId=:brandId
    VIEW_WITH_PARAMS: (companyId: string, brandId: string, id: string) =>
      ROUTE.build(LISTING_BASE, ROUTE.seg.create) + `?mode=view&id=${id}&companyId=${companyId}&brandId=${brandId}`, // /listing/create?mode=view&id=:id&companyId=:companyId&brandId=:brandId
    DETAIL: (id: string = ROUTE.seg.id) => ROUTE.build(LISTING_BASE, id), // /listing/:id
  },

  // ---- Products ----
  PRODUCT: {
    BASE: PRODUCT_BASE, // /product
    LIST: PRODUCTS, // /products
    CREATE: ROUTE.build(PRODUCT_BASE, ROUTE.seg.create), // /product/create
    EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(PRODUCT_BASE, id, ROUTE.seg.edit), // /product/edit/:id
    VIEW: (id: string = ROUTE.seg.id) =>
      ROUTE.build(PRODUCT_BASE, id, ROUTE.seg.view), // /product/view/:id
    DETAIL: (id: string = ROUTE.seg.id) => ROUTE.build(PRODUCT_BASE, id), // /product/:id
  },

  // ---- Master Data ----
  MASTER: {
    BASE: MASTER_BASE, // /master
    PRODUCT_CATEGORY: ROUTE.build(MASTER_BASE, PRODUCT_CATEGORY_BASE), // /master/product-category
    PRODUCT_CATEGORY_CREATE: ROUTE.build(
      MASTER_BASE,
      PRODUCT_CATEGORY_BASE,
      ROUTE.seg.create,
    ), // /master/product-category/create
    PRODUCT_CATEGORY_EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(MASTER_BASE, PRODUCT_CATEGORY_BASE, id, ROUTE.seg.edit), // /master/product-category/edit/:id
    PRODUCT_CATEGORY_VIEW: (id: string = ROUTE.seg.id) =>
      ROUTE.build(MASTER_BASE, PRODUCT_CATEGORY_BASE, id, ROUTE.seg.view), // /master/product-category/view/:id
    PRODUCT_TAG: ROUTE.build(MASTER_BASE, PRODUCT_TAG_BASE), // /master/product-tag
    PRODUCT_TAG_CREATE: ROUTE.build(
      MASTER_BASE,
      PRODUCT_TAG_BASE,
      ROUTE.seg.create,
    ), // /master/product-tag/create
    PRODUCT_TAG_EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(MASTER_BASE, PRODUCT_TAG_BASE, id, ROUTE.seg.edit), // /master/product-tag/edit/:id
    PRODUCT_TAG_VIEW: (id: string = ROUTE.seg.id) =>
      ROUTE.build(MASTER_BASE, PRODUCT_TAG_BASE, id, ROUTE.seg.view), // /master/product-tag/view/:id
    DISCOUNT_COUPON: ROUTE.build(MASTER_BASE, DISCOUNT_COUPON_BASE), // /master/discount-coupons
    DISCOUNT_COUPON_CREATE: ROUTE.build(
      MASTER_BASE,
      DISCOUNT_COUPON_BASE,
      ROUTE.seg.create,
    ), // /master/discount-coupons/create
    DISCOUNT_COUPON_EDIT: (id: string = ROUTE.seg.id) =>
      ROUTE.build(MASTER_BASE, DISCOUNT_COUPON_BASE, id, ROUTE.seg.edit), // /master/discount-coupons/edit/:id
    DISCOUNT_COUPON_VIEW: (id: string = ROUTE.seg.id) =>
      ROUTE.build(MASTER_BASE, DISCOUNT_COUPON_BASE, id, ROUTE.seg.view), // /master/discount-coupons/view/:id
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
