// import logo from "@/core/assets/images/logo-icon.png";
import { Tree, TreeItem, TreeItemLabel } from "@/core/components/ui/tree";
import { HorizontalLogo } from "@/core/config/svg";
import { useSidebar, useSidebarMobile } from "@/core/store/theme-provider";
import { ROUTES } from "@/core/routes/routes.constant";
import { camelToTitle, cn } from "@/core/utils";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
  type ItemInstance,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { BoltIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router";
import { Button } from "../../components/ui/button";
import { SURVEY_ROUTES } from "@/modules/survey/routes/constant";
const INDENT = 32;
interface Item {
  name: string;
  href?: string;
  children?: string[];
  current?: boolean;
  icon?: React.ReactNode;
}

const items: () => Record<string, Item> = () => ({
  sidebar: {
    name: "sidebar",
    children: [
      "dashboard",
      "company",
      "analytics",
      "surveys",
      "promotions",
      "listing",
      "users",
      "chat",
      "ingredient",
    ],
  },
  dashboard: {
    name: "dashboard",
    href: ROUTES.DASHBOARD,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
        />
      </svg>
    ),
  },
  // brands: {
  //   name: "brands",
  //   href: ROUTES.BRAND_LIST,
  //   icon: (
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       fill="none"
  //       viewBox="0 0 24 24"
  //       strokeWidth={1.5}
  //       stroke="currentColor"
  //     >
  //       <path
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //         d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
  //       />
  //     </svg>
  //   ),
  // },
  company: {
    name: "company",
    href: ROUTES.COMPANIES,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
        />
      </svg>
    ),
  },
  analytics: {
    name: "analytics",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
        />
      </svg>
    ),
    children: [
      "platform analysis",
      "brand analysis",
      "user insight",
      "market trends",
      "ingredient analysis",
    ],
  },
  "platform analysis": {
    name: "Platform insight",
    href: ROUTES.PLATFORM_ANALYTIC,
  },
  "brand analysis": {
    name: "Brand insight",
    href: ROUTES.BRAND_ANALYTIC,
  },
  "user insight": {
    name: "user insight",
    href: "/user-insight",
  },
  "market trends": {
    name: "market trends",
    href: "/market-trends",
  },
  "ingredient analysis": {
    name: "Ingredient insight",
    href: ROUTES.INGREDIENT_ANALYTIC,
  },
  surveys: {
    name: "surveys",
    href: SURVEY_ROUTES.SURVEYS,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </svg>
    ),
  },
  promotions: {
    name: "promotions",
    href: "/promo",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
  },
  listing: {
    name: "listing",
    href: "/listing",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
        />
      </svg>
    ),
  },
  users: {
    name: "users",
    href: "/users",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    ),
  },
  chat: {
    name: "chat",
    href: ROUTES.CHAT,
    icon: <BoltIcon />,
  },
  ingredient: {
    name: "ingredient",
    href: ROUTES.INGREDIENT_DETAILS,
    icon: <BuildingStorefrontIcon />,
  },
});

// Find all parent folders that have an active child
function findActiveParentFolders(
  items: Record<string, Item>,
  currentPath: string,
): string[] {
  const activeParents: string[] = [];

  // Check if any child of this folder is active
  const hasActiveChild = (itemId: string): boolean => {
    const item = items[itemId];
    if (!item) return false;

    if (item.href === currentPath) return true;

    return item.children?.some(hasActiveChild) ?? false;
  };

  // Find all folders that have an active child
  Object.entries(items).forEach(([id, item]) => {
    if (item.children?.length && hasActiveChild(id)) {
      activeParents.push(id);
    }
  });
  return activeParents;
}

function SidebarNavigation() {
  const location = useLocation();

  const { currentId, expandedItems } = useMemo(() => {
    const currentItemId =
      Object.entries(items()).find(
        ([_, item]) => item.href === location.pathname,
      )?.[0] ?? "dashboard";
    const expanded = findActiveParentFolders(items(), location.pathname);
    return { currentId: currentItemId, expandedItems: expanded };
  }, [location.pathname]);

  const tree = useTree<Item>({
    initialState: {
      selectedItems: [currentId],
      expandedItems,
    },
    indent: INDENT,
    rootItemId: "sidebar",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => items()[itemId],
      getChildren: (itemId) => items()[itemId].children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });

  useEffect(() => {
    if (!tree) return;

    tree.getSelectedItems().forEach((selectedItem) => {
      if (selectedItem && typeof selectedItem.deselect === "function") {
        selectedItem.deselect();
      }
    });
    const item = tree.getItems().find((item) => item.getId() === currentId);
    if (item && typeof item.select === "function") {
      item.select();
    }

    expandedItems.forEach((itemId) => {
      const folder = tree.getItems().find((item) => item.getId() === itemId);
      if (folder && typeof folder.expand === "function") {
        folder.expand();
      }
    });
  }, [tree, currentId, expandedItems]);

  return (
    <nav className="flex h-full flex-col gap-2 *:first:grow">
      <Tree
        className="relative before:absolute before:inset-0 before:-ms-2.5 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
        indent={INDENT}
        tree={tree}
      >
        {tree.getItems().map((item) => {
          return (
            <TreeItem key={item.getId()} item={item}>
              <SidebarItemLabel item={item} />
            </TreeItem>
          );
        })}
      </Tree>
    </nav>
  );
}

function SidebarItemLabel({ item }: { item: ItemInstance<Item> }) {
  const location = useLocation();
  const { closeSidebar, isMobile } = useSidebar();
  // const dispatch = useDispatch();
  const { href, icon, children } = item.getItemData();

  // Check if current item or any of its children are active
  const isActive = React.useMemo(() => {
    if (href === location.pathname) return false;

    const isChildActive = (childId: string): boolean => {
      const childItem = items()[childId];
      if (!childItem) return false;
      if (childItem.href === location.pathname) return true;
      return childItem.children?.some(isChildActive) ?? false;
    };

    return children?.some(isChildActive) ?? false;
  }, [href, children, location.pathname]);

  const labelContent = (
    <TreeItemLabel
      className={cn(
        "before:bg-background relative cursor-pointer px-3 py-2 not-in-data-[folder=true]:ps-3 before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10",
        isActive && "bg-accent",
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

  if (!href) {
    return labelContent;
  }

  return (
    <NavLink
      to={href}
      className={cn("no-underline focus-visible:outline-none")}
      onClick={() => {
        if (isMobile) closeSidebar();
      }}
    >
      {labelContent}
    </NavLink>
  );
}

const Sidebar = () => {
  const { isSidebarOpen, isMobile } = useSidebar();
  const { showOverlay, handleOverlayClick } = useSidebarMobile();
  const width = "w-[var(--sidebar-width)]";
  return (
    <>
      {showOverlay && (
        <button
          tabIndex={-1}
          className="fixed inset-0 z-10 flex h-full w-full items-center justify-center bg-[#00000060] backdrop-blur-[1px]"
          onClick={handleOverlayClick}
        ></button>
      )}
      <aside
        className={cn(
          "bg-background w1-60 fixed z-10 order-first h-dvh overflow-y-auto px-2 transition-all",
          width,
          !isSidebarOpen && "-translate-x-100",
          isMobile
            ? isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "",
        )}
      >
        <div className="bg-background sticky top-0 z-10 flex items-center justify-between border-b py-2">
          <NavLink
            to="/"
            className="data-[label=text]:text-primary flex h-10 items-center no-underline transition-all active:scale-98"
          >
            <HorizontalLogo className="h-7" />
            {/* <h1 className="text-primary px-2 text-xl font-bold">Skinn BB</h1> */}
          </NavLink>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground md:hidden"
            onClick={handleOverlayClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
        <div className="space-y-2 py-3">
          <SidebarNavigation />
        </div>
      </aside>

      <div
        className={cn(
          "w1-60 hidden transition-all md:block",
          width,
          !isSidebarOpen && "w-0",
        )}
      ></div>
    </>
  );
};

export default Sidebar;
