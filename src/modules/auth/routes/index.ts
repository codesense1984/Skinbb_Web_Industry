import { lazy } from "react";
import type { RouteObject } from "react-router";
import { AUTH_ROUTES } from "./constants";
import AuthLayout from "@/core/layouts/AuthLayout";
import PublicRoute from "@/modules/auth/routes/PublicRoute";

export const authRoutes: RouteObject = {
  Component: PublicRoute,
  children: [
    {
      path: AUTH_ROUTES.BASE,
      Component: AuthLayout,
      children: [
        {
          path: AUTH_ROUTES.SIGN_IN_MAIN,
          Component: lazy(() => import("../features/sign-in")),
        },
        {
          path: AUTH_ROUTES.SIGN_UP,
          Component: lazy(() => import("../features/sign-up")),
        },
      ],
    },
    {
      path: AUTH_ROUTES.SIGN_IN,
      Component: lazy(() => import("../features/sign-in-simple")),
    },
  ],
};
