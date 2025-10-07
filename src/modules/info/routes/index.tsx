import { lazy } from "react";
import type { RouteObject } from "react-router";
import { INFO_ROUTES } from "./constants";

export const infoRoutes: RouteObject = {
  children: [
    {
      path: INFO_ROUTES.INTRO.BASE,
      Component: lazy(() => import("@/modules/info/features/intro")),
    },
  ],
};
