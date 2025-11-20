import { lazy } from "react";
import type { RouteObject } from "react-router";
import { SURVEY_ROUTES } from "./constant";

export const surveyRoutes: RouteObject = {
  Component: lazy(() => import("@/core/layouts/main-layout")),
  children: [
    {
      path: SURVEY_ROUTES.LIST,
      Component: lazy(
        () => import("@/modules/survey/features/market-research-list"),
      ),
    },
    {
      path: SURVEY_ROUTES.CREATE,
      Component: lazy(
        () => import("@/modules/survey/features/market-research-create"),
      ),
    },
    {
      path: SURVEY_ROUTES.EDIT(),
      Component: lazy(
        () => import("@/modules/survey/features/market-research-create"),
      ),
    },
    {
      path: SURVEY_ROUTES.DETAIL(),
      Component: lazy(
        () => import("@/modules/survey/features/market-research-detail"),
      ),
    },
  ],
};
