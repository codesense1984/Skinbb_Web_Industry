import { hasPermission, hasRole } from "../components/guard";
import { useAuth } from "./useAuth";

export function usePermission(page: string, action?: string) {
  // const user = useSelector((state: RootState) => state.auth.user);
  const { permissions, role } = useAuth();
  // const permissions = user?.permissions ?? [];
  // const role = user?.roleValue ?? "";

  return {
    canAccess: hasPermission(permissions, page, action),
    hasRole: (allowedRoles: string[]) => hasRole(role, allowedRoles),
    role,
  };
}
