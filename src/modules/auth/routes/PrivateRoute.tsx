import type { RootState } from "@/core/store";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";
import { AUTH_ROUTES } from "./constants";

interface PrivateRouteProps {
  requiredRole?: string;
  requiredPage?: string;
  requiredAction?: string;
}

const PrivateRoute = ({
  requiredRole,
  requiredPage,
  requiredAction,
}: PrivateRouteProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <Navigate to={AUTH_ROUTES.SIGN_IN} replace />;
  }

  // Role check
  if (requiredRole && user[0].roleValue !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Permission check
  if (requiredPage && requiredAction) {
    const hasPermission = user[0].permissions.some(
      (perm) =>
        perm.page === requiredPage && perm.action.includes(requiredAction),
    );

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
