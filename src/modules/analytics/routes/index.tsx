import { lazy } from "react";
import type { RouteObject } from "react-router";
import { ANALYTICS_ROUTES } from "./constants";

export const analyticsRoutes: RouteObject = {
  Component: lazy(() => import("@/core/layouts/main-layout")),
  // Component: lazy(() => import("@/features/analytics/dashboard")),
  children: [
    {
      path: ANALYTICS_ROUTES.PLATFORM.BASE,
      Component: lazy(() => import("@/modules/analytics/features/platform")),
    },
    {
      path: ANALYTICS_ROUTES.BRAND.BASE,
      Component: lazy(() => import("@/modules/analytics/features/brand")),
    },
    {
      path: ANALYTICS_ROUTES.INGREDIENT.BASE,
      Component: lazy(() => import("@/modules/analytics/features/ingredient")),
    },
    {
      path: ANALYTICS_ROUTES.ECOMMERCE.BASE,
      Component: lazy(
        () => import("@/modules/analytics/features/ecommerce-dashboard"),
      ),
    },
    {
      path: ANALYTICS_ROUTES.ECOMMERCE.DASHBOARD,
      Component: lazy(
        () => import("@/modules/analytics/features/ecommerce-dashboard"),
      ),
    },
  ],
};
