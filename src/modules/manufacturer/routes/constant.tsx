
const DASHBOARD_BASE = "/dashboard";

export const MANUFACTURER_ROUTES = {
  // ---- Dashboard ----
  DASHBOARD: {
    BASE: DASHBOARD_BASE, // /dashboard
    HOME: "/", // / (root for manufacturer)
  },

  // ---- Product Management ----
  PRODUCTS: {
    BASE: "/products",
    ALL: "/products/all",
    FORMULATIONS: "/products/formulations",
    INGREDIENTS_LIBRARY: "/products/ingredients-library",
    BOM: "/products/bom",
    PACKAGING: "/products/packaging",
    VARIANTS: "/products/variants",
    REGULATORY: "/products/regulatory",
  },

  // ---- Production & Batch ----
  PRODUCTION: {
    BASE: "/production",
    CREATE_BATCH: "/production/create-batch",
    BATCH_TRACKING: "/production/batch-tracking",
    QUALITY_REPORTS: "/production/quality-reports",
    SCHEDULING: "/production/scheduling",
    BATCH_ALLOCATION: "/production/batch-allocation",
    CAPACITY_PLANNER: "/production/capacity-planner",
    EQUIPMENT_UTILIZATION: "/production/equipment-utilization",
  },

  // ---- Inventory ----
  INVENTORY: {
    BASE: "/inventory",
    RAW_MATERIAL: "/inventory/raw-material",
    PACKAGING: "/inventory/packaging",
    FINISHED_GOODS: "/inventory/finished-goods",
    LOW_STOCK_ALERTS: "/inventory/low-stock-alerts",
    EXPIRY_MANAGEMENT: "/inventory/expiry-management",
    SUPPLIER_SYNC: "/inventory/supplier-sync",
  },

  // ---- Orders ----
  ORDERS: {
    BASE: "/orders",
    PURCHASE_ORDERS: "/orders/purchase-orders",
    DISTRIBUTOR_ORDERS: "/orders/distributor-orders",
    FULFILLMENT: "/orders/fulfillment",
    PACKING_SLIPS: "/orders/packing-slips",
    INVOICES: "/orders/invoices",
    SHIPPING: "/orders/shipping",
  },

  // ---- Supplier Management ----
  SUPPLIERS: {
    BASE: "/suppliers",
    APPROVED: "/suppliers/approved",
    RAW_MATERIAL: "/suppliers/raw-material",
    PACKAGING: "/suppliers/packaging",
    ONBOARDING: "/suppliers/onboarding",
    RATINGS: "/suppliers/ratings",
    COMPLIANCE: "/suppliers/compliance",
  },

  // ---- Compliance & QA ----
  COMPLIANCE: {
    BASE: "/compliance",
    QA_REPORTS: "/compliance/qa-reports",
    STABILITY_STUDIES: "/compliance/stability-studies",
    SAFETY_SHEETS: "/compliance/safety-sheets",
    AUDIT_LOGS: "/compliance/audit-logs",
    CHECKLISTS: "/compliance/checklists",
    RECALL_MANAGEMENT: "/compliance/recall-management",
  },

  // ---- Brand Collaboration ----
  BRAND_COLLABORATION: {
    BASE: "/brand-collaboration",
    OEM_REQUESTS: "/brand-collaboration/oem-requests",
    BRAND_BRIEFS: "/brand-collaboration/brand-briefs",
    FORMULATION_REQUESTS: "/brand-collaboration/formulation-requests",
    SAMPLING_REQUESTS: "/brand-collaboration/sampling-requests",
    CONTRACTS: "/brand-collaboration/contracts",
  },

  // ---- Marketing Support ----
  MARKETING: {
    BASE: "/marketing",
    MEDIA_FILES: "/marketing/media-files",
    MARKETING_KITS: "/marketing/marketing-kits",
    CONTENT_LIBRARY: "/marketing/content-library",
    CLAIMS_APPROVAL: "/marketing/claims-approval",
  },

  // ---- Analytics ----
  ANALYTICS: {
    BASE: "/analytics",
    PRODUCTION: "/analytics/production",
    RAW_MATERIAL_FORECAST: "/analytics/raw-material-forecast",
    COGS: "/analytics/cogs",
    EQUIPMENT_EFFICIENCY: "/analytics/equipment-efficiency",
    DEMAND_FORECAST: "/analytics/demand-forecast",
    SKU_PERFORMANCE: "/analytics/sku-performance",
  },

  // ---- Communication ----
  COMMUNICATION: {
    BASE: "/communication",
    BRAND_CHATS: "/communication/brand-chats",
    DISTRIBUTOR_CHATS: "/communication/distributor-chats",
    SUPPORT_TICKETS: "/communication/support-tickets",
  },

  // ---- Finance ----
  FINANCE: {
    BASE: "/finance",
    PAYOUTS: "/finance/payouts",
    EXPENSE_TRACKING: "/finance/expense-tracking",
    COST_SHEETS: "/finance/cost-sheets",
    PRICING_MANAGEMENT: "/finance/pricing-management",
  },

  // ---- Settings ----
  SETTINGS: {
    BASE: "/settings",
    USER_ROLES: "/settings/user-roles",
    FACTORY_PROFILE: "/settings/factory-profile",
    API_INTEGRATIONS: "/settings/api-integrations",
    NOTIFICATIONS: "/settings/notifications",
  },
} as const;


