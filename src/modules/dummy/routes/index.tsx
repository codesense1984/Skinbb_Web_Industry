// routes/auth.routes.ts
import Dummy from "@/modules/dummy/features";
import { lazy } from "react";
import type { RouteObject } from "react-router";

import { ROUTE } from "@/core/routes/constant";

const DUMMY_BASE = "/dummy";
const CHART_BASE = "/charts";
const TABLE_BASE = "/tables";

export const DUMMY_ROUTES = {
  BASE: DUMMY_BASE,
  CHART: {
    BASE: CHART_BASE,
    LIST: ROUTE.build(DUMMY_BASE, CHART_BASE),
  },
  TABLE: {
    BASE: TABLE_BASE,
    LIST: ROUTE.build(DUMMY_BASE, TABLE_BASE),
  },
} as const;

export const dummyRoutes: RouteObject[] = [
  {
    path: "dummy",
    Component: Dummy,
    children: [
      {
        path: DUMMY_ROUTES.CHART.BASE,
        Component: lazy(() => import("@/modules/dummy/features/charts")),
      },
      {
        path: DUMMY_ROUTES.TABLE.BASE,
        Component: lazy(() => import("@/modules/dummy/features/table")),
      },
    ],
  },
];
