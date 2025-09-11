import NotFound from "@/core/features/not-found";
import { analyticsRoutes } from "@/modules/analytics/routes";
import { authRoutes } from "@/modules/auth/routes";
import PrivateRoute from "@/modules/auth/routes/PrivateRoute";
import PublicRoute from "@/modules/auth/routes/PublicRoute";
import { chatRoutes } from "@/modules/chat/routes";
import { panelOpenRoutes, panelRoutes } from "@/modules/panel/routes";
import { surveyRoutes } from "@/modules/survey/routes";
import { createBrowserRouter, type RouteObject } from "react-router";

/* ----------------------------- helpers ----------------------------- */

// export function lazyWithPreload<T extends ComponentType<unknown>>(
//   importFn: () => Promise<{ default: T }>,
// ) {
//   // const C = ReactLazy(importFn) as LazyExoticComponent<T> & {
//   //   preload: () => Promise<{ default: T }>;
//   // };
//   // C.preload = importFn;
//   return C
// }

const protectedRoutes: RouteObject = {
  element: <PrivateRoute />,
  children: [
    {
      children: [panelRoutes, surveyRoutes, analyticsRoutes, chatRoutes],
    },
  ],
};

const publicRoutes: RouteObject = {
  element: <PublicRoute />,
  children: [authRoutes],
};

const openRoutes = {
  children: [...panelOpenRoutes],
};

// later you can import dashboardRoutes, brandRoutes, etc.
export const appRoutes = createBrowserRouter([
  publicRoutes,
  openRoutes,
  protectedRoutes,
  {
    path: "*",
    Component: NotFound,
  },
]);
