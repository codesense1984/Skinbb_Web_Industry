import { hasRole, hasPermission, type MatchMode } from "@auth/components/guard";
import {
  doctorSidebarItems,
  panelSidebarItems,
  sellerSidebarItems,
  type SidebarItem,
} from "./sidebarItems";
import {
  type Role,
  type Permission,
  ROLE,
} from "@/modules/auth/types/permission.type.";

/**
 * Returns whether the current user can see a given item.
 * @param item Sidebar item with optional role/permission rules.
 * @param userRole Current user role.
 * @param userPermissions Current user permissions.
 */
export const canSeeItem = (
  item: SidebarItem,
  userRole?: Role | null,
  userPermissions?: Permission[] | null,
): boolean => {
  const hasRoleRule =
    Array.isArray(item.requiredRoles) && item.requiredRoles.length > 0;
  const hasPermRule = !!item.requiredPermission;

  // 1) No constraints → visible to everyone
  if (!hasRoleRule && !hasPermRule) return true;

  // 2) Evaluate each rule only when present (short-circuit safe)
  const rolePass = hasRoleRule
    ? !!userRole && hasRole(userRole, item.requiredRoles!)
    : true;

  const permPass = hasPermRule
    ? hasPermission(
        userPermissions ?? undefined,
        item.requiredPermission!.page,
        item.requiredPermission!.action,
        (item.requiredPermission!.mode as MatchMode) ?? "any",
      )
    : true;

  // 3) If both present → must pass both
  return rolePass && permPass;
};

/**
 * Builds a visibility-pruned map from raw items.
 * Ensures folders remain only if at least one visible child remains.
 */
export const buildFilteredItems = (
  raw: Readonly<Record<string, SidebarItem>>,
  role?: Role | null,
  permissions?: Permission[] | null,
): Record<string, SidebarItem> => {
  const visible: Record<string, boolean> = {};

  const computeVisible = (id: string): boolean => {
    const node = raw[id];
    if (!node) return false;

    // Leaf node
    if (!node.children?.length) {
      return (visible[id] = canSeeItem(node, role, permissions));
    }

    // Folder node: self must be allowed AND it must keep at least one visible child
    const selfOk = canSeeItem(node, role, permissions);
    const childOk = (node.children ?? []).map(computeVisible).some(Boolean);
    return (visible[id] = selfOk && childOk);
  };

  computeVisible("sidebar");

  // Re-hydrate pruned tree
  const result: Record<string, SidebarItem> = {};
  for (const [id, node] of Object.entries(raw)) {
    if (!visible[id]) continue;
    result[id] = node.children?.length
      ? { ...node, children: node.children.filter((cid) => visible[cid]) }
      : node;
  }
  return result;
};

/** Get list of folder IDs that contain the active leaf path. */
export const findActiveParentFolders = (
  items: Readonly<Record<string, SidebarItem>>,
  currentPath: string,
): string[] => {
  const activeParents: string[] = [];
  const hasActiveChild = (itemId: string): boolean => {
    const item = items[itemId];
    if (!item) return false;
    if (item.href === currentPath) return true;
    return item.children?.some(hasActiveChild) ?? false;
  };
  Object.keys(items).forEach((id) => {
    const it = items[id];
    if (it.children?.length && hasActiveChild(id)) activeParents.push(id);
  });
  return activeParents;
};

/** Choose the current item id or a sensible fallback (dashboard → first child → root). */
export const getCurrentItemId = (
  items: Readonly<Record<string, SidebarItem>>,
  currentPath: string,
): string => {
  return (
    Object.entries(items).find(([, it]) => it.href === currentPath)?.[0] ??
    (items.dashboard
      ? "dashboard"
      : (items.sidebar?.children?.[0] ?? "sidebar"))
  );
};

export const getSidebarItems = (role: Role) => {
  if (role === ROLE.ADMIN) {
    return panelSidebarItems;
  }
  if (role === ROLE.DOCTOR) {
    return doctorSidebarItems;
  }
  return sellerSidebarItems;
};
