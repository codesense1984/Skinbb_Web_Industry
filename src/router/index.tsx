import PageNotFound from "@/core/features/not-found";
import { authRoutes } from "@/modules/auth/routes";
import PrivateRoute from "@/modules/auth/routes/PrivateRoute";
import PublicRoute from "@/modules/auth/routes/PublicRoute";
import RoleBasedRouter from "@/modules/auth/routes/RoleBasedRouter";
import { panelOpenRoutes } from "@/modules/panel/routes";
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
      path: "*",
      element: <RoleBasedRouter />,
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
    Component: PageNotFound,
  },
]);
