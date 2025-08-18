// routes/auth.routes.ts
import Dummy from "@/features/dummy";
import type { RouteObject } from "react-router";
import { ROUTES } from "./routes.constant";
import { lazy } from "react";

export const dummyRoutes: RouteObject[] = [
  {
    path: "dummy",
    Component: Dummy,
    children: [
      {
        path: ROUTES.D_CHARTS,
        Component: lazy(() => import("@/features/dummy/charts")),
      },
      {
        path: ROUTES.D_TABLE,
        Component: lazy(() => import("@/features/dummy/table")),
      },
    ],
  },
];
