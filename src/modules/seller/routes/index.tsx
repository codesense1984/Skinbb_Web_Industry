import MainLayout from "@/core/layouts/main-layout";
import { lazy } from "react";
import type { RouteObject } from "react-router";
import { SELLER_ROUTES } from "./constant";

export const sellerRoutes: RouteObject = {
  Component: MainLayout,
  children: [
    {
      index: true,
      Component: lazy(() => import("@/modules/seller/features/CompanyView")),
    },

    // company location
    {
      path: SELLER_ROUTES.COMPANY_LOCATION.VIEW(),
      Component: lazy(
        () => import("@/modules/seller/features/CompanyLocationView"),
      ),
    },

    // brands - using existing panel components
    {
      path: "/company/:companyId/locations/:locationId/brands",
      Component: lazy(() => import("@/modules/panel/features/company-location-brands/list")),
    },
    {
      path: "/company/:companyId/locations/:locationId/brands/:brandId/view",
      Component: lazy(() => import("@/modules/panel/features/company-location-brands/view")),
    },
    {
      path: "/company/:companyId/locations/:locationId/brands/create",
      Component: lazy(() => import("@/modules/panel/features/company-location-brands/create")),
    },
    {
      path: "/company/:companyId/locations/:locationId/brands/:brandId/edit",
      Component: lazy(() => import("@/modules/panel/features/company-location-brands/edit")),
    },
    {
      path: "/company/:companyId/locations/:locationId/brands/:brandId/products",
      Component: lazy(() => import("@/modules/panel/features/company-location-brands/products/list")),
    },
    {
      path: "/company/:companyId/locations/:locationId/brands/:brandId/products/create",
      Component: lazy(() => import("@/modules/panel/features/company-location-brands/products/create")),
    },

    // products - using existing panel components
    {
      path: "/company/:companyId/locations/:locationId/products",
      Component: lazy(() => import("@/modules/panel/features/company-location-products/list")),
    },
    {
      path: "/company/:companyId/locations/:locationId/products/:productId/view",
      Component: lazy(() => import("@/modules/panel/features/company-location-products/view")),
    },
    {
      path: "/company/:companyId/locations/:locationId/products/create",
      Component: lazy(() => import("@/modules/panel/features/company-location-products/create")),
    },
    {
      path: "/company/:companyId/locations/:locationId/products/:productId/edit",
      Component: lazy(() => import("@/modules/panel/features/company-location-products/edit")),
    },

    // users - using existing panel components
    {
      path: "/company/:id/users",
      Component: lazy(() => import("@/modules/panel/features/company/users/list")),
    },
    {
      path: "/company/:id/users/:userId/view",
      Component: lazy(() => import("@/modules/panel/features/company/users/user-form")),
    },
    {
      path: "/company/:id/users/create",
      Component: lazy(() => import("@/modules/panel/features/company/users/user-form")),
    },
    {
      path: "/company/:id/users/:userId/edit",
      Component: lazy(() => import("@/modules/panel/features/company/users/user-form")),
    },

    // Products routes
    // {
    //   path: SELLER_ROUTES.PRODUCTS.LIST,
    //   Component: lazy(
    //     () => import("@/modules/seller/features/products/SellerProducts"),
    //   ),
    // },

    // {
    //   path: SELLER_ROUTES.PRODUCTS.CREATE,
    //   Component: lazy(
    //     () => import("@/modules/seller/features/products/ProductForm"),
    //   ),
    // },
    // {
    //   path: SELLER_ROUTES.PRODUCTS.EDIT(),
    //   Component: lazy(
    //     () => import("@/modules/seller/features/products/ProductForm"),
    //   ),
    // },
    // {
    //   path: SELLER_ROUTES.PRODUCTS.VIEW(),
    //   Component: lazy(
    //     () => import("@/modules/seller/features/products/ProductView"),
    //   ),
    // },
    // Orders routes
    // {
    //   path: SELLER_ROUTES.ORDERS.LIST,
    //   Component: lazy(
    //     () => import("@/modules/seller/features/orders/SellerOrders"),
    //   ),
    // },
    // {
    //   path: SELLER_ROUTES.ORDERS.VIEW(),
    //   Component: lazy(
    //     () => import("@/modules/seller/features/orders/OrderView"),
    //   ),
    // },

    {
      path: "*",
      element: <div></div>,
    },
  ],
};
