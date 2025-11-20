import { lazy } from "react";
import type { RouteObject } from "react-router";
import { DISTRIBUTOR_ROUTES } from "./constant";

export const distributorRoutes: RouteObject = {
  Component: lazy(() => import("@/core/layouts/main-layout")),
  children: [
    // Dashboard
    {
      index: true,
      Component: lazy(() => import("@/modules/distributor/features/dashboard")),
    },

    // Orders Routes
    {
      path: DISTRIBUTOR_ROUTES.ORDERS.LIST,
      Component: lazy(() => import("@/modules/distributor/features/orders")),
    },
    {
      path: DISTRIBUTOR_ROUTES.ORDERS.CREATE,
      Component: lazy(() => import("@/modules/distributor/features/orders")),
    },
    {
      path: DISTRIBUTOR_ROUTES.ORDERS.PENDING,
      Component: lazy(() => import("@/modules/distributor/features/orders")),
    },
    {
      path: DISTRIBUTOR_ROUTES.ORDERS.VIEW(),
      Component: lazy(() => import("@/modules/distributor/features/orders")),
    },
    {
      path: DISTRIBUTOR_ROUTES.ORDERS.TRACKING,
      Component: lazy(() => import("@/modules/distributor/features/orders")),
    },
    {
      path: DISTRIBUTOR_ROUTES.ORDERS.RETURNS,
      Component: lazy(() => import("@/modules/distributor/features/orders")),
    },
    {
      path: DISTRIBUTOR_ROUTES.ORDERS.INVOICES,
      Component: lazy(() => import("@/modules/distributor/features/orders")),
    },

    // Inventory Routes
    {
      path: DISTRIBUTOR_ROUTES.INVENTORY.CURRENT_STOCK,
      Component: lazy(() => import("@/modules/distributor/features/inventory")),
    },
    {
      path: DISTRIBUTOR_ROUTES.INVENTORY.REPLENISHMENT,
      Component: lazy(() => import("@/modules/distributor/features/inventory")),
    },
    {
      path: DISTRIBUTOR_ROUTES.INVENTORY.EXPIRY_TRACKING,
      Component: lazy(() => import("@/modules/distributor/features/inventory")),
    },
    {
      path: DISTRIBUTOR_ROUTES.INVENTORY.LOW_STOCK_ALERTS,
      Component: lazy(() => import("@/modules/distributor/features/inventory")),
    },
    {
      path: DISTRIBUTOR_ROUTES.INVENTORY.BATCH_WISE,
      Component: lazy(() => import("@/modules/distributor/features/inventory")),
    },

    // Retailer Routes
    {
      path: DISTRIBUTOR_ROUTES.RETAILER.DIRECTORY,
      Component: lazy(() => import("@/modules/distributor/features/retailer")),
    },
    {
      path: DISTRIBUTOR_ROUTES.RETAILER.ONBOARDING,
      Component: lazy(() => import("@/modules/distributor/features/retailer")),
    },
    {
      path: DISTRIBUTOR_ROUTES.RETAILER.ORDERS,
      Component: lazy(() => import("@/modules/distributor/features/retailer")),
    },
    {
      path: DISTRIBUTOR_ROUTES.RETAILER.CREDIT_LIMITS,
      Component: lazy(() => import("@/modules/distributor/features/retailer")),
    },
    {
      path: DISTRIBUTOR_ROUTES.RETAILER.VISIT_LOGS,
      Component: lazy(() => import("@/modules/distributor/features/retailer")),
    },

    // Products Routes
    {
      path: DISTRIBUTOR_ROUTES.PRODUCTS.CATALOG,
      Component: lazy(() => import("@/modules/distributor/features/products")),
    },
    {
      path: DISTRIBUTOR_ROUTES.PRODUCTS.PRICE_LISTS,
      Component: lazy(() => import("@/modules/distributor/features/products")),
    },
    {
      path: DISTRIBUTOR_ROUTES.PRODUCTS.SKUS,
      Component: lazy(() => import("@/modules/distributor/features/products")),
    },
    {
      path: DISTRIBUTOR_ROUTES.PRODUCTS.PROMOTIONS,
      Component: lazy(() => import("@/modules/distributor/features/products")),
    },

    // Logistics Routes
    {
      path: DISTRIBUTOR_ROUTES.LOGISTICS.ROUTE_PLANNING,
      Component: lazy(() => import("@/modules/distributor/features/logistics")),
    },
    {
      path: DISTRIBUTOR_ROUTES.LOGISTICS.TRACKING,
      Component: lazy(() => import("@/modules/distributor/features/logistics")),
    },
    {
      path: DISTRIBUTOR_ROUTES.LOGISTICS.DISPATCH_HISTORY,
      Component: lazy(() => import("@/modules/distributor/features/logistics")),
    },
    {
      path: DISTRIBUTOR_ROUTES.LOGISTICS.DELIVERY_PERSONNEL,
      Component: lazy(() => import("@/modules/distributor/features/logistics")),
    },

    // Marketing Routes
    {
      path: DISTRIBUTOR_ROUTES.MARKETING.PROMO_CAMPAIGNS,
      Component: lazy(() => import("@/modules/distributor/features/marketing")),
    },
    {
      path: DISTRIBUTOR_ROUTES.MARKETING.COUPONS,
      Component: lazy(() => import("@/modules/distributor/features/marketing")),
    },
    {
      path: DISTRIBUTOR_ROUTES.MARKETING.SCHEMES,
      Component: lazy(() => import("@/modules/distributor/features/marketing")),
    },
    {
      path: DISTRIBUTOR_ROUTES.MARKETING.POSM_REQUESTS,
      Component: lazy(() => import("@/modules/distributor/features/marketing")),
    },

    // Brand Connect Routes
    {
      path: DISTRIBUTOR_ROUTES.BRAND_CONNECT.COMMUNICATIONS,
      Component: lazy(() => import("@/modules/distributor/features/brand-connect")),
    },
    {
      path: DISTRIBUTOR_ROUTES.BRAND_CONNECT.PRODUCT_UPDATES,
      Component: lazy(() => import("@/modules/distributor/features/brand-connect")),
    },
    {
      path: DISTRIBUTOR_ROUTES.BRAND_CONNECT.TRAINING_MATERIALS,
      Component: lazy(() => import("@/modules/distributor/features/brand-connect")),
    },
    {
      path: DISTRIBUTOR_ROUTES.BRAND_CONNECT.NEW_LAUNCHES,
      Component: lazy(() => import("@/modules/distributor/features/brand-connect")),
    },

    // CRM Routes
    {
      path: DISTRIBUTOR_ROUTES.CRM.LEADS,
      Component: lazy(() => import("@/modules/distributor/features/crm")),
    },
    {
      path: DISTRIBUTOR_ROUTES.CRM.RETAILER_ISSUES,
      Component: lazy(() => import("@/modules/distributor/features/crm")),
    },
    {
      path: DISTRIBUTOR_ROUTES.CRM.TICKETING,
      Component: lazy(() => import("@/modules/distributor/features/crm")),
    },
    {
      path: DISTRIBUTOR_ROUTES.CRM.FEEDBACK,
      Component: lazy(() => import("@/modules/distributor/features/crm")),
    },

    // Analytics Routes
    {
      path: DISTRIBUTOR_ROUTES.ANALYTICS.SALES,
      Component: lazy(() => import("@/modules/distributor/features/analytics")),
    },
    {
      path: DISTRIBUTOR_ROUTES.ANALYTICS.AREA_INSIGHTS,
      Component: lazy(() => import("@/modules/distributor/features/analytics")),
    },
    {
      path: DISTRIBUTOR_ROUTES.ANALYTICS.RETAILER_INSIGHTS,
      Component: lazy(() => import("@/modules/distributor/features/analytics")),
    },
    {
      path: DISTRIBUTOR_ROUTES.ANALYTICS.PRODUCT_DEMAND,
      Component: lazy(() => import("@/modules/distributor/features/analytics")),
    },
    {
      path: DISTRIBUTOR_ROUTES.ANALYTICS.STOCK_MOVEMENT,
      Component: lazy(() => import("@/modules/distributor/features/analytics")),
    },
    {
      path: DISTRIBUTOR_ROUTES.ANALYTICS.MARGIN,
      Component: lazy(() => import("@/modules/distributor/features/analytics")),
    },

    // Finance Routes
    {
      path: DISTRIBUTOR_ROUTES.FINANCE.PAYMENTS,
      Component: lazy(() => import("@/modules/distributor/features/finance")),
    },
    {
      path: DISTRIBUTOR_ROUTES.FINANCE.CREDIT_NOTES,
      Component: lazy(() => import("@/modules/distributor/features/finance")),
    },
    {
      path: DISTRIBUTOR_ROUTES.FINANCE.OUTSTANDING,
      Component: lazy(() => import("@/modules/distributor/features/finance")),
    },
    {
      path: DISTRIBUTOR_ROUTES.FINANCE.LEDGER,
      Component: lazy(() => import("@/modules/distributor/features/finance")),
    },
    {
      path: DISTRIBUTOR_ROUTES.FINANCE.COMMISSION,
      Component: lazy(() => import("@/modules/distributor/features/finance")),
    },
  ],
};


