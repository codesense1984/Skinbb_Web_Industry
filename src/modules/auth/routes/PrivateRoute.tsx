import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { AUTH_ROUTES } from "./constants";
import { FullLoader } from "@/core/components/ui/loader";
import type { Permission } from "../types/permission.type.";

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
  const { user, isLoading, isError, signOut } = useAuth();

  if (isLoading) {
    return (
      <>
        <FullLoader isLogin />
        {/* <Outlet /> */}
      </>
    );
  }

  if (isError || !user) {
    signOut();
    // Bad/missing user -> consider clearing cookies and redirect
    return <Navigate to={AUTH_ROUTES.SIGN_IN} replace />;
  }

  // if (!user) {
  //   // dispatch(logout());
  //   return <Navigate to={AUTH_ROUTES.SIGN_IN} replace />;
  // }

  // Role check
  if (requiredRole && user.roleValue !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Permission check
  if (requiredPage && requiredAction) {
    const hasPermission = user.permissions.some(
      (perm: Permission) =>
        perm.page === requiredPage && perm.action.includes(requiredAction),
    );

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
