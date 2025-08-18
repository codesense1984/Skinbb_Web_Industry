import type { RouteObject } from "react-router";
import { SURVEY_ROUTES } from "./constant";
import { lazy } from "react";
import PrivateRoute from "@/modules/auth/routes/PrivateRoute";

export const surveyRoutes: RouteObject = {
  element: <PrivateRoute />,
  children: [
    {
      path: SURVEY_ROUTES.SURVEYS,
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
      path: `${SURVEY_ROUTES.EDIT()}`,
      Component: lazy(
        () => import("@/modules/survey/features/market-research-create"),
      ),
    },
    {
      path: `${SURVEY_ROUTES.DETAIL()}`,
      Component: lazy(
        () => import("@/modules/survey/features/market-research-detail"),
      ),
    },
  ],
};
