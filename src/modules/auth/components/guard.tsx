import type React from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Permission, Role } from "../types/permission.type.";

export type MatchMode = "any" | "all";

/** ──────────────────────────────────────────────────────────────
 * hasPermission: supports single string or string[], with OR/AND
 * ────────────────────────────────────────────────────────────── */

export function hasPermission(
  permissions: Permission[] | undefined,
  page: string,
  actions?: string | string[],
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

export function hasRole(userRole: string, allowedRoles: string[]) {
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

/** ──────────────────────────────────────────────────────────────
 * WithPermission: accepts single or multiple actions + mode
 * ────────────────────────────────────────────────────────────── */

interface WithPermissionProps {
  page: string;
  /** Single action or list, e.g. "create" or ["create","update"] */
  action?: string | string[];
  /** "any" (OR) | "all" (AND). Default: "any" */
  mode?: MatchMode;
  children: ReactNode;
  fallback?: ReactNode;
}

export const WithPermission: React.FC<WithPermissionProps> = ({
  page,
  action,
  mode = "any",
  children,
  fallback = null,
}) => {
  // const permissions =
  //   useSelector((state: RootState) => state.auth.user?.permissions) ?? [];
  const { permissions } = useAuth();

  const allowed = hasPermission(permissions, page, action, mode);
  return <>{allowed ? children : fallback}</>;
};

// // OR logic (default): create OR update
// <WithPermission page="posts" action={["create", "update"]}>
//   <Button>Save</Button>
// </WithPermission>

// // AND logic: must have BOTH create AND update
// <WithPermission page="posts" action={["create", "update"]} mode="all">
//   <Button>Publish</Button>
// </WithPermission>

// // Single action still works
// <WithPermission page="categories" action="view">
//   <CategoriesTable />
// </WithPermission>

// // No action passed → any access on page is enough
// <WithPermission page="tags">
//   <TagsPanel />
// </WithPermission>

// // Replace with disabled fallback when not allowed
// <WithPermission
//   page="posts"
//   action={["delete", "update"]}
//   fallback={<Button disabled>Restricted</Button>}
// >
//   <Button>Danger Zone</Button>
// </WithPermission>
