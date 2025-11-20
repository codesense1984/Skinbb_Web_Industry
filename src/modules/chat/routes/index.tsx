import { lazy } from "react";
import type { RouteObject } from "react-router";

export const CHAT_ROUTES = {
  CHAT: "/chat",
};

export const chatRoutes: RouteObject = {
  path: CHAT_ROUTES.CHAT,
  Component: lazy(() => import("@/core/layouts/main-layout")),
  children: [{ index: true, Component: lazy(() => import("@/modules/chat")) }],
};
