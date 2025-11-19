import MainLayout from "@/core/layouts/main-layout";
import { lazy } from "react";
import type { RouteObject } from "react-router";
import { SURVEY_ROUTES } from "./constant";

export const surveyRoutes: RouteObject = {
  element: <MainLayout />,
  children: [
    {
      path: SURVEY_ROUTES.LIST,
      Component: lazy(
        () => import("@/modules/survey/features/panel/survey-list"),
      ),
    },
    {
      path: SURVEY_ROUTES.CREATE,
      Component: lazy(
        () => import("@/modules/survey/features/panel/survey-form-wizard"),
      ),
    },
    {
      path: SURVEY_ROUTES.EDIT(),
      Component: lazy(
        () => import("@/modules/survey/features/panel/survey-form-wizard"),
      ),
    },
    {
      path: SURVEY_ROUTES.DETAIL(),
      Component: lazy(
        () => import("@/modules/survey/features/panel/survey-detail"),
      ),
    },
  ],
};
