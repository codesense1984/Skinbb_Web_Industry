import NotFound from "@/features/not-found";
import { createBrowserRouter } from "react-router";
import { authRoutes } from "./auth.routes";
import { dashboardRoutes } from "./dashboard.routes";
import { dummyRoutes } from "./dummy.routes";

// later you can import dashboardRoutes, brandRoutes, etc.
export const appRoutes = createBrowserRouter([
  ...dashboardRoutes,
  ...authRoutes,
  ...dummyRoutes,
  
  {
    path: "*",
    Component: NotFound,
  },
]);
