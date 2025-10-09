import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { lazy } from "react";
import type { RouteObject } from "react-router";
import { SELLER_ROUTES } from "./constant";

export const sellerRoutes: RouteObject = {
  // Component: MainLayout,
  Component: lazy(() => import("@/core/layouts/main-layout")),
  children: [
    // Dashboard
    {
      index: true,
      Component: lazy(() => import("@/modules/seller/features/dashboard")),
    },

    // Company Management
    {
      path: "/company/:id/view",
      Component: lazy(() => import("@/modules/panel/features/company/view")),
    },
    {
      path: "/company/:id/edit",
      Component: lazy(() => import("@/modules/panel/features/company/edit")),
    },

    // Company Location
    {
      path: SELLER_ROUTES.COMPANY_LOCATION.VIEW(),
      Component: lazy(
        () => import("@/modules/seller/features/CompanyLocationView"),
      ),
    },

    // Brand Management - Using simplified routes
    {
      path: "/brands",
      Component: lazy(
        () => import("@/modules/seller/features/brands/SellerBrandList"),
      ),
    },
    {
      path: "/brand/create",
      Component: lazy(
        () => import("@/modules/seller/features/brands/SellerBrandForm"),
      ),
    },
    {
      path: "/brand/:id/view",
      Component: lazy(
        () => import("@/modules/seller/features/brands/SellerBrandForm"),
      ),
    },
    {
      path: "/brand/:id/edit",
      Component: lazy(
        () => import("@/modules/seller/features/brands/SellerBrandForm"),
      ),
    },

    // Product Management - Using simplified routes
    {
      path: "/products",
      Component: lazy(
        () => import("@/modules/seller/features/products/SellerProductList"),
      ),
    },
    {
      path: "/product/create",
      Component: lazy(() => import("@/modules/panel/features/listing/ProductCreate")),
    },
    {
      path: "/product/:id/view",
      Component: lazy(() => import("@/modules/panel/features/listing/ProductCreate")),
    },
    {
      path: "/product/:id/edit",
      Component: lazy(() => import("@/modules/panel/features/listing/ProductCreate")),
    },

    // Order Management
    {
      path: "/orders",
      Component: lazy(
        () => import("@/modules/panel/features/orders/list"),
      ),
    },
    {
      path: "/order/:id/view",
      Component: lazy(
        () => import("@/modules/seller/features/orders/OrderView"),
      ),
    },

    // User Management
    {
      path: SELLER_ROUTES.USERS.LIST(),
      Component: lazy(() => import("@/modules/seller/features/users/list")),
    },

    // Analytics - Ecommerce Only
    {
      path: SELLER_ROUTES.ANALYTICS.ECOMMERCE.BASE,
      Component: lazy(() => import("@/modules/analytics/features/ecommerce")),
    },
    // Listing/Product Management
    {
      path: "/listings",
      Component: lazy(() => import("@/modules/panel/features/listing")),
    },
    {
      path: "/listing/create",
      Component: lazy(
        () => import("@/modules/panel/features/listing/ProductCreate"),
      ),
    },
    {
      path: "/listing/catalog",
      Component: lazy(
        () => import("@/modules/panel/features/listing/AddCatalog"),
      ),
    },

    // Company Location Brand Management (Complex routes)
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.BRANDS(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-brands/list"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-brands/create"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_VIEW(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-brands/view"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-brands/edit"),
      ),
    },

    // Company Location Product Management (Complex routes)
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCTS(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-products/list"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_CREATE(),
      Component: lazy(
        () =>
          import("@/modules/panel/features/company-location-products/create"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_VIEW(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-products/view"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-products/edit"),
      ),
    },

    // Brand Product Management (Complex routes)
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCTS(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/company-location-brands/products/list"
          ),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCT_CREATE(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/company-location-brands/products/create"
          ),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_EDIT(),
      Component: lazy(
        () =>
          import(
            "@/modules/panel/features/company-location-brands/products/edit"
          ),
      ),
    },

    // 404 fallback
    {
      path: "*",
      // element: <NotFoundComponent />,
      Component: lazy(() => import("@/core/features/not-found")),
    },
  ],
};
