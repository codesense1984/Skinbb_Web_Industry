import type React from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import type {
  Permission,
  PermissionElement,
  Role,
} from "../types/permission.type.";

export type MatchMode = "any" | "all";

/** ──────────────────────────────────────────────────────────────
 * hasPermission: supports single string or string[], with OR/AND
 * ────────────────────────────────────────────────────────────── */

export function hasPermission(
  permissions: Permission[] | undefined,
  page: Permission["page"],
  actions?: PermissionElement | ReadonlyArray<PermissionElement>,
  mode: MatchMode = "any", // default OR
): boolean {
  if (!permissions) return false;

  const pagePerm = permissions.find((p) => p.page === page);
  if (!pagePerm) return false;

  // no actions provided → just check user has any action on that page
  if (!actions || (Array.isArray(actions) && actions.length === 0)) {
    return pagePerm.action.length > 0;
  }

  const required = Array.isArray(actions) ? actions : [actions];

  if (mode === "all") {
    // AND: user must have every required action
    return required.every((a) => pagePerm.action.includes(a));
  }
  // ANY: user must have at least one required action
  return required.some((a) => pagePerm.action.includes(a));
}

// // ✅ hasPermission + WithPermission usage examples

// // Check if user has at least one of [create, update] on "posts"
// const canSave = hasPermission(user.permissions, "posts", ["create", "update"]);

// // Check if user has BOTH "create" and "update" on "posts"
// const canPublish = hasPermission(
//   user.permissions,
//   "posts",
//   ["create", "update"],
//   "all"
// );

// // Check if user has any permission on "tags"
// const canSeeTags = hasPermission(user.permissions, "tags");

export function hasRole(userRole: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(userRole);
}

type Props = {
  roles: Role[]; // allowed roles
  children: ReactNode;
  fallback?: ReactNode;
};

export const WithRole: React.FC<Props> = ({
  roles,
  children,
  fallback = null,
}) => {
  // const role = useSelector((state: RootState) => state.auth.user?.roleValue);
  const { role } = useAuth();

  if (!role) return <>{fallback}</>;

  return <>{roles.includes(role) ? children : fallback}</>;
};

// /// Visible only to admins
// <WithRole roles={["admin"]} fallback={<p>Admins only</p>}>
//   <div className="card">Secret Admin Settings</div>
// </WithRole>

// // Allow multiple roles
// <WithRole roles={["editor", "admin"]}>
//   <EditorDashboard />
// </WithRole>

type AccessLogic = "and" | "or";

type AccessCheckInput = {
  /** From auth */
  userRole?: Role;
  userPermissions?: Permission[];

  /** Role gate */
  roles?: Role[]; // allowed roles (optional)

  /** Permission gate */
  page?: Permission["page"];
  actions?: PermissionElement | ReadonlyArray<PermissionElement>;
  mode?: MatchMode; // "any" | "all" for actions on a page (default "any")

  /** How to combine role + permission checks when BOTH are provided. Default: "and" */
  logic?: AccessLogic;
};

/**
 * hasAccess: one-stop check for role and/or permission.
 * - If only roles are provided → checks roles.
 * - If only page/actions are provided → checks permissions.
 * - If both are provided → combines using logic ("and" | "or"; default "and").
 * - If neither is provided → returns false.
 */
export function hasAccess({
  userRole,
  userPermissions,
  roles,
  page,
  actions,
  mode = "any",
  logic = "and",
}: AccessCheckInput): boolean {
  const hasRoleResult =
    roles && roles.length > 0 && userRole
      ? hasRole(userRole, roles)
      : undefined;

  const hasPermResult = page
    ? hasPermission(userPermissions, page, actions, mode)
    : undefined;

  // nothing to check
  if (hasRoleResult === undefined && hasPermResult === undefined) return false;

  // only one side provided
  if (hasRoleResult !== undefined && hasPermResult === undefined) {
    return hasRoleResult;
  }
  if (hasRoleResult === undefined && hasPermResult !== undefined) {
    return hasPermResult;
  }

  // both provided → combine
  if (logic === "or") {
    return Boolean(hasRoleResult || hasPermResult);
  }
  // default AND
  return Boolean(hasRoleResult && hasPermResult);
}

// // Only role-based
// hasAccess({ userRole: role, roles: ["admin"] });

// // Only permission-based
// hasAccess({
//   userPermissions,
//   page: "posts",
//   actions: ["create", "update"], // OR by default
// });

// // Role AND Permission (default)
// hasAccess({
//   userRole: role,
//   roles: ["editor", "admin"],
//   userPermissions,
//   page: "posts",
//   actions: "publish",
//   mode: "all",
// });

// // Role OR Permission
// hasAccess({
//   userRole: role,
//   roles: ["admin"],
//   userPermissions,
//   page: "reports",
//   actions: "view",
//   logic: "or",
// });

type WithAccessProps = Omit<AccessCheckInput, "userRole" | "permissions"> & {
  children: ReactNode;
  fallback?: ReactNode;
};

export const WithAccess: React.FC<WithAccessProps> = ({
  roles,
  page,
  actions,
  mode = "any",
  logic = "and",
  children,
  fallback = null,
}) => {
  const { role: userRole, permissions } = useAuth();
  const allowed = hasAccess({
    userRole,
    userPermissions: permissions,
    roles,
    page,
    actions,
    mode,
    logic,
  });
  return <>{allowed ? children : fallback}</>;
};
