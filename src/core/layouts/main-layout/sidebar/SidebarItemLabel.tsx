import { TreeItemLabel } from "@/core/components/ui/tree";
import { useSidebar } from "@/core/store/theme-provider";
import { camelToTitle, cn } from "@/core/utils";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { Role } from "@/modules/auth/types/permission.type.";
import type { ItemInstance } from "@headless-tree/core";
import React, { memo, useMemo } from "react";
import { NavLink, useLocation } from "react-router";
import { type SidebarItem } from "./sidebarItems";
import { getSidebarItems } from "./sidebarUtils";

function SidebarItemLabel({ item }: { item: ItemInstance<SidebarItem> }) {
  const location = useLocation();
  const { closeSidebar, isMobile } = useSidebar();
  const { role } = useAuth();
  const { href, icon, children } = item.getItemData();

  const sidebarItems = useMemo(() => getSidebarItems(role as Role), [role]);

  // Highlight folder when any descendant is active (kept from your behavior)
  const isChildActive = React.useCallback(
    (id: string): boolean => {
      const child = sidebarItems[id];
      if (!child) return false;
      if (child.href === location.pathname) return true;
      return child.children?.some(isChildActive) ?? false;
    },
    [location.pathname],
  );

  const isActiveFolder = React.useMemo(
    () =>
      (!href || href !== location.pathname) &&
      (children?.some(isChildActive) ?? false),
    [href, location.pathname, children, isChildActive],
  );

  const content = (
    <TreeItemLabel
      className={cn(
        "before:bg-background relative cursor-pointer px-3 py-2 not-in-data-[folder=true]:ps-3 before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10",
        isActiveFolder && "bg-accent",
      )}
    >
      <span className="-order-1 flex flex-1 items-center gap-3">
        {icon && React.isValidElement(icon)
          ? React.cloneElement(
              icon as React.ReactElement<{ className?: string }>,
              {
                className: cn(
                  "size-6",
                  (icon as React.ReactElement<{ className?: string }>).props
                    .className,
                ),
              },
            )
          : icon}
        {camelToTitle(item.getItemName())}
      </span>
    </TreeItemLabel>
  );

  if (!href) return content;

  return (
    <NavLink
      to={href}
      className="no-underline focus-visible:outline-none"
      onClick={() => isMobile && closeSidebar()}
    >
      {content}
    </NavLink>
  );
}

export default memo(SidebarItemLabel);
