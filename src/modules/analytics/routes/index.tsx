import MainLayout from "@/core/layouts/main-layout";
import { lazy } from "react";
import type { RouteObject } from "react-router";
import { ANALYTICS_ROUTES } from "./constants";

export const analyticsRoutes: RouteObject = {
  Component: MainLayout,
  path: ANALYTICS_ROUTES.ANALYTIC,
  // Component: lazy(() => import("@/features/analytics/dashboard")),
  children: [
    {
      path: ANALYTICS_ROUTES.PLATFORM.slice(1),
      Component: lazy(() => import("@/modules/analytics/features/platform")),
    },
    {
      path: ANALYTICS_ROUTES.BRAND.slice(1),
      Component: lazy(() => import("@/modules/analytics/features/brand")),
    },
    {
      path: ANALYTICS_ROUTES.INGREDIENT.slice(1),
      Component: lazy(() => import("@/modules/analytics/features/ingredient")),
    },
  ],
};
