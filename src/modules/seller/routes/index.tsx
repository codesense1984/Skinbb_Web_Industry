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
