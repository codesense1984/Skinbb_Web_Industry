import { ROUTE } from "@/core/routes/constant";

const DASHBOARD_BASE = "/dashboard";

export const DISTRIBUTOR_ROUTES = {
  // ---- Dashboard ----
  DASHBOARD: {
    BASE: DASHBOARD_BASE, // /dashboard
    HOME: "/", // / (root for distributor)
  },

  // ---- Orders ----
  ORDERS: {
    BASE: "/orders",
    LIST: "/orders",
    CREATE: "/orders/create",
    PENDING: "/orders/pending",
    VIEW: (id: string = ROUTE.seg.id) => `/orders/${id}/view`,
    EDIT: (id: string = ROUTE.seg.id) => `/orders/${id}/edit`,
    TRACKING: "/orders/tracking",
    RETURNS: "/orders/returns",
    INVOICES: "/orders/invoices",
  },

  // ---- Inventory Management ----
  INVENTORY: {
    BASE: "/inventory",
    CURRENT_STOCK: "/inventory/current-stock",
    REPLENISHMENT: "/inventory/replenishment",
    EXPIRY_TRACKING: "/inventory/expiry-tracking",
    LOW_STOCK_ALERTS: "/inventory/low-stock-alerts",
    BATCH_WISE: "/inventory/batch-wise",
  },

  // ---- Retailer/Dealer Management ----
  RETAILER: {
    BASE: "/retailer",
    DIRECTORY: "/retailer/directory",
    ONBOARDING: "/retailer/onboarding",
    ORDERS: "/retailer/orders",
    CREDIT_LIMITS: "/retailer/credit-limits",
    VISIT_LOGS: "/retailer/visit-logs",
  },

  // ---- Products ----
  PRODUCTS: {
    BASE: "/products",
    CATALOG: "/products/catalog",
    PRICE_LISTS: "/products/price-lists",
    SKUS: "/products/skus",
    PROMOTIONS: "/products/promotions",
  },

  // ---- Logistics ----
  LOGISTICS: {
    BASE: "/logistics",
    ROUTE_PLANNING: "/logistics/route-planning",
    TRACKING: "/logistics/tracking",
    DISPATCH_HISTORY: "/logistics/dispatch-history",
    DELIVERY_PERSONNEL: "/logistics/delivery-personnel",
  },

  // ---- Marketing / Promotions ----
  MARKETING: {
    BASE: "/marketing",
    PROMO_CAMPAIGNS: "/marketing/promo-campaigns",
    COUPONS: "/marketing/coupons",
    SCHEMES: "/marketing/schemes",
    POSM_REQUESTS: "/marketing/posm-requests",
  },

  // ---- Brand Connect ----
  BRAND_CONNECT: {
    BASE: "/brand-connect",
    COMMUNICATIONS: "/brand-connect/communications",
    PRODUCT_UPDATES: "/brand-connect/product-updates",
    TRAINING_MATERIALS: "/brand-connect/training-materials",
    NEW_LAUNCHES: "/brand-connect/new-launches",
  },

  // ---- CRM & Support ----
  CRM: {
    BASE: "/crm",
    LEADS: "/crm/leads",
    RETAILER_ISSUES: "/crm/retailer-issues",
    TICKETING: "/crm/ticketing",
    FEEDBACK: "/crm/feedback",
  },

  // ---- Analytics ----
  ANALYTICS: {
    BASE: "/analytics",
    SALES: "/analytics/sales",
    AREA_INSIGHTS: "/analytics/area-insights",
    RETAILER_INSIGHTS: "/analytics/retailer-insights",
    PRODUCT_DEMAND: "/analytics/product-demand",
    STOCK_MOVEMENT: "/analytics/stock-movement",
    MARGIN: "/analytics/margin",
  },

  // ---- Finance ----
  FINANCE: {
    BASE: "/finance",
    PAYMENTS: "/finance/payments",
    CREDIT_NOTES: "/finance/credit-notes",
    OUTSTANDING: "/finance/outstanding",
    LEDGER: "/finance/ledger",
    COMMISSION: "/finance/commission",
  },
} as const;


