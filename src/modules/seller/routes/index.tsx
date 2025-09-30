import MainLayout from "@/core/layouts/main-layout";
import { lazy } from "react";
import type { RouteObject } from "react-router";
import { SELLER_ROUTES } from "./constant";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

export const sellerRoutes: RouteObject = {
  Component: MainLayout,
  children: [
    // Dashboard
    {
      index: true,
      Component: lazy(() => import("@/modules/seller/features/dashboard")),
    },

    // Company Management
    {
      path: "/company/:id/view",
      Component: lazy(
        () => import("@/modules/panel/features/company/view"),
      ),
    },
    {
      path: "/company/:id/edit",
      Component: lazy(
        () => import("@/modules/panel/features/company/edit"),
      ),
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
        () => import("@/modules/panel/features/brands/brand-form"),
      ),
    },
    {
      path: "/brand/:id/view",
      Component: lazy(
        () => import("@/modules/panel/features/brands/brand-form"),
      ),
    },
    {
      path: "/brand/:id/edit",
      Component: lazy(
        () => import("@/modules/panel/features/brands/brand-form"),
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
      Component: lazy(
        () => import("@/modules/panel/features/products/create"),
      ),
    },
    {
      path: "/product/:id/view",
      Component: lazy(
        () => import("@/modules/panel/features/products/view"),
      ),
    },
    {
      path: "/product/:id/edit",
      Component: lazy(
        () => import("@/modules/panel/features/products/edit"),
      ),
    },

    // Order Management
    {
      path: "/orders",
      Component: lazy(
        () => import("@/modules/seller/features/orders/SellerOrders"),
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
      path: "/company/:id/users",
      Component: lazy(
        () => import("@/modules/panel/features/company/users/list"),
      ),
    },
    {
      path: "/company/:id/users/create",
      Component: lazy(
        () => import("@/modules/panel/features/company/users/user-form"),
      ),
    },
    {
      path: "/company/:id/users/:userId/view",
      Component: lazy(
        () => import("@/modules/panel/features/company/users/user-form"),
      ),
    },
    {
      path: "/company/:id/users/:userId/edit",
      Component: lazy(
        () => import("@/modules/panel/features/company/users/user-form"),
      ),
    },

    // Listing/Product Management
    {
      path: "/listings",
      Component: lazy(
        () => import("@/modules/panel/features/listing"),
      ),
    },
    {
      path: "/listing/create",
      Component: lazy(
        () => import("@/modules/panel/features/listing/ProductCreate"),
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
        () => import("@/modules/panel/features/company-location-products/create"),
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
        () => import("@/modules/panel/features/company-location-brands/products/list"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCT_CREATE(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-brands/products/create"),
      ),
    },
    {
      path: PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_EDIT(),
      Component: lazy(
        () => import("@/modules/panel/features/company-location-brands/products/edit"),
      ),
    },

    // 404 fallback
    {
      path: "*",
      element: <div>Page not found</div>,
    },
  ],
};
