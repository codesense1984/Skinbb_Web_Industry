import { Tree, TreeItem } from "@/core/components/ui/tree";
import { useAuth } from "@auth/hooks/useAuth";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import type { Role } from "@/modules/auth/types/permission.type.";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import SidebarItemLabel from "./SidebarItemLabel";
import { type SidebarItem } from "./sidebarItems";
import {
  buildFilteredItems,
  findActiveParentFolders,
  getCurrentItemId,
  getSidebarItems,
} from "./sidebarUtils";

const INDENT = 32;

export default function SidebarNavigation() {
  const location = useLocation();
  const { role, permissions } = useAuth();

  const sidebarItems = useMemo(() => getSidebarItems(role as Role), [role]);

  const filteredItems = useMemo(
    () => buildFilteredItems(sidebarItems, role, permissions),
    [role, permissions],
  );

  const { currentId, expandedItems } = useMemo(() => {
    const current = getCurrentItemId(filteredItems, location.pathname);
    const expanded = findActiveParentFolders(filteredItems, location.pathname);
    return { currentId: current, expandedItems: expanded };
  }, [filteredItems, location.pathname]);

  const tree = useTree<SidebarItem>({
    initialState: { selectedItems: [currentId], expandedItems },
    indent: INDENT,
    rootItemId: "sidebar",
    getItemName: (i) => i.getItemData().name,
    isItemFolder: (i) => (i.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (id) => filteredItems[id],
      getChildren: (id) => filteredItems[id]?.children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });

  useEffect(() => {
    // Deselect previous
    tree.getSelectedItems().forEach((sel) => sel?.deselect?.());

    // Select current
    tree
      .getItems()
      .find((it) => it.getId() === currentId)
      ?.select?.();

    // Expand active folders
    const itemsById = new Map(tree.getItems().map((it) => [it.getId(), it]));
    expandedItems.forEach((id) => itemsById.get(id)?.expand?.());
  }, [tree, currentId, expandedItems]);

  return (
    <nav
      className="flex h-full flex-col gap-2 *:first:grow"
      aria-label="Sidebar navigation"
    >
      <Tree
        className="relative before:absolute before:inset-0 before:-ms-2.5 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
        indent={INDENT}
        tree={tree}
      >
        {tree.getItems().map((node) => (
          <TreeItem key={node.getId()} item={node}>
            <SidebarItemLabel item={node} />
          </TreeItem>
        ))}
      </Tree>
    </nav>
  );
}
