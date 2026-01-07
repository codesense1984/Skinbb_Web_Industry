// components/route-guards/PublicRoute.tsx
import { ROUTES } from "@/core/routes/constant";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

const PublicRoute = () => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
