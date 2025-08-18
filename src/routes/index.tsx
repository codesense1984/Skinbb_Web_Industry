import NotFound from "@/features/not-found";
import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { authRoutes } from "./auth.routes";
import { dashboardRoutes } from "./dashboard.routes";
import { dummyRoutes } from "./dummy.routes";
import { ROUTES } from "./routes.constant";

// later you can import dashboardRoutes, brandRoutes, etc.
export const appRoutes = createBrowserRouter([
  ...dashboardRoutes,
  ...authRoutes,
  ...dummyRoutes,

  {
    path: ROUTES.COMPANY_ONBOARD,
    Component: lazy(() => import("@/features/company/onboard")),
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
