import MainLayout from "@/core/layouts/main-layout";
import { lazy } from "react";
import type { RouteObject } from "react-router";
import { APP_USER_SURVEY_ROUTES } from "./constants";

export const appUserSurveyRoutes: RouteObject = {
  element: <MainLayout />,
  children: [
    {
      path: APP_USER_SURVEY_ROUTES.AVAILABLE,
      Component: lazy(
        () => import("@/modules/app-user/features/surveys/available-surveys"),
      ),
    },
    {
      path: APP_USER_SURVEY_ROUTES.TAKE(),
      Component: lazy(
        () => import("@/modules/app-user/features/surveys/survey-take"),
      ),
    },
    {
      path: APP_USER_SURVEY_ROUTES.MY_ATTEMPTS,
      Component: lazy(
        () => import("@/modules/app-user/features/surveys/my-attempts"),
      ),
    },
    {
      path: APP_USER_SURVEY_ROUTES.ATTEMPT_DETAIL(),
      Component: lazy(
        () => import("@/modules/app-user/features/surveys/attempt-detail"),
      ),
    },
  ],
};

