/**
 * IMPORTANT: This component was built for demo purposes only and has not been tested in production.
 * It serves as a proof of concept for a checkbox tree implementation.
 * If you're interested in collaborating to create a more robust, production-ready
 * headless component, your contributions are welcome!
 */

"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";

// Types
export interface TreeNode {
  id: string;
  label: string;
  defaultChecked?: boolean;
  children?: TreeNode[];
}

export type CheckStatus = boolean | "indeterminate";

export interface CheckboxTreeProps {
  tree: TreeNode;
  renderNode: (props: {
    node: TreeNode;
    isChecked: CheckStatus;
    onCheckedChange: () => void;
    children: React.ReactNode;
  }) => React.ReactNode;
  onChange?: (checkedIds: string[]) => void;
}

// Tree utilities
class TreeUtils {
  static buildMaps(tree: TreeNode) {
    const parentMap = new Map<string, TreeNode | null>();
    const nodeMap = new Map<string, TreeNode>();

    const walk = (node: TreeNode, parent: TreeNode | null) => {
      parentMap.set(node.id, parent);
      nodeMap.set(node.id, node);
      node.children?.forEach((child) => walk(child, node));
    };

    walk(tree, null);
    return { parentMap, nodeMap };
  }

  static getInitialCheckedNodes(tree: TreeNode): Set<string> {
    const checkedNodes = new Set<string>();

    const walk = (node: TreeNode) => {
      if (node.defaultChecked) {
        checkedNodes.add(node.id);
      }
      node.children?.forEach(walk);
    };

    walk(tree);
    return checkedNodes;
  }

  static computeCheckStatus(
    node: TreeNode,
    checkedSet: Set<string>,
  ): CheckStatus {
    if (!node.children || node.children.length === 0) {
      return checkedSet.has(node.id);
    }

    const childStatuses = node.children.map((child) =>
      this.computeCheckStatus(child, checkedSet),
    );

    if (childStatuses.every((status) => status === true)) {
      return true;
    }

    if (
      childStatuses.some(
        (status) => status === true || status === "indeterminate",
      )
    ) {
      return "indeterminate";
    }

    return false;
  }
}

// Custom hook for checkbox tree logic
function useCheckboxTree(
  initialTree: TreeNode,
  onChange?: (ids: string[]) => void,
) {
  // Build tree maps
  const { parentMap } = useMemo(
    () => TreeUtils.buildMaps(initialTree),
    [initialTree],
  );

  // Initialize checked nodes from defaultChecked flags
  const initialCheckedNodes = useMemo(
    () => TreeUtils.getInitialCheckedNodes(initialTree),
    [initialTree],
  );

  const [checkedNodes, setCheckedNodes] =
    useState<Set<string>>(initialCheckedNodes);

  // Normalize ancestors to ensure parent IDs reflect descendants
  const normalizeUpwards = useCallback(
    (startNode: TreeNode, set: Set<string>) => {
      let currentNode: TreeNode | null = startNode;

      while (currentNode) {
        const parent: TreeNode | null = parentMap.get(currentNode.id) ?? null;

        // Re-evaluate current node status
        const status = TreeUtils.computeCheckStatus(currentNode, set);

        if (status === true) {
          set.add(currentNode.id);
        } else {
          set.delete(currentNode.id);
        }

        currentNode = parent;
      }
    },
    [parentMap],
  );

  // Public method to check node status
  const isChecked = useCallback(
    (node: TreeNode): CheckStatus => {
      return TreeUtils.computeCheckStatus(node, checkedNodes);
    },
    [checkedNodes],
  );

  // Emit changes to parent component
  const emitChanges = useCallback(
    (set: Set<string>) => {
      onChange?.(Array.from(set));
    },
    [onChange],
  );

  // Handle checkbox toggle
  const handleCheck = useCallback(
    (node: TreeNode) => {
      const nextCheckedNodes = new Set(checkedNodes);

      // Toggle node and all descendants
      const toggleSubtree = (currentNode: TreeNode, shouldCheck: boolean) => {
        if (shouldCheck) {
          nextCheckedNodes.add(currentNode.id);
        } else {
          nextCheckedNodes.delete(currentNode.id);
        }
        currentNode.children?.forEach((child) =>
          toggleSubtree(child, shouldCheck),
        );
      };

      const currentStatus = TreeUtils.computeCheckStatus(
        node,
        nextCheckedNodes,
      );
      const newCheckState = currentStatus !== true; // Toggle: if fully checked, uncheck; else check

      toggleSubtree(node, newCheckState);

      // Normalize ancestors to reflect the new subtree state
      normalizeUpwards(node, nextCheckedNodes);

      setCheckedNodes(nextCheckedNodes);
      emitChanges(nextCheckedNodes);
    },
    [checkedNodes, normalizeUpwards, emitChanges],
  );

  // One-time normalization on mount to propagate defaultChecked to parents
  useEffect(() => {
    const nextCheckedNodes = new Set(checkedNodes);
    normalizeUpwards(initialTree, nextCheckedNodes);
    setCheckedNodes(nextCheckedNodes);
    emitChanges(nextCheckedNodes);
  }, [checkedNodes, emitChanges, initialTree, normalizeUpwards]); // Run once on mount

  return { isChecked, handleCheck };
}

// Main component
export function CheckboxTree({
  tree,
  renderNode,
  onChange,
}: CheckboxTreeProps) {
  const { isChecked, handleCheck } = useCheckboxTree(tree, onChange);

  const renderTreeNode = useCallback(
    (node: TreeNode): React.ReactNode => {
      const children = node.children?.map(renderTreeNode);

      return renderNode({
        node,
        isChecked: isChecked(node),
        onCheckedChange: () => handleCheck(node),
        children,
      });
    },
    [renderNode, isChecked, handleCheck],
  );

  return renderTreeNode(tree);
}
