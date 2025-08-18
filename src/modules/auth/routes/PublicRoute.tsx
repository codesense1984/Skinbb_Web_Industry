// components/route-guards/PublicRoute.tsx
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Navigate, Outlet } from "react-router";
import { ROUTES } from "@/core/routes/routes.constant";

const PublicRoute = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
