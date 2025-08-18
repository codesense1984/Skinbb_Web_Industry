import { useSelector } from "react-redux";
import { hasPermission, hasRole } from "../components/guard";
import type { RootState } from "@/core/store";

export function usePermission(page: string, action?: string) {
  const user = useSelector((state: RootState) => state.auth.user?.[0]);
  const permissions = user?.permissions ?? [];
  const role = user?.roleValue ?? "";

  return {
    canAccess: hasPermission(permissions, page, action),
    hasRole: (allowedRoles: string[]) => hasRole(role, allowedRoles),
    role,
  };
}
