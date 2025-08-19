import MainLayout from "@/core/layouts/main-layout";
import NotFound from "@/features/not-found";
import { analyticsRoutes } from "@/modules/analytics/routes";
import { authRoutes } from "@/modules/auth/routes";
import { surveyRoutes } from "@/modules/survey/routes";
import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { dashboardRoutes } from "../core/routes/dashboard.routes";
import { dummyRoutes } from "../core/routes/dummy.routes";
import { ROUTES } from "../core/routes/routes.constant";
import { chatRoutes } from "@/modules/chat/routes";

// later you can import dashboardRoutes, brandRoutes, etc.
export const appRoutes = createBrowserRouter([
  authRoutes,
  { Component: MainLayout, children: [surveyRoutes] },
  dashboardRoutes,
  analyticsRoutes,
  chatRoutes,
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
