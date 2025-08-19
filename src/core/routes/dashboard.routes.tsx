// routes/auth.routes.ts
import MainLayout from "@/core/layouts/main-layout";
import IngredientDetail from "@/features/ingredient-detail";
import { lazy } from "react";
import type { RouteObject } from "react-router";
import PrivateRoute from "../../modules/auth/routes/PrivateRoute";
import { ROUTES } from "./routes.constant";

export const dashboardRoutes: RouteObject = {
  Component: PrivateRoute,
  children: [
    {
      Component: MainLayout,
      children: [
        {
          index: true,
          Component: lazy(() => import("@/features/dashboard/index")),
        },
        //brand
        {
          path: ROUTES.BRAND_LIST,
          Component: lazy(() => import("@/features/brands/brand-list")),
        },
        {
          path: ROUTES.BRAND_CREATE,
          Component: lazy(() => import("@/features/brands/brand-form")),
        },
        {
          path: `${ROUTES.BRAND_EDIT}/:id`,
          Component: lazy(() => import("@/features/brands/brand-form")),
        },
        // analytics
        // {
        //   path: ROUTES.ANALYTIC,
        //   // Component: lazy(() => import("@/features/analytics/dashboard")),
        //   children: [
        //     {
        //       path: ROUTES.PLATFORM.slice(1),
        //       Component: lazy(
        //         () => import("@/modules/analytics/features/platform"),
        //       ),
        //     },
        //     {
        //       path: ROUTES.BRAND.slice(1),
        //       Component: lazy(
        //         () => import("@/modules/analytics/features/brand"),
        //       ),
        //     },
        //     {
        //       path: ROUTES.INGREDIENT.slice(1),
        //       Component: lazy(
        //         () => import("@/modules/analytics/features/ingredient"),
        //       ),
        //     },
        //   ],
        // },
        // // survey
        // {
        //   path: ROUTES.SURVEYS,
        //   Component: lazy(
        //     () => import("@/modules/survey/features/market-research-list"),
        //   ),
        // },
        // {
        //   path: ROUTES.SURVEY_CREATE,
        //   Component: lazy(
        //     () => import("@/modules/survey/features/market-research-create"),
        //   ),
        // },
        // {
        //   path: `${ROUTES.SURVEY_EDIT}/:id`,
        //   Component: lazy(
        //     () => import("@/modules/survey/features/market-research-create"),
        //   ),
        // },
        // {
        //   path: `${ROUTES.SURVEY}/:id`,
        //   Component: lazy(
        //     () => import("@/modules/survey/features/market-research-detail"),
        //   ),
        // },

        // company
        {
          path: ROUTES.COMPANIES,
          Component: lazy(() => import("@/features/company/list")),
        },
        {
          path: `${ROUTES.COMPANY_EDIT}/:id`,
          Component: lazy(() => import("@/features/company/edit")),
        },
        {
          path: `${ROUTES.COMPANY}/:id`,
          Component: lazy(() => import("@/features/company/edit")),
        },

        // chat
        // { path: "chat", Component: Chat },
        { path: ROUTES.INGREDIENT_DETAILS, Component: IngredientDetail },
      ],
    },
    {
      path: ROUTES.RELATIONSHIP_PREVIEW,
      Component: lazy(() => import("@/features/relationship-preview")),
    },
  ],
};
