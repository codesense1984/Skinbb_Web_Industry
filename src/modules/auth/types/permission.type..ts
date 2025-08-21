export const PERMISSION = {
  DELETE: "delete",
  UPDATE: "update",
  CREATE: "create",
  VIEW: "view",
} as const;

export const ROLE = {
  ADMIN: "admin",
  GENERAL: "general",
  DOCTOR: "doctor",
  SELLER: "seller",
} as const;

export const PAGE = {
  POSTS: "posts",
  CATEGORIES: "categories",
  USERS: "users",
  TAGS: "tags",
  CONTENT_TYPE: "content-type",
  SETTINGS: "settings",
  MEDIA: "media",
  ROLES: "roles",
  PERMISSIONS: "permissions",
  COMMUNITY: "community",
  DOCTORS: "doctors",
  BRANDS: "brands",
  ALGORITHMS: "algorithms",
  PAGES: "pages",
  SEARCHES: "searches",
  TRANSACTIONS: "transactions",
  SCAN_OVERVIEW: "scan-overview",
  NOTIFICATIONS: "notifications",
  SITEMAP: "sitemap",
  ANALYSIS_QUESTION: "analysis-question",
  COMMUNITY_CATEGORY: "community-category",
  ROUTINE: "routine",
  SHELF: "shelf",
  INGREDIENTS: "ingredients",
  PRODUCTS: "products",
  PRODUCT_ATTRIBUTE: "product-attribute",
  PRODUCT_CATEGORY: "product-category",
  PRODUCT_TAGS: "product-tags",
  PRODUCT_REVIEW: "product-review",
  BRAND_REQUEST: "brand-request",
  SELLERS: "sellers",
  COUPONS: "coupons",
  ORDERS: "orders",
  CUSTOMERS: "customers",
  IMPORT_LOGS: "import-logs",
} as const;

// type = all known values OR any string
export type Page = (typeof PAGE)[keyof typeof PAGE] | (string & {});

// types: known literals OR any string
export type PermissionAction =
  | (typeof PERMISSION)[keyof typeof PERMISSION]
  | (string & {}); // keeps autocomplete while allowing any string

export type PermissionElement = Permission["action"][number];

export type Role = (typeof ROLE)[keyof typeof ROLE] | (string & {});
export interface Permission {
  page: Page;
  action: PermissionAction[];
}
