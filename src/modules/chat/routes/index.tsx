import MainLayout from "@/core/layouts/main-layout";
import PrivateRoute from "@/modules/auth/routes/PrivateRoute";
import { lazy } from "react";
import type { RouteObject } from "react-router";

export const chatRoutes: RouteObject = {
  path: "chat",
  Component: PrivateRoute,
  children: [
    {
      path: "",
      Component: MainLayout,
      children: [
        { index: true, Component: lazy(() => import("@/modules/chat")) },
      ],
    },
  ],
};
