import { lazy } from "react";
import type { RouteObject } from "react-router";
import { MANUFACTURER_ROUTES } from "./constant";

export const manufacturerRoutes: RouteObject = {
  Component: lazy(() => import("@/core/layouts/main-layout")),
  children: [
    // Dashboard
    {
      index: true,
      Component: lazy(() => import("@/modules/manufacturer/features/dashboard")),
    },

    // Product Management Routes
    {
      path: MANUFACTURER_ROUTES.PRODUCTS.ALL,
      Component: lazy(() => import("@/modules/manufacturer/features/products")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTS.FORMULATIONS,
      Component: lazy(() => import("@/modules/manufacturer/features/products")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTS.INGREDIENTS_LIBRARY,
      Component: lazy(() => import("@/modules/manufacturer/features/products")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTS.BOM,
      Component: lazy(() => import("@/modules/manufacturer/features/products")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTS.PACKAGING,
      Component: lazy(() => import("@/modules/manufacturer/features/products")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTS.VARIANTS,
      Component: lazy(() => import("@/modules/manufacturer/features/products")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTS.REGULATORY,
      Component: lazy(() => import("@/modules/manufacturer/features/products")),
    },

    // Production Routes
    {
      path: MANUFACTURER_ROUTES.PRODUCTION.CREATE_BATCH,
      Component: lazy(() => import("@/modules/manufacturer/features/production")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTION.BATCH_TRACKING,
      Component: lazy(() => import("@/modules/manufacturer/features/production")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTION.QUALITY_REPORTS,
      Component: lazy(() => import("@/modules/manufacturer/features/production")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTION.SCHEDULING,
      Component: lazy(() => import("@/modules/manufacturer/features/production")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTION.BATCH_ALLOCATION,
      Component: lazy(() => import("@/modules/manufacturer/features/production")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTION.CAPACITY_PLANNER,
      Component: lazy(() => import("@/modules/manufacturer/features/production")),
    },
    {
      path: MANUFACTURER_ROUTES.PRODUCTION.EQUIPMENT_UTILIZATION,
      Component: lazy(() => import("@/modules/manufacturer/features/production")),
    },

    // Inventory Routes
    {
      path: MANUFACTURER_ROUTES.INVENTORY.RAW_MATERIAL,
      Component: lazy(() => import("@/modules/manufacturer/features/inventory")),
    },
    {
      path: MANUFACTURER_ROUTES.INVENTORY.PACKAGING,
      Component: lazy(() => import("@/modules/manufacturer/features/inventory")),
    },
    {
      path: MANUFACTURER_ROUTES.INVENTORY.FINISHED_GOODS,
      Component: lazy(() => import("@/modules/manufacturer/features/inventory")),
    },
    {
      path: MANUFACTURER_ROUTES.INVENTORY.LOW_STOCK_ALERTS,
      Component: lazy(() => import("@/modules/manufacturer/features/inventory")),
    },
    {
      path: MANUFACTURER_ROUTES.INVENTORY.EXPIRY_MANAGEMENT,
      Component: lazy(() => import("@/modules/manufacturer/features/inventory")),
    },
    {
      path: MANUFACTURER_ROUTES.INVENTORY.SUPPLIER_SYNC,
      Component: lazy(() => import("@/modules/manufacturer/features/inventory")),
    },

    // Orders Routes
    {
      path: MANUFACTURER_ROUTES.ORDERS.PURCHASE_ORDERS,
      Component: lazy(() => import("@/modules/manufacturer/features/orders")),
    },
    {
      path: MANUFACTURER_ROUTES.ORDERS.DISTRIBUTOR_ORDERS,
      Component: lazy(() => import("@/modules/manufacturer/features/orders")),
    },
    {
      path: MANUFACTURER_ROUTES.ORDERS.FULFILLMENT,
      Component: lazy(() => import("@/modules/manufacturer/features/orders")),
    },
    {
      path: MANUFACTURER_ROUTES.ORDERS.PACKING_SLIPS,
      Component: lazy(() => import("@/modules/manufacturer/features/orders")),
    },
    {
      path: MANUFACTURER_ROUTES.ORDERS.INVOICES,
      Component: lazy(() => import("@/modules/manufacturer/features/orders")),
    },
    {
      path: MANUFACTURER_ROUTES.ORDERS.SHIPPING,
      Component: lazy(() => import("@/modules/manufacturer/features/orders")),
    },

    // Supplier Management Routes
    {
      path: MANUFACTURER_ROUTES.SUPPLIERS.APPROVED,
      Component: lazy(() => import("@/modules/manufacturer/features/suppliers")),
    },
    {
      path: MANUFACTURER_ROUTES.SUPPLIERS.RAW_MATERIAL,
      Component: lazy(() => import("@/modules/manufacturer/features/suppliers")),
    },
    {
      path: MANUFACTURER_ROUTES.SUPPLIERS.PACKAGING,
      Component: lazy(() => import("@/modules/manufacturer/features/suppliers")),
    },
    {
      path: MANUFACTURER_ROUTES.SUPPLIERS.ONBOARDING,
      Component: lazy(() => import("@/modules/manufacturer/features/suppliers")),
    },
    {
      path: MANUFACTURER_ROUTES.SUPPLIERS.RATINGS,
      Component: lazy(() => import("@/modules/manufacturer/features/suppliers")),
    },
    {
      path: MANUFACTURER_ROUTES.SUPPLIERS.COMPLIANCE,
      Component: lazy(() => import("@/modules/manufacturer/features/suppliers")),
    },

    // Compliance Routes
    {
      path: MANUFACTURER_ROUTES.COMPLIANCE.QA_REPORTS,
      Component: lazy(() => import("@/modules/manufacturer/features/compliance")),
    },
    {
      path: MANUFACTURER_ROUTES.COMPLIANCE.STABILITY_STUDIES,
      Component: lazy(() => import("@/modules/manufacturer/features/compliance")),
    },
    {
      path: MANUFACTURER_ROUTES.COMPLIANCE.SAFETY_SHEETS,
      Component: lazy(() => import("@/modules/manufacturer/features/compliance")),
    },
    {
      path: MANUFACTURER_ROUTES.COMPLIANCE.AUDIT_LOGS,
      Component: lazy(() => import("@/modules/manufacturer/features/compliance")),
    },
    {
      path: MANUFACTURER_ROUTES.COMPLIANCE.CHECKLISTS,
      Component: lazy(() => import("@/modules/manufacturer/features/compliance")),
    },
    {
      path: MANUFACTURER_ROUTES.COMPLIANCE.RECALL_MANAGEMENT,
      Component: lazy(() => import("@/modules/manufacturer/features/compliance")),
    },

    // Brand Collaboration Routes
    {
      path: MANUFACTURER_ROUTES.BRAND_COLLABORATION.OEM_REQUESTS,
      Component: lazy(() => import("@/modules/manufacturer/features/brand-collaboration")),
    },
    {
      path: MANUFACTURER_ROUTES.BRAND_COLLABORATION.BRAND_BRIEFS,
      Component: lazy(() => import("@/modules/manufacturer/features/brand-collaboration")),
    },
    {
      path: MANUFACTURER_ROUTES.BRAND_COLLABORATION.FORMULATION_REQUESTS,
      Component: lazy(() => import("@/modules/manufacturer/features/brand-collaboration")),
    },
    {
      path: MANUFACTURER_ROUTES.BRAND_COLLABORATION.SAMPLING_REQUESTS,
      Component: lazy(() => import("@/modules/manufacturer/features/brand-collaboration")),
    },
    {
      path: MANUFACTURER_ROUTES.BRAND_COLLABORATION.CONTRACTS,
      Component: lazy(() => import("@/modules/manufacturer/features/brand-collaboration")),
    },

    // Marketing Support Routes
    {
      path: MANUFACTURER_ROUTES.MARKETING.MEDIA_FILES,
      Component: lazy(() => import("@/modules/manufacturer/features/marketing")),
    },
    {
      path: MANUFACTURER_ROUTES.MARKETING.MARKETING_KITS,
      Component: lazy(() => import("@/modules/manufacturer/features/marketing")),
    },
    {
      path: MANUFACTURER_ROUTES.MARKETING.CONTENT_LIBRARY,
      Component: lazy(() => import("@/modules/manufacturer/features/marketing")),
    },
    {
      path: MANUFACTURER_ROUTES.MARKETING.CLAIMS_APPROVAL,
      Component: lazy(() => import("@/modules/manufacturer/features/marketing")),
    },

    // Analytics Routes
    {
      path: MANUFACTURER_ROUTES.ANALYTICS.PRODUCTION,
      Component: lazy(() => import("@/modules/manufacturer/features/analytics")),
    },
    {
      path: MANUFACTURER_ROUTES.ANALYTICS.RAW_MATERIAL_FORECAST,
      Component: lazy(() => import("@/modules/manufacturer/features/analytics")),
    },
    {
      path: MANUFACTURER_ROUTES.ANALYTICS.COGS,
      Component: lazy(() => import("@/modules/manufacturer/features/analytics")),
    },
    {
      path: MANUFACTURER_ROUTES.ANALYTICS.EQUIPMENT_EFFICIENCY,
      Component: lazy(() => import("@/modules/manufacturer/features/analytics")),
    },
    {
      path: MANUFACTURER_ROUTES.ANALYTICS.DEMAND_FORECAST,
      Component: lazy(() => import("@/modules/manufacturer/features/analytics")),
    },
    {
      path: MANUFACTURER_ROUTES.ANALYTICS.SKU_PERFORMANCE,
      Component: lazy(() => import("@/modules/manufacturer/features/analytics")),
    },

    // Communication Routes
    {
      path: MANUFACTURER_ROUTES.COMMUNICATION.BRAND_CHATS,
      Component: lazy(() => import("@/modules/manufacturer/features/communication")),
    },
    {
      path: MANUFACTURER_ROUTES.COMMUNICATION.DISTRIBUTOR_CHATS,
      Component: lazy(() => import("@/modules/manufacturer/features/communication")),
    },
    {
      path: MANUFACTURER_ROUTES.COMMUNICATION.SUPPORT_TICKETS,
      Component: lazy(() => import("@/modules/manufacturer/features/communication")),
    },

    // Finance Routes
    {
      path: MANUFACTURER_ROUTES.FINANCE.PAYOUTS,
      Component: lazy(() => import("@/modules/manufacturer/features/finance")),
    },
    {
      path: MANUFACTURER_ROUTES.FINANCE.EXPENSE_TRACKING,
      Component: lazy(() => import("@/modules/manufacturer/features/finance")),
    },
    {
      path: MANUFACTURER_ROUTES.FINANCE.COST_SHEETS,
      Component: lazy(() => import("@/modules/manufacturer/features/finance")),
    },
    {
      path: MANUFACTURER_ROUTES.FINANCE.PRICING_MANAGEMENT,
      Component: lazy(() => import("@/modules/manufacturer/features/finance")),
    },

    // Settings Routes
    {
      path: MANUFACTURER_ROUTES.SETTINGS.USER_ROLES,
      Component: lazy(() => import("@/modules/manufacturer/features/settings")),
    },
    {
      path: MANUFACTURER_ROUTES.SETTINGS.FACTORY_PROFILE,
      Component: lazy(() => import("@/modules/manufacturer/features/settings")),
    },
    {
      path: MANUFACTURER_ROUTES.SETTINGS.API_INTEGRATIONS,
      Component: lazy(() => import("@/modules/manufacturer/features/settings")),
    },
    {
      path: MANUFACTURER_ROUTES.SETTINGS.NOTIFICATIONS,
      Component: lazy(() => import("@/modules/manufacturer/features/settings")),
    },
  ],
};


