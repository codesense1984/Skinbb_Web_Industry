import { FullLoader } from "@/core/components/ui/loader";
import { chatRoutes } from "@/modules/chat/routes";
import { panelRoutes } from "@/modules/panel/routes";
import { sellerRoutes } from "@/modules/seller/routes";
import { doctorRoutes } from "@/modules/doctor/routes";
import { distributorRoutes } from "@/modules/distributor/routes";
import { manufacturerRoutes } from "@/modules/manufacturer/routes";
import { formulatorRoutes } from "@/modules/formulator/routes";
import React from "react";
import { Navigate, useRoutes } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ROLE } from "../types/permission.type.";
import { surveyRoutes } from "@/modules/survey/routes";
import { analyticsRoutes } from "@/modules/analytics/routes";

const RoleBasedRouter: React.FC = () => {
  const { user, isLoading, isError, signOut, role } = useAuth();

  if (isLoading) {
    return <FullLoader isLogin />;
  }

  if (isError || !user) {
    signOut();
    return <Navigate to="/sign-in" replace />;
  }

  // Define routes based on user role
  let routes = [];

  if (role === ROLE.ADMIN) {
    routes = [panelRoutes, surveyRoutes, analyticsRoutes, chatRoutes];
  } else if (role === ROLE.SELLER) {
    routes = [sellerRoutes];
  } else if (role === ROLE.DOCTOR) {
    routes = [doctorRoutes];
  } else if (role === ROLE.DISTRIBUTOR) {
    routes = [distributorRoutes];
  } else if (role === ROLE.MANUFACTURER) {
    routes = [manufacturerRoutes];
  } else if (role === ROLE.FORMULATOR) {
    routes = [formulatorRoutes];
  } else {
    // Default customer routes or unauthorized
    routes = [
      {
        path: "/",
        element: (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h1>Welcome Customer!</h1>
            <p>Customer features coming soon...</p>
          </div>
        ),
      },
      {
        path: "*",
        element: (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h1>404 - Page Not Found</h1>
            <p>Customer: This page doesn't exist.</p>
          </div>
        ),
      },
    ];
  }

  return useRoutes(routes);
};

export default RoleBasedRouter;
